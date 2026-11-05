"""Todos os produtos, pedidos e responsáveis desta suíte são FICTÍCIOS."""
from __future__ import annotations

import copy
import csv
import io
import json
import tempfile
import unittest
from unittest.mock import patch
from contextlib import redirect_stdout
from datetime import datetime, timedelta, timezone
from pathlib import Path

from tools.conciliacao.csvio import csv_bytes, read_table, quantity, digest
from tools.conciliacao.engine import reconcile, REVIEW_HEADERS
from tools.conciliacao.audit import create_case, create_plan, export_final, private_path, REPO, PRIVATE
from tools.conciliacao.__main__ import main

NOW = datetime(2026, 11, 5, 15, 0, tzinfo=timezone.utc)
ALLOCATION_HEADERS = ["codigo_ficticio", "reserva_ficticia", "pendente_ficticio", "outro_ficticio", "pedidos_ficticios", "conferido_ficticio", "aprovador_ficticio", "data_ficticia", "referencia_ficticia"]


def adapter(columns, encoding="utf-8", delimiter=","):
    return {"encoding": encoding, "delimiter": delimiter, "columns": columns, "quantity_format": "integer"}


def config(now=NOW):
    return {"schema_version": 1, "snapshot_at": (now - timedelta(minutes=1)).isoformat(), "max_age_minutes": 60, "adapters": {
        "sysala": adapter({"sku": "codigo_ficticio", "quantity": "saldo_ficticio"}),
        "nuvemshop": adapter({"sku": "codigo_ficticio", "quantity": "saldo_ficticio"}),
        "mapping": adapter({"sysala_sku": "fisico_ficticio", "online_sku": "online_ficticio"}),
        "allocations": adapter(dict(zip(["sku", "allocated", "pending_sales", "holds", "pending_refs", "orders_reviewed", "approved_by", "approved_at", "reference"], ALLOCATION_HEADERS, strict=True)))}, "final_format": None}


def stock(rows, **kwargs):
    return csv_bytes(["codigo_ficticio", "saldo_ficticio"], rows, **kwargs)


def reserve(key="FICT-01", allocated=8, pending=0, holds=0, **overrides):
    row = dict(zip(ALLOCATION_HEADERS, [key, allocated, pending, holds, "FICT-PED-001" if pending else "", "sim", "EQUIPE-FICTICIA", (NOW - timedelta(minutes=2)).isoformat(), "FICT-RESERVA-001"], strict=True))
    row.update(overrides)
    return [row[h] for h in ALLOCATION_HEADERS]


def inputs(physical=10, online=8, allocated=8, pending=0, holds=0):
    return {"sysala": stock([["FICT-01", physical]]), "nuvemshop": stock([["FICT-01", online]]), "allocations": csv_bytes(ALLOCATION_HEADERS, [reserve(allocated=allocated, pending=pending, holds=holds)])}


class ReconcileTests(unittest.TestCase):
    def codes(self, result):
        return {i["code"] for i in result["issues"]}

    def test_equal_balances(self):
        r = reconcile(config(), inputs(8, 8), NOW)
        self.assertEqual(r["summary"]["critical"], 0)
        self.assertEqual(r["rows"][0]["physical_minus_online"], 0)

    def test_physical_balance_is_not_an_online_target(self):
        r = reconcile(config(), inputs(100, 8), NOW)
        self.assertEqual(r["rows"][0]["ceiling"], 8)
        self.assertIn("balance_difference", self.codes(r))
        self.assertEqual(r["summary"]["critical"], 0)

    def test_excess_online_is_critical(self):
        self.assertIn("online_above_ceiling", self.codes(reconcile(config(), inputs(10, 9), NOW)))

    def test_unposted_sale_is_counted_once(self):
        r = reconcile(config(), inputs(100, 5, 8, 3), NOW)
        self.assertEqual(r["rows"][0]["ceiling"], 5)
        self.assertEqual(r["summary"]["pending_sales_units"], 3)
        self.assertIn("unposted_online_sales", self.codes(r))
        self.assertNotIn("online_above_ceiling", self.codes(r))

    def test_other_holds_reduce_the_gross_allocation(self):
        r = reconcile(config(), inputs(10, 5, 8, 2, 1), NOW)
        self.assertEqual(r["rows"][0]["ceiling"], 5)

    def test_allocation_above_physical_is_not_clamped(self):
        r = reconcile(config(), inputs(3, 2, 8), NOW)
        self.assertIn("allocation_above_physical", self.codes(r))
        self.assertIsNone(r["rows"][0]["ceiling"])

    def test_no_negative_cap_from_commitments(self):
        self.assertIn("overconsumed_allocation", self.codes(reconcile(config(), inputs(10, 2, 2, 3), NOW)))

    def test_missing_online_correspondence(self):
        data = inputs(); data["sysala"] = stock([["FICT-OUTRO", 10]])
        self.assertIn("unmatched_online", self.codes(reconcile(config(), data, NOW)))

    def test_physical_only_product_is_not_exported(self):
        data = inputs(); data["sysala"] = stock([["FICT-01", 10], ["FICT-FISICO", 3]])
        r = reconcile(config(), data, NOW)
        self.assertIn("physical_only", self.codes(r))
        self.assertEqual(len(r["rows"]), 1)

    def test_duplicates_in_either_stock_block(self):
        for source in ("sysala", "nuvemshop"):
            with self.subTest(source=source):
                data = inputs(); data[source] = stock([["FICT-01", 8], [" FICT-01 ", 3]])
                self.assertIn("duplicate_sku", self.codes(reconcile(config(), data, NOW)))

    def test_explicit_bijective_mapping(self):
        data = inputs(); data["sysala"] = stock([["FICT-ERP", 10]])
        data["mapping"] = csv_bytes(["fisico_ficticio", "online_ficticio"], [["FICT-ERP", "FICT-01"]])
        r = reconcile(config(), data, NOW)
        self.assertEqual(r["summary"]["critical"], 0)
        self.assertEqual(r["rows"][0]["sysala_sku"], "FICT-ERP")

    def test_ambiguous_mapping_blocks(self):
        data = inputs(); data["mapping"] = csv_bytes(["fisico_ficticio", "online_ficticio"], [["FICT-01", "FICT-01"], ["FICT-01", "FICT-02"]])
        self.assertIn("mapping_collision", self.codes(reconcile(config(), data, NOW)))

    def test_identity_and_mapping_cannot_share_a_physical_pool(self):
        data = inputs(); data["nuvemshop"] = stock([["FICT-01", 4], ["FICT-02", 4]])
        data["allocations"] = csv_bytes(ALLOCATION_HEADERS, [reserve(), reserve("FICT-02", 4)])
        data["mapping"] = csv_bytes(["fisico_ficticio", "online_ficticio"], [["FICT-01", "FICT-02"]])
        self.assertIn("shared_physical_sku", self.codes(reconcile(config(), data, NOW)))

    def test_no_implicit_zero_or_negative_quantity(self):
        for value in ["", "-1", "1.5", "1,5", "1e2", "NaN"]:
            with self.subTest(value=value):
                data = inputs(); data["sysala"] = f'codigo_ficticio,saldo_ficticio\nFICT-01,"{value}"\n'.encode()
                self.assertIn("invalid_stock", self.codes(reconcile(config(), data, NOW)))

    def test_missing_allocation_and_unreviewed_orders_block(self):
        for rows in [[], [reserve(conferido_ficticio="nao")], [reserve(aprovador_ficticio="")], [reserve(pending=1, pedidos_ficticios="")], [reserve(), reserve()]]:
            with self.subTest(rows=rows):
                data = inputs(); data["allocations"] = csv_bytes(ALLOCATION_HEADERS, rows)
                self.assertGreater(reconcile(config(), data, NOW)["summary"]["critical"], 0)

    def test_missing_or_stale_cutoff_blocks(self):
        for value in ["", "sem-data", (NOW - timedelta(days=1)).isoformat(), (NOW + timedelta(minutes=1)).isoformat()]:
            with self.subTest(value=value):
                cfg = config(); cfg["snapshot_at"] = value
                self.assertGreater(reconcile(cfg, inputs(), NOW)["summary"]["critical"], 0)

    def test_incomplete_missing_header_or_bad_encoding(self):
        for data in [b"codigo_ficticio,saldo_ficticio\nFICT-01\n", b"codigo_ficticio,outra\nFICT-01,8\n", b"codigo_ficticio,saldo_ficticio\nFICT-\xff,8\n", b'codigo_ficticio,saldo_ficticio\n"unterminated,8']:
            with self.subTest(data=data):
                source = inputs(); source["sysala"] = data
                self.assertIn("invalid_file", self.codes(reconcile(config(), source, NOW)))

    def test_encoding_bom_and_delimiters_are_explicit(self):
        for encoding, delimiter in [("utf-8-sig", ","), ("utf-16", "\t"), ("cp1252", ";"), ("latin-1", "|")]:
            with self.subTest(encoding=encoding):
                cfg = config(); cfg["adapters"]["sysala"].update(encoding=encoding, delimiter=delimiter)
                data = inputs(); data["sysala"] = stock([["FICT-01", 10]], encoding=encoding, delimiter=delimiter)
                self.assertEqual(reconcile(cfg, data, NOW)["summary"]["critical"], 0)
        head, rows = read_table('Código fictício;Saldo fictício\r\nFICT-MAÇÃ;8\r\n'.encode('cp1252'), {"encoding":"cp1252","delimiter":";"})
        self.assertEqual(rows[0][head[0]], "FICT-MAÇÃ")

    def test_zeroes_and_decimal_mode(self):
        data = inputs(); data["nuvemshop"] = stock([["0001", 0]])
        data["sysala"] = stock([["0001", 0]]); data["allocations"] = csv_bytes(ALLOCATION_HEADERS, [reserve("0001",0)])
        self.assertEqual(reconcile(config(), data, NOW)["rows"][0]["online_sku"], "0001")
        self.assertEqual(quantity("2,00", "decimal_comma_integral"), 2)
        self.assertEqual(quantity("2.000", "decimal_dot_integral"), 2)
        with self.assertRaises(ValueError):quantity("2,50", "decimal_comma_integral")


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        PRIVATE.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix="teste-conciliacao-", dir=PRIVATE)
        self.root = Path(self.temp.name)
        self.cfg = config()
        # FICTITIOUS test-only format, not a real Nuvemshop import specification.
        self.template = self.root / "modelo-FICTICIO.csv"
        self.template.write_bytes(b'codigo_ficticio,saldo_ficticio\n')
        self.cfg["final_format"] = {"confirmed": True, "stock_only_update_confirmed": True, "quantity_semantics": "absolute_available", "confirmed_by": "FICTICIO-TESTE", "confirmed_at": (NOW-timedelta(minutes=2)).isoformat(), "reference": "FICTICIO, SOMENTE TESTE; NAO E MODELO OFICIAL", "template_path": str(self.template), "encoding": "utf-8", "delimiter": ",", "identifier_source_column": "codigo_ficticio", "columns": [{"header":"codigo_ficticio","source_column":"codigo_ficticio"},{"header":"saldo_ficticio","quantity":True}]}
        self.paths = {}
        for key, data in inputs(10, 8, 6).items():
            path = self.root / f"FICTICIO-{key}.csv";path.write_bytes(data);self.paths[key]=path
        self.config_path=self.root/'config.json';self.save_config()
        self.case=self.root/'caso';self.manifest,self.report=create_case(self.config_path,self.paths,self.case,NOW)

    def tearDown(self):
        self.temp.cleanup()

    def save_config(self):
        self.config_path.write_text(json.dumps(self.cfg),encoding='utf-8')

    def plan(self, proposed="6", **changes):
        record=dict(zip(REVIEW_HEADERS,["FICT-01",proposed,"FICTICIO: confirmar reserva","EQUIPE-FICTICIA",(NOW+timedelta(seconds=1)).isoformat()],strict=True));record.update(changes)
        path=self.root/'revisao.csv';path.write_bytes(csv_bytes(REVIEW_HEADERS,[[record[k] for k in REVIEW_HEADERS]]))
        plan_path=self.root/f'plano-{len(list(self.root.glob("plano-*")))}'
        return plan_path,create_plan(self.case,path,plan_path,NOW+timedelta(seconds=2))

    def approval(self, plan, **changes):
        data={"approved":True,"approved_by":"APROVADOR-FICTICIO","approved_at":(NOW+timedelta(seconds=3)).isoformat(),"plan_sha256":plan['plan_sha256'],"controlled_window":True,"movements_reviewed":True,"physical_allocation_confirmed":True};data.update(changes)
        path=self.root/'aprovacao.json';path.write_text(json.dumps(data),encoding='utf-8');return path

    def final(self, plan_path, plan, approval=None, now=None, confirmation=None):
        return export_final(self.case,plan_path,approval or self.approval(plan),self.paths,self.root/'final',confirmation or plan['plan_sha256'],now or NOW+timedelta(seconds=4))

    def test_origins_are_preserved_and_no_final_in_simulation(self):
        for name,path in self.paths.items():self.assertEqual(path.read_bytes(),(self.case/'originals'/f'{name}.csv').read_bytes())
        self.assertFalse((self.case/'estoque-aprovado.csv').exists())
        self.assertIn('origins',self.manifest)
        self.assertEqual(len(list(self.case.glob('*.csv'))),2)

    def test_human_review_can_resolve_excess_without_copying_erp(self):
        before={k:digest(p.read_bytes()) for k,p in self.paths.items()}
        plan_path,plan=self.plan();self.assertEqual(plan['blockers'],[])
        self.assertFalse(json.loads((plan_path/'approval.example.json').read_text())['approved'])
        self.final(plan_path,plan)
        _,rows=read_table((self.root/'final/estoque-aprovado.csv').read_bytes(),{"encoding":"utf-8","delimiter":","})
        self.assertEqual(rows[0]['saldo_ficticio'],'6')
        self.assertEqual(before,{k:digest(p.read_bytes()) for k,p in self.paths.items()})
        self.assertFalse(json.loads((self.root/'final/audit.json').read_text())['import_performed'])

    def test_negative_blank_or_excess_proposal_blocks(self):
        for value in ['', '-1', '7']:
            with self.subTest(value=value):
                # Raw negative text is intentionally tested without spreadsheet escaping.
                path=self.root/'revisao.csv';path.write_text(','.join(REVIEW_HEADERS)+f'\nFICT-01,{value},FICTICIO,FICTICIO,{(NOW+timedelta(seconds=1)).isoformat()}\n')
                out=self.root/f'plano-{len(list(self.root.glob("plano-*")))}';plan=create_plan(self.case,path,out,NOW+timedelta(seconds=2))
                self.assertTrue(plan['blockers'])
                with self.assertRaises(ValueError):self.final(out,plan)
        self.assertFalse((self.root/'final').exists())

    def test_missing_justification_incomplete_or_duplicate_review(self):
        for record in [[['FICT-01','6','','FICTICIO',(NOW+timedelta(seconds=1)).isoformat()]],[],[['FICT-01','6','FICTICIO','FICTICIO',(NOW+timedelta(seconds=1)).isoformat()]]*2]:
            path=self.root/'revisao.csv';path.write_bytes(csv_bytes(REVIEW_HEADERS,record))
            out=self.root/f'plano-{len(list(self.root.glob("plano-*")))}';plan=create_plan(self.case,path,out,NOW+timedelta(seconds=2));self.assertTrue(plan['blockers'])

    def test_approval_flags_hash_and_date_are_mandatory(self):
        out,plan=self.plan()
        for changes in [{'approved':False},{'approved_by':''},{'plan_sha256':'wrong'},{'controlled_window':False},{'movements_reviewed':False},{'physical_allocation_confirmed':False},{'approved_at':NOW.isoformat()},{'approved_at':(NOW+timedelta(days=1)).isoformat()}]:
            with self.subTest(changes=changes):
                with self.assertRaises(ValueError):self.final(out,plan,self.approval(plan,**changes))
        with self.assertRaises(ValueError):self.final(out,plan,confirmation='outro-hash')
        self.assertFalse((self.root/'final').exists())

    def test_changed_sources_and_expired_snapshot_block(self):
        out,plan=self.plan()
        for source in self.paths.values():
            data=source.read_bytes();source.write_bytes(data+b'\n')
            with self.assertRaises(ValueError):self.final(out,plan)
            source.write_bytes(data)
        with self.assertRaises(ValueError):self.final(out,plan,now=NOW+timedelta(hours=2))

    def test_case_or_plan_tampering_blocks(self):
        out,plan=self.plan();path=out/'plan.json';data=path.read_bytes();path.chmod(0o600);p=json.loads(data);p['decisions'][0]['proposed']=100;path.write_text(json.dumps(p))
        with self.assertRaises(ValueError):self.final(out,plan)
        path.write_bytes(data)
        original=self.case/'originals/sysala.csv';original.chmod(0o600);original.write_bytes(b'tampered')
        with self.assertRaises(ValueError):self.final(out,plan)

    def test_unknown_official_format_cannot_produce_final(self):
        self.cfg['final_format']=None;self.save_config();self.case=self.root/'caso-sem-modelo';create_case(self.config_path,self.paths,self.case,NOW)
        out,plan=self.plan()
        with self.assertRaisesRegex(ValueError,'Formato oficial'):self.final(out,plan)
        self.assertFalse((self.root/'final').exists())

    def test_official_header_or_identifier_mismatch_blocks(self):
        base = copy.deepcopy(self.cfg)
        for modification in ['header','identifier']:
            cfg=copy.deepcopy(base)
            if modification=='header':cfg['final_format']['columns'][0]['header']='inventado'
            else:cfg['final_format']['identifier_source_column']='inexistente'
            self.cfg=cfg;self.save_config();self.case=self.root/f'caso-{modification}';create_case(self.config_path,self.paths,self.case,NOW)
            out,plan=self.plan()
            with self.assertRaises(ValueError):self.final(out,plan)

    def test_critical_duplicate_cannot_be_waived_by_review(self):
        self.paths['sysala'].write_bytes(stock([['FICT-01',10],['FICT-01',10]]));self.case=self.root/'caso-duplicado';create_case(self.config_path,self.paths,self.case,NOW)
        out,plan=self.plan();self.assertTrue(plan['blockers'])
        with self.assertRaises(ValueError):self.final(out,plan)

    def test_no_overwrite_and_no_public_outputs(self):
        with self.assertRaises(ValueError):create_case(self.config_path,self.paths,self.case,NOW)
        with self.assertRaises(ValueError):private_path(REPO/'public/relatorio')
        with self.assertRaises(ValueError):private_path(REPO/'docs/relatorio')
        out,plan=self.plan();self.final(out,plan)
        with self.assertRaises(ValueError):self.final(out,plan)

    def test_future_review_cannot_be_approved(self):
        out,plan=self.plan(reviewed_at=(NOW+timedelta(hours=1)).isoformat())
        self.assertTrue(plan['blockers'])
        with self.assertRaises(ValueError):self.final(out,plan)

    def test_archived_snapshot_is_not_a_current_export(self):
        out,plan=self.plan();self.paths['nuvemshop']=self.case/'originals/nuvemshop.csv'
        with self.assertRaises(ValueError):self.final(out,plan)

    def test_noop_plan_does_not_create_import_file(self):
        self.paths['nuvemshop'].write_bytes(stock([['FICT-01',6]]));self.case=self.root/'caso-igual';create_case(self.config_path,self.paths,self.case,NOW)
        out,plan=self.plan()
        with self.assertRaisesRegex(ValueError,'Sem alterações'):self.final(out,plan)
        self.assertFalse((self.root/'final').exists())

    def test_commercial_source_inside_public_is_refused(self):
        self.paths['sysala']=REPO/'public/FICTICIO.csv'
        with self.assertRaises(ValueError):create_case(self.config_path,self.paths,self.root/'outro-caso',NOW)

    def test_failed_audit_write_never_exposes_final_csv(self):
        from tools.conciliacao import audit
        out,plan=self.plan();original=audit.write_new
        def failing_write(path,data,**kwargs):
            if path.name=='audit.json':raise OSError('FICTICIO: falha de escrita')
            return original(path,data,**kwargs)
        with patch('tools.conciliacao.audit.write_new',side_effect=failing_write):
            with self.assertRaises(OSError):self.final(out,plan)
        self.assertFalse((self.root/'final/estoque-aprovado.csv').exists())

    def test_ambiguous_official_column_is_not_exported(self):
        self.cfg['final_format']['columns'][1]['source_column']='saldo_ficticio';self.save_config()
        self.case=self.root/'caso-coluna-ambigua';create_case(self.config_path,self.paths,self.case,NOW)
        out,plan=self.plan()
        with self.assertRaises(ValueError):self.final(out,plan)

    def test_incremental_or_unknown_import_semantics_are_blocked(self):
        for meaning in [None, 'delta', 'physical_total']:
            self.cfg['final_format']['quantity_semantics']=meaning;self.save_config()
            self.case=self.root/f'caso-semantica-{meaning}';create_case(self.config_path,self.paths,self.case,NOW)
            out,plan=self.plan()
            with self.assertRaisesRegex(ValueError,'saldo disponível absoluto'):self.final(out,plan)
        self.assertFalse((self.root/'final').exists())

    def test_cli_creates_only_simulation_and_signals_critical_state(self):
        self.cfg['snapshot_at']=datetime.now(timezone.utc).isoformat();self.save_config()
        command=['simular','--config',str(self.config_path),'--sysala',str(self.paths['sysala']),'--nuvemshop',str(self.paths['nuvemshop']),'--reservas',str(self.paths['allocations']),'--saida',str(self.root/'cli')]
        with redirect_stdout(io.StringIO()) as output:status=main(command)
        self.assertEqual(status,3);self.assertIn('bloqueios críticos',output.getvalue());self.assertTrue((self.root/'cli/report.md').exists());self.assertFalse((self.root/'cli/estoque-aprovado.csv').exists())


class SavedFixtureTests(unittest.TestCase):
    def test_mixed_fictitious_batch_has_expected_divergences(self):
        directory=Path(__file__).parent/'fixtures'
        cfg=json.loads((directory/'config-FICTICIO.json').read_text())
        cfg['snapshot_at']=NOW.isoformat()
        data={key:(directory/name).read_bytes() for key,name in [('sysala','sysala-FICTICIO.csv'),('nuvemshop','nuvemshop-FICTICIO.csv'),('allocations','reservas-FICTICIO.csv'),('mapping','mapeamento-FICTICIO.csv')]}
        report=reconcile(cfg,data,NOW)
        codes={i['code'] for i in report['issues']}
        self.assertEqual(report['summary']['online_skus'],7)
        self.assertEqual(report['summary']['critical'],2)
        self.assertEqual(report['summary']['pending_sales_units'],4)
        self.assertTrue({'unmatched_online','online_above_ceiling','unposted_online_sales','physical_only'}.issubset(codes))
        self.assertEqual(next(r for r in report['rows'] if r['online_sku']=='FICT-PENDENTE')['ceiling'],7)

    def test_saved_incomplete_duplicate_and_legacy_encoding_files(self):
        directory=Path(__file__).parent/'fixtures';data=inputs()
        for name,code in [('incompleto-FICTICIO.csv','invalid_file'),('duplicado-FICTICIO.csv','duplicate_sku')]:
            data['sysala']=(directory/name).read_bytes()
            self.assertIn(code,{i['code'] for i in reconcile(config(),data,NOW)['issues']})
        _,rows=read_table((directory/'cp1252-FICTICIO.csv').read_bytes(),{'encoding':'cp1252','delimiter':';'})
        self.assertEqual(rows[0]['Código fictício'],'FICT-MAÇÃ')


if __name__=='__main__':unittest.main()

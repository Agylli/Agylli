"""Casos e planos imutáveis por hash, aprovação declarada e exportação local controlada."""
from __future__ import annotations

import csv
import html
import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

from .csvio import MAX_BYTES, digest, read_table, csv_bytes, timestamp
from .engine import REVIEW_HEADERS, age_issues, reconcile, evaluate_review

REPO = Path(__file__).resolve().parents[2]
PRIVATE = REPO / "dados-comerciais"


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n").encode("utf-8")


def fingerprint(value):
    return digest(json_bytes(value))


def seal(value, key):
    return {**value, key: fingerprint(value)}


def check_seal(value, key):
    if value.get(key) != fingerprint({k: v for k, v in value.items() if k != key}):
        raise ValueError("Integridade inválida; não editar o caso/plano. Criar nova simulação")


def read_file(path):
    path = Path(path).resolve()
    if not path.is_file() or path.stat().st_size > MAX_BYTES:
        raise ValueError("Arquivo ausente, não regular ou maior que 20 MiB")
    with path.open("rb") as file:
        data = file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError("Arquivo excede 20 MiB")
    return data


def decode_json(data):
    result = json.loads(data.decode("utf-8-sig"))
    if not isinstance(result, dict):
        raise ValueError("Objeto JSON obrigatório")
    return result


def private_path(path):
    resolved = Path(path).resolve()
    if any(p.name in {"public", ".git"} for p in [resolved, *resolved.parents]):
        raise ValueError("Usar diretório privado, fora de public e .git")
    if resolved.is_relative_to(REPO):
        if not resolved.is_relative_to(PRIVATE):
            raise ValueError("Dentro do projeto, entradas e saídas comerciais devem ficar em dados-comerciais/")
    elif any((p / ".git").exists() for p in [resolved, *resolved.parents]):
        raise ValueError("Pasta externa não pode estar em outro repositório Git")
    return resolved


def new_directory(path):
    path = private_path(path)
    if path.exists():
        raise ValueError("Destino já existe; não sobrescrever casos, planos ou arquivos anteriores")
    path.mkdir(mode=0o700, parents=True)
    return path


def write_new(path, data, *, readonly=False):
    # Exclusive creation; never truncate an input or previous audit artifact.
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "wb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    if readonly:
        path.chmod(0o400)


def md_cell(value):
    return html.escape(str(value if value is not None else "—")).replace("|", "&#124;").replace("\n", " ").replace("\r", " ")


def report_markdown(report, created):
    local = timestamp(created).astimezone(timezone(timedelta(hours=-3)))
    lines = ["# Conferência de estoque — simulação local", "", f"Gerado em {local:%d/%m/%Y %H:%M:%S} (Bahia, UTC−03). Nenhuma plataforma foi alterada.", "", "O teto é uma limitação de reserva aprovada, não uma ordem de reposição nem proposta automática.", "", "| SKU online | SKU físico | Saldo SysAla | Saldo online | Diferença físico−online | Reserva bruta | Venda online não lançada | Outros compromissos | Teto líquido |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
    for row in report["rows"]:
        allocation = row["allocation"] or {}
        values = [row["online_sku"], row["sysala_sku"], row["sysala_quantity"], row["online_quantity"], row["physical_minus_online"], allocation.get("allocated"), allocation.get("pending_sales"), allocation.get("holds"), row["ceiling"]]
        lines.append("| " + " | ".join(map(md_cell, values)) + " |")
    lines += ["", "## Ocorrências", ""]
    lines += [f"- {md_cell(i['severity'])} · {md_cell(i['code'])} · {md_cell(i['source'])} · {md_cell(i['online_sku'])}: {md_cell(i['message'])}" for i in report["issues"]]
    lines += ["", "## Vendas declaradas ainda não lançadas no SysAla", ""]
    for row in report["rows"]:
        allocation = row["allocation"] or {}
        if allocation.get("pending_sales"):
            lines.append(f"- {md_cell(row['online_sku'])}: {allocation['pending_sales']} unidade(s); referências: {md_cell(allocation['pending_refs'])}.")
    lines += ["", "Movimentações pendentes vêm do registro aprovado da operação, não são inferidas pela subtração de saldos."]
    return "\n".join(lines).encode("utf-8")


def create_case(config_path, paths, destination, now=None):
    now = now or datetime.now(timezone.utc)
    raw_config = read_file(private_path(config_path))
    config = decode_json(raw_config)
    inputs = {name: read_file(private_path(path)) for name, path in paths.items() if path}
    for required in ("sysala", "nuvemshop", "allocations"):
        if required not in inputs:
            raise ValueError("Informar SysAla, Nuvemshop e registro aprovado de reservas")
    snapshots = {"config.json": raw_config, **{f"{name}.csv": data for name, data in inputs.items()}}
    origin_paths = {"config.json": Path(config_path), **{f"{name}.csv": Path(path) for name, path in paths.items() if path}}
    native = config.get("final_format")
    if native and native.get("template_path"):
        template = Path(native["template_path"])
        if not template.is_absolute():
            template = Path(config_path).resolve().parent / template
        snapshots["official-template.csv"] = read_file(private_path(template))
        origin_paths["official-template.csv"] = template
    report = reconcile(config, inputs, now)
    created = now.isoformat()
    artifacts = {
        "report.json": json_bytes(report),
        "report.md": report_markdown(report, created),
        "review-template.csv": csv_bytes(REVIEW_HEADERS, [[r["online_sku"], "", "", "", ""] for r in report["rows"]], safe=True),
        "differences.csv": csv_bytes(["online_sku", "sysala_sku", "physical_quantity", "online_quantity", "difference", "ceiling"], [[r["online_sku"], r["sysala_sku"], r["sysala_quantity"], r["online_quantity"], r["physical_minus_online"], r["ceiling"]] for r in report["rows"]], safe=True),
    }
    all_files = {**{f"originals/{k}": v for k, v in snapshots.items()}, **artifacts}
    origins = {name: {"name": path.name, "path": str(path.resolve()), "modified_ns": path.stat().st_mtime_ns, "bytes": len(snapshots[name]), "sha256": digest(snapshots[name])} for name, path in origin_paths.items()}
    manifest = seal({"schema_version": 1, "created_at": created, "origins": origins, "files": {k: digest(v) for k, v in all_files.items()}}, "case_sha256")
    destination = new_directory(destination)
    (destination / "originals").mkdir(mode=0o700)
    for name, data in all_files.items():
        write_new(destination / name, data, readonly=True)
    write_new(destination / "manifest.json", json_bytes(manifest), readonly=True)
    return manifest, report


def load_case(path):
    path = private_path(path)
    manifest = decode_json(read_file(path / "manifest.json"))
    check_seal(manifest, "case_sha256")
    for name, checksum in manifest["files"].items():
        file = (path / name).resolve()
        if not file.is_relative_to(path) or digest(read_file(file)) != checksum:
            raise ValueError("Original ou relatório alterado; preservar e simular novamente")
    return manifest, decode_json(read_file(path / "originals/config.json")), decode_json(read_file(path / "report.json"))


def create_plan(case, review_path, destination, now=None):
    now = now or datetime.now(timezone.utc)
    manifest, _, report = load_case(case)
    raw = read_file(private_path(review_path))
    decisions, blockers = evaluate_review(report, raw, manifest["created_at"], now)
    plan = seal({"schema_version": 1, "created_at": now.isoformat(), "case_sha256": manifest["case_sha256"], "review_sha256": digest(raw), "decisions": decisions, "blockers": blockers}, "plan_sha256")
    approval = {"approved": False, "approved_by": "", "approved_at": "", "plan_sha256": plan["plan_sha256"], "controlled_window": False, "movements_reviewed": False, "physical_allocation_confirmed": False}
    destination = new_directory(destination)
    write_new(destination / "review.csv", raw, readonly=True)
    write_new(destination / "plan.json", json_bytes(plan), readonly=True)
    write_new(destination / "approval.example.json", json_bytes(approval))
    write_new(destination / "preview.csv", csv_bytes(["online_sku", "before", "proposed", "ceiling", "reason", "reviewed_by", "reviewed_at"], [[d[k] for k in ["online_sku", "before", "proposed", "ceiling", "reason", "reviewed_by", "reviewed_at"]] for d in decisions], safe=True), readonly=True)
    return plan


def native_export(config, originals, report, decisions, now):
    native = config.get("final_format")
    if not isinstance(native, dict) or native.get("confirmed") is not True or native.get("stock_only_update_confirmed") is not True:
        raise ValueError("Formato oficial e operação de atualização apenas de saldo não confirmados")
    if native.get("quantity_semantics") != "absolute_available":
        raise ValueError("Confirmar saldo disponível absoluto; formato incremental ou de movimento não é suportado")
    if not native.get("confirmed_by", "").strip() or not native.get("reference", "").strip():
        raise ValueError("Identificar conferente e fonte oficial do modelo")
    if timestamp(native.get("confirmed_at", "")) > now:
        raise ValueError("Confirmação do modelo no futuro")
    if "official-template.csv" not in originals:
        raise ValueError("Modelo oficial não preservado no caso")
    header, _ = read_table(originals["official-template.csv"], native)
    columns = native.get("columns", [])
    if any((c.get("quantity") is True) == bool(c.get("source_column")) for c in columns):
        raise ValueError("Cada coluna deve ser saldo proposto ou uma coluna de origem, sem ambiguidade")
    if [c.get("header") for c in columns] != header:
        raise ValueError("Colunas de saída não correspondem ao modelo oficial preservado")
    if sum(c.get("quantity") is True for c in columns) != 1:
        raise ValueError("Definir exatamente uma coluna oficial de saldo")
    identifier = native.get("identifier_source_column")
    if not identifier or identifier not in [c.get("source_column") for c in columns if c.get("quantity") is not True]:
        raise ValueError("Identificador oficial de atualização precisa ser preservado")
    seen = set()
    for raw in report["online_raw"].values():
        value = raw.get(identifier, "").strip()
        if not value or value in seen or value != raw.get(identifier):
            raise ValueError("Identificador de atualização ausente ou duplicado")
        seen.add(value)
    rows = []
    for decision in decisions:
        if decision["proposed"] == decision["before"]:
            continue
        raw = report["online_raw"][decision["online_sku"]]
        row = []
        for column in columns:
            if column.get("quantity") is True:
                row.append(decision["proposed"])
            else:
                source = column.get("source_column")
                if source not in raw:
                    raise ValueError("Campo oficial não disponível na exportação da loja")
                row.append(raw[source])
        rows.append(row)
    if not rows:
        raise ValueError("Sem alterações aprovadas; nenhum arquivo final necessário")
    return csv_bytes(header, rows, encoding=native["encoding"], delimiter=native["delimiter"])


def export_final(case, plan_path, approval_path, current_paths, destination, confirmation, now=None):
    now = now or datetime.now(timezone.utc)
    manifest, config, report = load_case(case)
    plan_path = private_path(plan_path)
    plan = decode_json(read_file(plan_path / "plan.json"))
    check_seal(plan, "plan_sha256")
    if plan["case_sha256"] != manifest["case_sha256"]:
        raise ValueError("Plano não pertence ao caso")
    review = read_file(plan_path / "review.csv")
    if digest(review) != plan["review_sha256"]:
        raise ValueError("Revisão alterada depois da prévia")
    decisions, blockers = evaluate_review(report, review, manifest["created_at"], timestamp(plan["created_at"]))
    if decisions != plan["decisions"] or blockers != plan["blockers"]:
        raise ValueError("Plano inconsistente com a revisão preservada")
    if blockers or age_issues(config, now):
        raise ValueError("Divergências críticas não resolvidas ou corte vencido; corrigir e simular novamente")
    raw_approval = read_file(private_path(approval_path))
    approval = decode_json(raw_approval)
    for flag in ("approved", "controlled_window", "movements_reviewed", "physical_allocation_confirmed"):
        if approval.get(flag) is not True:
            raise ValueError("Aprovação humana e confirmações operacionais obrigatórias")
    if not approval.get("approved_by", "").strip() or approval.get("plan_sha256") != plan["plan_sha256"] or confirmation != plan["plan_sha256"]:
        raise ValueError("Aprovar explicitamente o hash desta prévia e identificar responsável")
    approved_at = timestamp(approval.get("approved_at", ""))
    if not timestamp(plan["created_at"]) <= approved_at <= now:
        raise ValueError("Data de aprovação anterior à prévia ou no futuro")
    originals = {}
    for name, checksum in manifest["files"].items():
        if not name.startswith("originals/"):
            continue
        filename = name.removeprefix("originals/")
        originals[filename] = read_file(Path(case) / name)
        if filename in {"sysala.csv", "nuvemshop.csv", "allocations.csv", "mapping.csv"}:
            logical = filename.removesuffix(".csv")
            path = current_paths.get(logical)
            if not path or Path(path).resolve().is_relative_to(Path(case).resolve()):
                raise ValueError("Reexportar e informar fontes atuais fora da pasta de auditoria")
            if digest(read_file(private_path(path))) != checksum:
                raise ValueError("Fonte mudou após simulação; não aplicar saldo antigo. Criar novo caso")
    output = native_export(config, originals, report, decisions, now)
    destination = new_directory(destination)
    staged_output = destination / ".estoque-pendente.tmp"
    write_new(staged_output, output, readonly=True)
    write_new(destination / "approval.json", raw_approval, readonly=True)
    write_new(destination / "audit.json", json_bytes({"created_at": now.isoformat(), "case_sha256": manifest["case_sha256"], "plan_sha256": plan["plan_sha256"], "approval_sha256": digest(raw_approval), "output_sha256": digest(output), "import_performed": False, "warning": "Revalidar janela controlada e importar manualmente na plataforma oficial"}), readonly=True)
    staged_output.rename(destination / "estoque-aprovado.csv")
    return digest(output)

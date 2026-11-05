"""Regras de conferência. Só produz informação; não mantém nem altera estoque."""
from __future__ import annotations

import csv
from datetime import datetime, timezone, timedelta
from .csvio import quantity, read_table, sku, timestamp

REVIEW_HEADERS = ["online_sku", "proposed_quantity", "reason", "reviewed_by", "reviewed_at"]
REQUIRED = {
    "sysala": {"sku", "quantity"},
    "nuvemshop": {"sku", "quantity"},
    "mapping": {"sysala_sku", "online_sku"},
    "allocations": {"sku", "allocated", "pending_sales", "holds", "pending_refs", "orders_reviewed", "approved_by", "approved_at", "reference"},
}


def issue(code, message, *, source="", online_sku="", severity="critical", row=None):
    return {"code": code, "message": message, "source": source, "online_sku": online_sku, "severity": severity, "row": row}


def age_issues(config: dict, now: datetime) -> list[dict]:
    try:
        cutoff = timestamp(config.get("snapshot_at", ""))
        maximum = config.get("max_age_minutes", 60)
        if type(maximum) is not int or not 1 <= maximum <= 1440:
            raise ValueError("Prazo técnico inválido")
        age = (now - cutoff).total_seconds()
        if age < 0 or age > maximum * 60:
            return [issue("stale_snapshot", "Corte futuro ou antigo: obter novos arquivos e nova simulação")]
    except ValueError:
        return [issue("invalid_cutoff", "Informar corte com fuso e prazo de validade técnico de 1 a 1440 minutos")]
    return []


def read_source(name, data, config, issues):
    adapter = config.get("adapters", {}).get(name, {})
    columns = adapter.get("columns", {})
    if not REQUIRED[name].issubset(columns) or any(not isinstance(columns[k], str) or not columns[k] for k in REQUIRED[name]):
        issues.append(issue("adapter_missing", "Preencher mapeamento com nomes reais das colunas", source=name))
        return []
    if len(set(columns.values())) != len(columns):
        issues.append(issue("adapter_duplicate", "Campos normalizados não podem usar a mesma coluna", source=name))
        return []
    try:
        header, rows = read_table(data, adapter)
        if not set(columns.values()).issubset(header):
            raise ValueError("Colunas configuradas não existem no cabeçalho")
        return [(n + 2, {k: row[col] for k, col in columns.items()}, row) for n, row in enumerate(rows)]
    except (ValueError, UnicodeError, csv.Error) as exc:
        issues.append(issue("invalid_file", str(exc), source=name))
        return []


def reconcile(config: dict, inputs: dict[str, bytes], now: datetime | None = None) -> dict:
    now = now or datetime.now(timezone.utc)
    issues = age_issues(config, now)
    if config.get("schema_version") != 1:
        issues.append(issue("config_version", "Versão de configuração não suportada"))
    parsed = {}
    for name in ("sysala", "nuvemshop", "allocations"):
        if name not in inputs:
            issues.append(issue("missing_file", "Arquivo obrigatório ausente", source=name))
            parsed[name] = []
        else:
            parsed[name] = read_source(name, inputs[name], config, issues)
    parsed["mapping"] = read_source("mapping", inputs["mapping"], config, issues) if "mapping" in inputs else []
    stocks = {}
    for source in ("sysala", "nuvemshop"):
        records, seen = {}, set()
        style = config.get("adapters", {}).get(source, {}).get("quantity_format", "integer")
        for line, normalized, raw in parsed[source]:
            try:
                key = sku(normalized["sku"])
                if key in seen:
                    issues.append(issue("duplicate_sku", "SKU duplicado; não há agregação automática", source=source, row=line))
                    continue
                seen.add(key)
                records[key] = {"quantity": quantity(normalized["quantity"], style), "raw": raw}
            except ValueError as exc:
                issues.append(issue("invalid_stock", str(exc), source=source, row=line))
        if not records:
            issues.append(issue("empty_stock", "Nenhum registro de estoque válido", source=source))
        stocks[source] = records
    mapping, used_physical = {}, set()
    for line, record, _ in parsed["mapping"]:
        try:
            physical, online = sku(record["sysala_sku"]), sku(record["online_sku"])
            if online in mapping or physical in used_physical:
                raise ValueError("Mapeamento duplicado ou não bijetivo")
            mapping[online] = physical
            used_physical.add(physical)
        except ValueError as exc:
            issues.append(issue("mapping_collision", str(exc), source="mapping", row=line))
    allocations, seen = {}, set()
    for line, record, _ in parsed["allocations"]:
        try:
            key = sku(record["sku"])
            if key in seen:
                raise ValueError("Reserva duplicada")
            seen.add(key)
            if record["orders_reviewed"].strip().casefold() != "sim":
                raise ValueError("Conferência dos pedidos online não confirmada")
            for field in ("approved_by", "reference"):
                if not record[field].strip():
                    raise ValueError("Reserva sem responsável ou referência de aprovação")
            approved = timestamp(record["approved_at"])
            if approved > now:
                raise ValueError("Aprovação de reserva no futuro")
            allocated, pending, holds = [quantity(record[k]) for k in ("allocated", "pending_sales", "holds")]
            if pending and not record["pending_refs"].strip():
                raise ValueError("Venda ainda não lançada no SysAla sem referência de pedidos")
            allocations[key] = {"allocated": allocated, "pending_sales": pending, "holds": holds, "pending_refs": record["pending_refs"], "approval_ref": record["reference"]}
        except ValueError as exc:
            issues.append(issue("invalid_allocation", str(exc), source="allocations", row=line))
    rows, claims = [], {}
    for online, stock in sorted(stocks["nuvemshop"].items()):
        physical = mapping.get(online, online)
        balance = stocks["sysala"].get(physical)
        allocation = allocations.get(online)
        if physical in claims:
            issues.append(issue("shared_physical_sku", "Dois SKUs online consomem a mesma reserva física", online_sku=online))
        claims[physical] = online
        row = {"online_sku": online, "sysala_sku": physical, "online_quantity": stock["quantity"], "sysala_quantity": balance["quantity"] if balance else None, "physical_minus_online": balance["quantity"] - stock["quantity"] if balance else None, "ceiling": None, "allocation": allocation}
        if balance is None:
            issues.append(issue("unmatched_online", "SKU online sem correspondência no SysAla", online_sku=online))
        if allocation is None:
            issues.append(issue("missing_allocation", "Falta reserva aprovada e conferência dos pedidos", online_sku=online))
        if balance is not None and allocation is not None:
            if allocation["allocated"] > balance["quantity"]:
                issues.append(issue("allocation_above_physical", "Reserva bruta excede saldo físico", online_sku=online))
            elif allocation["pending_sales"] + allocation["holds"] > allocation["allocated"]:
                issues.append(issue("overconsumed_allocation", "Compromissos excedem reserva; não gerar saldo negativo", online_sku=online))
            else:
                row["ceiling"] = allocation["allocated"] - allocation["pending_sales"] - allocation["holds"]
                if stock["quantity"] > row["ceiling"]:
                    issues.append(issue("online_above_ceiling", "Exposição online excede reserva líquida; revisão obrigatória", online_sku=online))
                if allocation["pending_sales"]:
                    issues.append(issue("unposted_online_sales", "Vendas online declaradas ainda não lançadas no SysAla", online_sku=online, severity="warning"))
            if balance["quantity"] != stock["quantity"]:
                issues.append(issue("balance_difference", "Saldos diferentes; saldo físico não é destino automático", online_sku=online, severity="info"))
        rows.append(row)
    for physical in sorted(set(stocks["sysala"]) - set(claims)):
        issues.append(issue("physical_only", "SKU somente no físico; não será exportado", source="sysala", online_sku=physical, severity="warning"))
    for online in sorted(set(allocations) - set(stocks["nuvemshop"])):
        issues.append(issue("allocation_without_online", "Reserva sem produto online correspondente", online_sku=online))
    for online in sorted(set(mapping) - set(stocks["nuvemshop"])):
        issues.append(issue("unused_mapping", "Mapeamento sem produto online neste lote", online_sku=online, severity="warning"))
    return {"rows": rows, "issues": issues, "summary": {"online_skus": len(rows), "critical": sum(i["severity"] == "critical" for i in issues), "pending_sales_units": sum((r["allocation"] or {}).get("pending_sales", 0) for r in rows)}, "online_raw": {key: value["raw"] for key, value in stocks["nuvemshop"].items()}}


def evaluate_review(report, review_data, created_at, evaluated_at=None):
    evaluated_at = evaluated_at or datetime.now(timezone.utc)
    problems, decisions = [], []
    # Only excess exposure can be resolved through a quantity proposal. Input defects cannot be waived.
    problems.extend(i for i in report["issues"] if i["severity"] == "critical" and i["code"] != "online_above_ceiling")
    try:
        header, records = read_table(review_data, {"encoding": "utf-8-sig", "delimiter": ","})
        if header != REVIEW_HEADERS:
            raise ValueError("Usar o cabeçalho do modelo de revisão gerado")
    except (ValueError, UnicodeError, csv.Error) as exc:
        return [], problems + [issue("review_format", str(exc))]
    known = {r["online_sku"]: r for r in report["rows"]}
    seen = set()
    for n, record in enumerate(records, 2):
        try:
            key = sku(record["online_sku"])
            if key in seen or key not in known:
                raise ValueError("SKU de revisão duplicado ou fora do lote")
            seen.add(key)
            proposed = quantity(record["proposed_quantity"])
            row = known[key]
            if row["ceiling"] is None or proposed > row["ceiling"]:
                raise ValueError("Proposta excede a reserva líquida ou não há teto validado")
            if not record["reason"].strip() or not record["reviewed_by"].strip():
                raise ValueError("Justificativa e responsável obrigatórios, inclusive para manter saldo")
            if not timestamp(created_at) <= timestamp(record["reviewed_at"]) <= min(timestamp(created_at) + timedelta(days=1), evaluated_at):
                raise ValueError("Data de revisão fora da janela do caso")
            decisions.append({"online_sku": key, "before": row["online_quantity"], "proposed": proposed, "ceiling": row["ceiling"], "reason": record["reason"], "reviewed_by": record["reviewed_by"], "reviewed_at": record["reviewed_at"]})
        except ValueError as exc:
            problems.append(issue("invalid_review", str(exc), source="review", row=n))
    if seen != set(known):
        problems.append(issue("incomplete_review", "Todos os SKUs online do lote precisam de revisão explícita"))
    if not known:
        problems.append(issue("empty_plan", "Sem produtos online válidos"))
    return sorted(decisions, key=lambda d: d["online_sku"]), problems

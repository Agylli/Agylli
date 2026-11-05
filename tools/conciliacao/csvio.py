"""CSV explícito, sem autodetecção de layout ou conversão silenciosa de quantidades."""
from __future__ import annotations

import csv
import io
import re
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from hashlib import sha256

MAX_BYTES = 20 * 1024 * 1024
MAX_ROWS = 100_000
ENCODINGS = {"utf-8", "utf-8-sig", "utf-16", "cp1252", "latin-1"}


def digest(data: bytes) -> str:
    return sha256(data).hexdigest()


def timestamp(value: str) -> datetime:
    try:
        date = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if date.tzinfo is None:
            raise ValueError("Fuso obrigatório")
        return date.astimezone(timezone.utc)
    except (TypeError, AttributeError, ValueError) as exc:
        raise ValueError("Data ISO 8601 com fuso obrigatória") from exc


def quantity(value: str, style: str = "integer") -> int:
    value = value.strip()
    patterns = {"integer": r"\d+", "decimal_comma_integral": r"\d+(?:,0+)?", "decimal_dot_integral": r"\d+(?:\.0+)?"}
    if style not in patterns or not re.fullmatch(patterns[style], value, flags=re.ASCII):
        raise ValueError("Quantidade inteira não negativa obrigatória; sem separador de milhar")
    try:
        result = Decimal(value.replace(",", "."))
        if result > 1_000_000_000:
            raise ValueError("Quantidade acima do limite técnico")
        return int(result)
    except InvalidOperation as exc:
        raise ValueError("Quantidade inválida") from exc


def sku(value: str) -> str:
    # Preserve case and leading zeroes; collision after trimming is still detected.
    result = value.strip()
    if not result or len(result) > 200 or any(ord(c) < 32 for c in result):
        raise ValueError("SKU ausente ou inválido")
    if result.startswith(("=", "+", "-", "@")):
        raise ValueError("SKU inseguro para planilha; definir código/mapeamento seguro")
    return result


def read_table(data: bytes, adapter: dict) -> tuple[list[str], list[dict[str, str]]]:
    if len(data) > MAX_BYTES:
        raise ValueError("Arquivo excede 20 MiB")
    encoding = adapter.get("encoding")
    delimiter = adapter.get("delimiter")
    if encoding not in ENCODINGS or delimiter not in (",", ";", "\t", "|"):
        raise ValueError("Definir encoding e separador explícitos no adaptador")
    if "\x00" in (text := data.decode(encoding, errors="strict")):
        raise ValueError("Caractere NUL; conferir codificação")
    reader = csv.reader(io.StringIO(text, newline=""), delimiter=delimiter, strict=True)
    skip = adapter.get("skip_rows", 0)
    if type(skip) is not int or not 0 <= skip <= 10:
        raise ValueError("skip_rows inválido")
    for _ in range(skip):
        next(reader, None)
    header = next(reader, None)
    if not header or any(not c.strip() for c in header) or len(set(header)) != len(header):
        raise ValueError("Cabeçalho vazio ou duplicado")
    rows = []
    for row in reader:
        if not row:
            continue
        if len(row) != len(header):
            raise ValueError(f"Número de colunas incompatível na linha {reader.line_num}")
        rows.append(dict(zip(header, row, strict=True)))
        if len(rows) > MAX_ROWS:
            raise ValueError("Arquivo excede 100.000 linhas")
    return header, rows


def csv_bytes(headers: list[str], rows: list[list], *, encoding="utf-8", delimiter=",", safe=False) -> bytes:
    def cell(value):
        value = str(value) if value is not None else ""
        if value.lstrip().startswith(("=", "+", "-", "@")):
            if not safe:
                raise ValueError("Célula insegura para arquivo final")
            value = "'" + value
        return value
    stream = io.StringIO(newline="")
    writer = csv.writer(stream, delimiter=delimiter, lineterminator="\r\n", quoting=csv.QUOTE_ALL)
    writer.writerow([cell(v) for v in headers])
    writer.writerows([[cell(v) for v in row] for row in rows])
    return stream.getvalue().encode(encoding, errors="strict")

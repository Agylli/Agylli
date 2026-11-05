"""Executar da raiz: python3 -m tools.conciliacao --help."""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from .audit import create_case, create_plan, export_final


def sources(parser):
    parser.add_argument("--sysala", required=True, type=Path)
    parser.add_argument("--nuvemshop", required=True, type=Path)
    parser.add_argument("--reservas", required=True, type=Path)
    parser.add_argument("--mapeamento", type=Path)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Conciliação CSV offline. Não consulta APIs e nunca importa ou altera saldo real.")
    commands = parser.add_subparsers(dest="command", required=True)
    simulate = commands.add_parser("simular", help="Preservar originais e gerar relatório; não gera importação")
    sources(simulate)
    simulate.add_argument("--config", required=True, type=Path)
    simulate.add_argument("--saida", required=True, type=Path)
    review = commands.add_parser("revisar", help="Validar revisão humana e gerar prévia")
    review.add_argument("--caso", required=True, type=Path)
    review.add_argument("--revisao", required=True, type=Path)
    review.add_argument("--saida", required=True, type=Path)
    export = commands.add_parser("exportar", help="Gerar arquivo local somente após aprovação e confirmação de modelo oficial")
    sources(export)
    export.add_argument("--caso", required=True, type=Path)
    export.add_argument("--plano", required=True, type=Path)
    export.add_argument("--aprovacao", required=True, type=Path)
    export.add_argument("--confirmar-plano", required=True)
    export.add_argument("--saida", required=True, type=Path)
    args = parser.parse_args(argv)
    try:
        if args.command == "simular":
            paths = {"sysala": args.sysala, "nuvemshop": args.nuvemshop, "allocations": args.reservas, "mapping": args.mapeamento}
            _, report = create_case(args.config, paths, args.saida)
            print(f"Simulação salva em {args.saida}. SKUs online: {report['summary']['online_skus']}; bloqueios críticos: {report['summary']['critical']}.")
            return 3 if report["summary"]["critical"] else 0
        elif args.command == "revisar":
            plan = create_plan(args.caso, args.revisao, args.saida)
            print(f"Prévia salva em {args.saida}. Bloqueios: {len(plan['blockers'])}. Hash: {plan['plan_sha256']}")
            return 3 if plan["blockers"] else 0
        else:
            paths = {"sysala": args.sysala, "nuvemshop": args.nuvemshop, "allocations": args.reservas, "mapping": args.mapeamento}
            checksum = export_final(args.caso, args.plano, args.aprovacao, paths, args.saida, args.confirmar_plano)
            print(f"Arquivo local aprovado salvo em {args.saida}. SHA-256: {checksum}. Nenhuma importação foi executada.")
        return 0
    except (ValueError, OSError, KeyError, TypeError, json.JSONDecodeError, csv.Error, AttributeError) as exc:
        # Avoid printing arbitrary source values or commercial rows to the terminal.
        print(f"Operação bloqueada: {type(exc).__name__}: {str(exc) if isinstance(exc, ValueError) else 'Conferir arquivos, permissões e configuração.'}")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

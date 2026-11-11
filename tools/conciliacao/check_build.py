"""Gate local/CI: recusar artefatos administrativos ou comerciais no build público."""
from __future__ import annotations

import json
from pathlib import Path
from .audit import REPO


def verify_public_build(root: Path = REPO) -> dict:
    root = root.resolve()
    prohibited = [(root / "tools/conciliacao").resolve(), (root / "dados-comerciais").resolve(), (root / "supabase").resolve()]
    traces = sorted((root / ".next").rglob("*.nft.json"))
    problems = []
    if not traces:
        problems.append("Build sem traces: executar npm run build antes da conferência")
    for trace in traces:
        try:
            data = json.loads(trace.read_text(encoding="utf-8"))
            files = data["files"]
            if not isinstance(files, list) or any(not isinstance(f, str) for f in files):
                raise ValueError("Lista de arquivos inválida")
            for file in files:
                resolved = (trace.parent / file).resolve()
                if any(resolved.is_relative_to(base) for base in prohibited):
                    problems.append(f"Trace referencia conteúdo privado/administrativo: {trace.relative_to(root)}")
        except (OSError, ValueError, KeyError, TypeError):
            problems.append(f"Trace inválido ou ilegível: {trace.relative_to(root)}")
    public = root / "public"
    for path in public.rglob("*"):
        if path.is_symlink():
            problems.append(f"Link simbólico em public exige remoção/revisão: {path.relative_to(root)}")
        elif path.is_file() and (path.suffix.lower() in {".py", ".pyc", ".csv", ".sql"} or path.name.startswith(".env")):
            problems.append(f"Arquivo administrativo/comercial proibido em public: {path.relative_to(root)}")
    manifest = root / ".next/server/app-paths-manifest.json"
    if manifest.exists():
        try:
            routes = json.loads(manifest.read_text(encoding="utf-8"))
            for route in routes:
                if route.startswith(("/tools/conciliacao", "/dados-comerciais", "/supabase")):
                    problems.append("Rota pública para conteúdo administrativo/comercial")
        except (OSError, ValueError, TypeError):
            problems.append("Manifesto de rotas ilegível")
    return {"trace_count": len(traces), "problems": sorted(set(problems))}


def main():
    result = verify_public_build()
    if result["problems"]:
        for problem in result["problems"]:
            print(f"BLOQUEADO: {problem}")
        return 2
    print(f"Pacote público conferido: {result['trace_count']} traces; sem referências ao utilitário ou dados privados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

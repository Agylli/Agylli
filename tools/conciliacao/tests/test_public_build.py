"""Artefatos e dados criados abaixo são exclusivamente FICTÍCIOS."""
import json
import tempfile
import unittest
from pathlib import Path

from tools.conciliacao.audit import PRIVATE
from tools.conciliacao.check_build import verify_public_build


class PublicBuildTests(unittest.TestCase):
    def setUp(self):
        PRIVATE.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix="teste-pacote-", dir=PRIVATE)
        self.root = Path(self.temp.name)
        (self.root / ".next/server").mkdir(parents=True)
        (self.root / "public").mkdir()
        self.trace = self.root / ".next/server/FICTICIO.nft.json"
        self.trace.write_text(json.dumps({"files": ["../../package.json"]}))

    def tearDown(self):
        self.temp.cleanup()

    def test_existing_safe_trace_passes_and_missing_build_blocks(self):
        self.assertEqual(verify_public_build(self.root)["problems"], [])
        self.trace.unlink()
        self.assertTrue(verify_public_build(self.root)["problems"])

    def test_private_and_admin_references_block(self):
        for path in ["../../tools/conciliacao/audit.py", "../../dados-comerciais/FICTICIO.csv", "../../supabase/migrations/FICTICIO.sql"]:
            with self.subTest(path=path):
                self.trace.write_text(json.dumps({"files": [path]}))
                self.assertTrue(verify_public_build(self.root)["problems"])

    def test_malformed_or_unreadable_trace_is_not_a_pass(self):
        for value in ["{", "{}", '{"files": "wrong"}', '{"files": [1]}']:
            with self.subTest(value=value):
                self.trace.write_text(value)
                self.assertTrue(verify_public_build(self.root)["problems"])

    def test_public_sensitive_file_or_symlink_blocks(self):
        for name in ["FICTICIO.csv", "FICTICIO.py", "FICTICIO.sql", ".env.FICTICIO"]:
            path = self.root / "public" / name
            path.write_text("FICTICIO")
            self.assertTrue(verify_public_build(self.root)["problems"])
            path.unlink()
        link = self.root / "public/FICTICIO-link"
        try:
            link.symlink_to(self.trace)
        except OSError:
            self.skipTest("Criação de symlink não permitida neste sistema")
        self.assertTrue(verify_public_build(self.root)["problems"])

    def test_private_app_routes_block(self):
        manifest = self.root / ".next/server/app-paths-manifest.json"
        for route in ["/dados-comerciais/FICTICIO/page", "/tools/conciliacao/page", "/supabase/migrations/page"]:
            manifest.write_text(json.dumps({route: "FICTICIO.js"}))
            self.assertTrue(verify_public_build(self.root)["problems"])


if __name__ == "__main__":
    unittest.main()

import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores([".next/**", ".vercel/**", "out/**", "next-env.d.ts", "playwright-report/**", "test-results/**"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ...next.configs["core-web-vitals"], files: ["**/*.{ts,tsx}"] },
  { files: ["src/**/*.{ts,tsx}"], plugins: { "react-hooks": hooks }, rules: hooks.configs.recommended.rules },
]);

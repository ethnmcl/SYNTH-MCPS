import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";

const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  URL: "readonly",
  fetch: "readonly",
  Response: "readonly",
  AbortController: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly"
};

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "vitest.config.ts", "eslint.config.js"]
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json"
      },
      globals: nodeGlobals
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-undef": "off",
      "no-console": "off"
    }
  },
  prettier
];

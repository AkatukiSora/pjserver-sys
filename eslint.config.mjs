import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";

export default [
  { ignores: ["/dist", "/test", "/node_modules", "/scripts"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginImport.configs.typescript.rules,
      "@typescript-eslint/no-var-requires": "off",
      "no-console": "warn",

      "valid-typeof": "error",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/jest`
          project: "./tsconfig.json",
        },
        node: true,
      },
    },
  },
];

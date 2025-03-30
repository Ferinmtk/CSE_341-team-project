import globals from "globals";
import pluginJs from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginPrettier.configs.recommended.rules,
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
          trailingComma: "es5",
          tabWidth: 2,
          semi: true,
        },
      ],
    },
  },
  {
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  prettier,
  {
    ignores: ["node_modules", "dist"],
  },
];

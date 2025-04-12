const globals = require("globals");
const pluginJs = require("@eslint/js");
const prettier = require("eslint-config-prettier");
const pluginPrettier = require("eslint-plugin-prettier");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    // General JS files configuration
    files: ["**/*.js", "!tests/**/*.js"], // Exclude test files from this general config
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
          endOfLine: "auto", // Add endOfLine setting
        },
      ],
    },
  },
  {
    // Test files configuration
    files: ["tests/**/*.test.js", "tests/**/*.spec.js"], // Target test files specifically
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node, // Include node globals
        ...globals.jest, // Use existing 'globals' import for Jest
      },
    },
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
          endOfLine: "auto", // Add endOfLine setting
        },
      ],
    },
  },
  // {
  //   // This seems misplaced, browser globals likely not needed for backend tests
  //   languageOptions: { globals: globals.browser },
  // },
  pluginJs.configs.recommended,
  prettier,
  {
    ignores: ["node_modules", "dist"],
  },
];

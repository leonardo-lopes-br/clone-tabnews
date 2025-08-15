const { defineConfig } = require("eslint/config");
const js = require("@eslint/js");
const pluginJest = require("eslint-plugin-jest");
const pluginReact = require("eslint-plugin-react");
const globals = require("globals");

module.exports = defineConfig([
  {
    ignores: ["**/dist/**", "**/build/**", "**/node_modules/**", "**/.next/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      js,
      react: pluginReact,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "no-unused-vars": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["tests/**/*.spec.js", "tests/**/*.test.js"],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      globals: {
        ...pluginJest.environments.globals.globals,
      },
    },
    rules: {
      ...pluginJest.configs.recommended.rules,
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
]);

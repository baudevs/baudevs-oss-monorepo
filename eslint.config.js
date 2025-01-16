import nxPlugin from "@nx/eslint-plugin"; // Nx’s ESLint plugin
import jsonc from "eslint-plugin-jsonc"; // For linting JSON files
import jsoncParser from "jsonc-eslint-parser"; // JSON parser

export default [
  // 1) Bring in Nx’s core flat configs.
  ...nxPlugin.configs["flat/base"],
  ...nxPlugin.configs["flat/typescript"],
  ...nxPlugin.configs["flat/react"],
  ...nxPlugin.configs["flat/javascript"],

  // 2) Ignore dist or other unneeded folders.
  {
    ignores: ["**/dist", "**/.next", "**/node_modules", "**/build"],
  },

  // 3) Lint .ts, .tsx, .js, .jsx files with Nx rules (e.g. enforce-module-boundaries).
  {
    files: ["*.ts", "*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          depConstraints: [
            {
              sourceTag: "",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },

  // 4) Add JSON block to run Nx’s dependency-checks rule on package.json, etc.
  {
    files: ["**/package.json"],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: jsonc,
    },
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          buildTargets: ["build"],
          checkMissingDependencies: true,
          checkObsoleteDependencies: true,
          useLocalPathsForWorkspaceDependencies: true,
        },
      ],
    },
  },
];

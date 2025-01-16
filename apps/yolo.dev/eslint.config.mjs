
import baseConfig from "../../eslint.config.js";

const eslintConfig = [
  ...baseConfig, // Directly include the flat base config
  {
    ignores: [".next/**/*"], // Add ignores here
  },
  {
    files: ["*.ts", "*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      // Example: Add project-specific rules here
    },
  },
];

export default eslintConfig;

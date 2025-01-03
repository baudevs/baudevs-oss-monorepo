# Project Setup and rules for bau-gtm-tracker

## Deployment Procedures

- **CDN:** Use jsDelivr to serve UMD builds.
- **Automation:** Utilize GitHub Actions to automate build and deployment upon tagging releases.

## Tools and Plugins

- **Rollup Plugins:** `@rollup/plugin-typescript`, `rollup-plugin-terser`, `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`
- **Testing:** Jest for unit testing.

## Common Tasks

- **Creating a New Library:** Setup structure, configure build tools, initialize with boilerplate code, create documentation, and prepare deployment scripts.
- **Modifying a Library:** Update configurations, add or remove features, ensure tests pass, and update documentation accordingly.

Maintain a high level of code quality, ensure all configurations are correctly set, and adhere strictly to the outlined company standards.

## Task:

Create a new library named `bau-utils` within the Nx monorepo. This library will provide utility functions for data manipulation and should include the following methods:

- `formatDate`: Formats dates into a readable string.
- `capitalize`: Capitalizes the first letter of a given string.
- `mergeObjects`: Merges two objects into one.

Ensure the library adheres to company standards, includes comprehensive documentation, and is set up for deployment to jsDelivr.

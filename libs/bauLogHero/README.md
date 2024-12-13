
# BauLogHero

![BauLogHero Logo](../../assets/bauLogHero/BauLogHero.png)

[![npm version](https://img.shields.io/npm/v/@baudevs-monorepo/bauLogHero.svg?style=flat-square)](https://www.npmjs.com/package/@baudevs/bau-log-hero)
![NPM Downloads](https://img.shields.io/npm/d18m/%40baudevs%2Fbau-log-hero)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/baudevs/baudevs-oss-monorepo/ci.yml)
[![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-lightgrey.svg?style=flat-square)](./LICENSE)
[![Monorepo: Nx](https://img.shields.io/badge/monorepo-nx-brightgreen?style=flat-square)](https://nx.dev)

**BauLogHero** is a playful, full-featured logger for Nx + Next.js monorepos, enabling server & browser logging with color-coded output, easy enable/disable, and JSON5-like config support.

## Features

- **Colorful Logs:** Distinguish log levels (debug/info/warn/error) easily.
- **Browser & Node Support:** Runs seamlessly in Next.js SSR and client-side code.
- **Easy Toggle:** Enable/disable logging via `// baudevs-logger-enabled` comment.
- **JSON5-Like Config:** Adjust log levels and settings via a flexible config file.

## Installation

```bash
npm install @baudevs/bau-log-hero
```

## Usage

To use BauLogHero, simply import it into your project and configure it as needed.

```typescript
import { createBaudevsLogger } from '@baudevs-monorepo/bauLogHero';

const logger = createBaudevsLogger(__filename);
logger.info('This is an info message!');
logger.debug('Debugging info here...');
```

## Configuration

BauLogHero uses a JSON5-like config file to customize its behavior. The config file is located at `bauLogHero/config.json5`.

## License

This software is provided under a dual-license model. For more details, see the [LICENSE.md](LICENSE.md) file.

## Contributing

Contributions are welcome! See CONTRIBUTING.md for guidelines.

## Security

If you find a security vulnerability, please follow our SECURITY.md policy.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

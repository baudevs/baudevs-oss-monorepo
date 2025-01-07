# Changelog

## [Unreleased]

### Breaking Changes

- Removed `enabled` property from `LoggerConfig` interface
- Removed direct console logging in favor of configurable output handlers
- Changed logger initialization to use named configuration instead of filename
- Removed JSON5-like config file support
- Removed automatic logger enabling via file comments

### Added

- 🧠 New Smart Analysis feature for AI-powered log insights
  - Automatic pattern detection and grouping
  - Context extraction (IPs, URLs, status codes)
  - Real-time log analysis with configurable thresholds
  - Intelligent summaries and pattern reporting
- New `OutputHandler` class for managing different output methods
- File output support with rotation and compression capabilities
- Browser-specific output options (download, localStorage, console)
- Configurable object serialization depth with `maxDepth` option
- Pretty printing support for objects and JSON output
- Static utility methods for managing localStorage logs
- Comprehensive error handling with stack trace preservation

### Changed

- Restructured configuration interface for better type safety
- Enhanced timestamp formatting options
- Improved browser environment detection
- Updated error handling to preserve stack traces
- Made all logging methods asynchronous
- Simplified logger instantiation with factory function

### Fixed

- Improved type safety across the library
- Better handling of circular references in object serialization
- More reliable browser environment detection
- Proper cleanup of resources in browser downloads

## 1.3.0 (2024-12-13)

### 🚀 Features

- Breaking: changed exported class name from createBaudevLogger to createLogger for clarity ([9b45478](https://github.com/baudevs/baudevs-oss-monorepo/commit/9b45478))
- breaking: rename createBaudevsLogger class to createLogger for clarity and fixed tests ([ef96a81](https://github.com/baudevs/baudevs-oss-monorepo/commit/ef96a81))

### ❤️ Thank You

- Juan Arroyave

## 1.2.2 (2024-12-13)

### 🩹 Fixes

- chore: fix pre-release script and make it sizzle ([cd255db](https://github.com/baudevs/baudevs-oss-monorepo/commit/cd255db))

### ❤️ Thank You

- Juan Arroyave

## 1.2.1 (2024-12-13)

### 🩹 Fixes

- chore: Removed tsconfig from project built assets ([2710628](https://github.com/baudevs/baudevs-oss-monorepo/commit/2710628))

### ❤️ Thank You

- Juan Arroyave

## 1.2.0 (2024-12-12)

### 🚀 Features

- remove github npm repository from npmrc and remove ci.yml workflow ([939a4ee](https://github.com/baudevs/baudevs-oss-monorepo/commit/939a4ee))

### ❤️ Thank You

- Juan Arroyave

## 1.1.0 (2024-12-12)

### 🚀 Features

- [add] .npmrc with auth token ([b5379c8](https://github.com/baudevs/baudevs-oss-monorepo/commit/b5379c8))

### 🩹 Fixes

- configure git credentials in release workflow ([d75b6c7](https://github.com/baudevs/baudevs-oss-monorepo/commit/d75b6c7))

### ❤️ Thank You

- Juan Arroyave

## 1.0.0 (2024-12-12)

### ⚠️  Breaking Changes

- first release ([](https://github.com/baudevs/baudevs-oss-monorepo/commit/))

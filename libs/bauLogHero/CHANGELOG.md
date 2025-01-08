## 1.6.0 (2025-01-08)

### 🚀 Features

- feat: minor version release for @baudevs/bau-log-hero ([c9a9c4e](https://github.com/baudevs/baudevs-oss-monorepo/commit/c9a9c4e))
- feat: minor version release for @baudevs/bau-log-hero ([2205184](https://github.com/baudevs/baudevs-oss-monorepo/commit/2205184))
- feat: minor version release for @baudevs/bau-log-hero ([87c1f0f](https://github.com/baudevs/baudevs-oss-monorepo/commit/87c1f0f))

### ❤️ Thank You

- baudevs

## 1.5.0 (2025-01-08)

### 🚀 Features

- feat: minor version release for @baudevs/bau-log-hero ([9daa381](https://github.com/baudevs/baudevs-oss-monorepo/commit/9daa381))

### ❤️ Thank You

- baudevs

## 1.4.0 (2025-01-08)

### 🚀 Features

- feat: minor version release for @baudevs/bau-log-hero ([4117f85](https://github.com/baudevs/baudevs-oss-monorepo/commit/4117f85))
- feat: minor version release for @baudevs/bau-log-hero ([bbd4210](https://github.com/baudevs/baudevs-oss-monorepo/commit/bbd4210))
- feat: minor version release for @baudevs/bau-log-hero ([a2cc355](https://github.com/baudevs/baudevs-oss-monorepo/commit/a2cc355))
- feat: minor version release for @baudevs/bau-log-hero ([d4f252d](https://github.com/baudevs/baudevs-oss-monorepo/commit/d4f252d))
- feat: minor version release for @baudevs/bau-log-hero ([11dda44](https://github.com/baudevs/baudevs-oss-monorepo/commit/11dda44))
- feat: minor version release for @baudevs/bau-log-hero ([34a8740](https://github.com/baudevs/baudevs-oss-monorepo/commit/34a8740))
- feat: minor version release for @baudevs/bau-log-hero ([f2b72e9](https://github.com/baudevs/baudevs-oss-monorepo/commit/f2b72e9))
- feat: minor version release for @baudevs/bau-log-hero ([3723ac7](https://github.com/baudevs/baudevs-oss-monorepo/commit/3723ac7))
- feat: minor version release for @baudevs/bau-log-hero ([9db5863](https://github.com/baudevs/baudevs-oss-monorepo/commit/9db5863))
- feat: minor version release for @baudevs/bau-log-hero ([a25dd9c](https://github.com/baudevs/baudevs-oss-monorepo/commit/a25dd9c))
- feat: minor version release for @baudevs/bau-log-hero ([22f13f4](https://github.com/baudevs/baudevs-oss-monorepo/commit/22f13f4))
- feat: minor version release for @baudevs/bau-log-hero ([9d1e4fc](https://github.com/baudevs/baudevs-oss-monorepo/commit/9d1e4fc))
- feat: minor version release for @baudevs/bau-log-hero ([9592981](https://github.com/baudevs/baudevs-oss-monorepo/commit/9592981))
- feat: minor version release for @baudevs/bau-log-hero ([c7c42a2](https://github.com/baudevs/baudevs-oss-monorepo/commit/c7c42a2))

### 🩹 Fixes

- fix: patch version release for @baudevs/bau-log-hero ([590cde3](https://github.com/baudevs/baudevs-oss-monorepo/commit/590cde3))
- fix: patch version release for @baudevs/bau-log-hero ([29ef3d9](https://github.com/baudevs/baudevs-oss-monorepo/commit/29ef3d9))
- fix: patch version release for @baudevs/bau-log-hero ([3a57b13](https://github.com/baudevs/baudevs-oss-monorepo/commit/3a57b13))
- fix: patch version release for @baudevs/bau-log-hero ([35b37ae](https://github.com/baudevs/baudevs-oss-monorepo/commit/35b37ae))

### ❤️ Thank You

- baudevs

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

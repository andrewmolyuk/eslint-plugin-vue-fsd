# eslint-plugin-vue-fsd

[![Build Status](https://img.shields.io/github/actions/workflow/status/andrewmolyuk/eslint-plugin-vue-fsd/release.yml)](https://github.com/andrewmolyuk/eslint-plugin-vue-fsd/actions/workflows/release.yml)
[![Codacy Grade](https://app.codacy.com/project/badge/Grade/63a6f5a8e05845f4bc8bf828143ec631)](https://app.codacy.com/gh/andrewmolyuk/eslint-plugin-vue-fsd/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Coverage](https://app.codacy.com/project/badge/Coverage/63a6f5a8e05845f4bc8bf828143ec631)](https://app.codacy.com/gh/andrewmolyuk/eslint-plugin-vue-fsd/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![Issues](https://img.shields.io/github/issues/andrewmolyuk/eslint-plugin-vue-fsd)](https://github.com/andrewmolyuk/eslint-plugin-vue-fsd/issues)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-vue-fsd.svg?style=flat)](https://www.npmjs.com/package/eslint-plugin-vue-fsd)
[![semantic-release: conventional](https://img.shields.io/badge/semantic--release-conventional-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

A custom ESLint plugin for enforcing FSD patterns in Vue projects.

> [!NOTE]
> The project is in active development and may have breaking changes in minor versions, but we will strive to keep changes minimal and well-documented.

![FSD Pattern](docs/assets/fsd.png)

## Features

- **FSD Architecture Enforcement**: Validates Feature-Sliced Design patterns in Vue.js projects with comprehensive rule coverage.
- **Layer Structure Validation**: Enforces proper layer hierarchy and prevents usage of deprecated layers.
- **Import Control**: Prevents higher-level imports and cross-slice imports to maintain architectural boundaries.
- **Vue.js Integration**: Provides specialized rules for Vue Single File Components, including section ordering.
- **Flexible Configuration**: Includes predefined configurations (recommended/all) with customizable options for different project setups.
- **High Quality Assurance**: Maintains 100% test coverage across all rules and utilities for reliability.
- **Performance Optimized**: Efficient rule execution with minimal impact on linting performance.

## Installation

```bash
npm install eslint-plugin-vue-fsd --save-dev
```

## Usage

We provide two predefined configurations to help enforce FSD principles in your Vue.js projects:

- **recommended** - enables the rules that follow best practices for FSD and Vue.js development.
- **all** - enables all of the rules shipped with eslint-plugin-vue-fsd.

### ESLint v9+ Configuration (Recommended)

```javascript
import vueFsdPlugin from 'eslint-plugin-vue-fsd'

export default [...vueFsdPlugin.configs.recommended]
```

### Legacy ESLint v8 Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:vue-fsd/legacy/recommended'],
}
```

### Quick Start

1. Install the plugin: `npm install eslint-plugin-vue-fsd --save-dev`
2. Add the recommended configuration to your ESLint config
3. Run: `npx eslint src/`

The plugin will now enforce FSD patterns in your Vue.js project!

## Rules

The plugin provides the rules to enforce [Feature-Sliced Design](https://feature-sliced.design/) principles in [Vue.js](https://vuejs.org/) projects.

| Rule                                                               | Description                                                                            |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [fsd-layers](./docs/rules/fsd-layers.md)                           | Enforce consistent layer structure in feature-sliced design.                           |
| [no-processes-layer](./docs/rules/no-processes-layer.md)           | Ensure deprecated processes layer is not used.                                         |
| [public-api](./docs/rules/public-api.md)                           | Enforce consistent public API structure in FSD slices.                                 |
| [sfc-sections-order](./docs/rules/sfc-sections-order.md)           | Enforce consistent order of top-level sections in single-file components.              |
| [no-ui-in-app](./docs/rules/no-ui-in-app.md)                       | Forbid placing `ui` segment directly inside the `app` layer.                           |
| [no-layer-public-api](./docs/rules/no-layer-public-api.md)         | Forbid placing a layer-level public API file (e.g. `index.ts`) at the root of a layer. |
| [no-higher-level-imports](./docs/rules/no-higher-level-imports.md) | Forbid importing from higher FSD layers.                                               |
| [no-cross-slice-imports](./docs/rules/no-cross-slice-imports.md)   | Forbid cross-imports between slices on the same layer.                                 |

## Roadmap

As the plugin evolves, we plan to implement the following rules:

- no-segments-without-slices: Forbid segments without slices.
- no-direct-imports: Forbid direct imports from outside the slice.
- slice-relative-path: Imports within one slice should be relative.
- slice-naming: Enforce consistent naming conventions for slices.
- composables-naming: Enforce consistent naming conventions for composables.
- components-naming: Enforce consistent naming conventions for components.
- no-orphaned-files: Forbid orphaned files that are not part of any slice.

We are always open to suggestions and contributions for new rules and improvements.

## Contribution

Pull requests and issues are welcome! Before contributing, please read the contribution guidelines and the code of conduct:

- [Contributing](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

Please follow the code style and add tests for new rules.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Run linting: `npm run lint`

### Adding New Rules

1. Create the rule file in `src/rules/`
2. Add comprehensive tests in `test/rules/`
3. Create documentation in `docs/rules/`
4. Update the README and configurations
5. Ensure 100% test coverage

## License

MIT, see [LICENSE](./LICENSE) for details.

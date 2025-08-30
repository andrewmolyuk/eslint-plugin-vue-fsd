# eslint-plugin-vue-fsd

[![Build Status](https://img.shields.io/github/actions/workflow/status/andrewmolyuk/eslint-plugin-vue-fsd/release.yml)](https://github.com/andrewmolyuk/eslint-plugin-vue-fsd/actions/workflows/release.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/63a6f5a8e05845f4bc8bf828143ec631)](https://app.codacy.com/gh/andrewmolyuk/eslint-plugin-vue-fsd/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Issues](https://img.shields.io/github/issues/andrewmolyuk/eslint-plugin-vue-fsd)](https://github.com/andrewmolyuk/eslint-plugin-vue-fsd/issues)
[![NPM](https://img.shields.io/npm/v/eslint-plugin-vue-fsd.svg?style=flat)](https://www.npmjs.com/package/eslint-plugin-vue-fsd)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-vue-fsd.svg?style=flat)](https://www.npmjs.com/package/eslint-plugin-vue-fsd)
[![semantic-release: conventional](https://img.shields.io/badge/semantic--release-conventional-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![License](https://img.shields.io/npm/l/eslint-plugin-vue-fsd.svg)](LICENSE)

A custom ESLint plugin for enforcing FSD patterns in Vue projects.

> [!NOTE]
> The project is in active development and may have breaking changes in minor versions, but we will strive to keep changes minimal and well-documented.

![FSD Pattern](docs/assets/fsd.png)

## Features

- Enforces FSD (Feature-Sliced Design) architecture patterns in Vue.js projects.
- Provides a set of rules and guidelines for structuring Vue components and their interactions.
- Includes a set of predefined configurations for different project setups.

## Installation

```bash
npm install eslint-plugin-vue-fsd --save-dev
```

## Usage

```javascript
import vueFsdPlugin from 'eslint-plugin-vue-fsd'

// .eslintrc.js
module.exports = {
  ...vueFsdPlugin.configs.recommended,
}
```

## Rules

| Rule                                                     | Description                                    |
| -------------------------------------------------------- | ---------------------------------------------- |
| [no-processes-layer](./docs/rules/no-processes-layer.md) | Ensure deprecated processes layer is not used. |

## Contribution

Pull requests and issues are welcome! Please follow the code style and add tests for new rules.

## License

MIT, see [LICENSE](./LICENSE) for details.

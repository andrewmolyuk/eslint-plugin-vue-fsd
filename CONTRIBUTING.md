# Contributing to eslint-plugin-vue-fsd

Thank you for your interest in contributing to eslint-plugin-vue-fsd! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Creating New Rules](#creating-new-rules)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

**Short version:** please be respectful, report problems, and follow the [full Code of Conduct](./CODE_OF_CONDUCT.md) for details and reporting instructions.

**To report an incident:** use the "Code of Conduct report" issue template (choose 'Code of Conduct report' when opening a new issue) or see the reporting instructions in `CODE_OF_CONDUCT.md`.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git
- Basic understanding of ESLint and Vue.js
- Familiarity with Feature-Sliced Design (FSD) architecture

### Development Setup

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/your-username/eslint-plugin-vue-fsd.git
   cd eslint-plugin-vue-fsd
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run tests to ensure everything works:**

   ```bash
   npm test
   ```

4. **Run linting:**

   ```bash
   npm run lint
   ```

## Project Structure

```text
eslint-plugin-vue-fsd/
├── src/
│   ├── configs.js          # ESLint configuration presets
│   ├── index.js            # Main plugin entry point
│   ├── meta.js             # Plugin metadata
│   ├── utils.js            # Shared utility functions
│   └── rules/              # ESLint rule implementations
├── test/
│   ├── test-utils.js       # Testing utilities
│   └── rules/              # Rule test files
├── docs/
│   └── rules/              # Rule documentation
├── coverage/               # Test coverage reports
├── eslint.config.js        # ESLint configuration
├── vitest.config.ts        # Test configuration
└── package.json            # Project dependencies and scripts
```

### Key Directories

- **`src/rules/`**: Contains all ESLint rule implementations
- **`test/rules/`**: Contains test files for each rule
- **`docs/rules/`**: Contains comprehensive documentation for each rule
- **`src/utils.js`**: Shared utilities used by multiple rules

## Creating New Rules

### 1. Rule Implementation

Create a new file in `src/rules/your-rule-name.js`:

```javascript
import { parseRuleOptions } from '../utils.js'

const defaultOptions = {
  // your default options here
}

export default {
  meta: {
    type: 'problem', // or 'suggestion', 'layout'
    docs: {
      description: 'Brief description of the rule',
      recommended: false,
    },
    fixable: null, // or 'code', 'whitespace'
    schema: [
      {
        type: 'object',
        properties: {
          // define your rule options schema here
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      messageId: 'Error message template',
    },
  },

  create(context) {
    const options = parseRuleOptions(context, defaultOptions)

    return {
      // AST node visitors
      ImportDeclaration(node) {
        // Rule logic here
      },
    }
  },
}
```

### 2. Export the Rule

Add your rule to `src/index.js`:

```javascript
import yourRuleName from './rules/your-rule-name.js'

const plugin = {
  meta,
  rules: {
    'no-processes-layer': noProcessesLayer,
    'sfc-sections-order': sfcSectionsOrder,
    'fsd-layers': fsdLayers,
    'public-api': publicApi,
    'no-ui-in-app': noUiInApp,
    'no-layer-public-api': noLayerPublicApi,
    'no-higher-level-imports': noHigherLevelImports,
    'no-cross-slice-imports': noCrossSliceImports,
    'your-rule-name': yourRuleName, // Add your new rule here
  },
  // ... rest of plugin structure
}
```

### 3. Add to Configurations

Update `src/configs.js` if the rule should be included in any presets:

```javascript
export const getConfigs = (plugin) => {
  const recommendedRules = {
    'vue-fsd/no-processes-layer': 'error',
    'vue-fsd/no-layer-public-api': 'error',
    'vue-fsd/no-higher-level-imports': 'error',
    'vue-fsd/sfc-sections-order': 'error',
    'vue-fsd/fsd-layers': 'error',
    'vue-fsd/public-api': 'error',
    'vue-fsd/no-cross-slice-imports': 'error',
    'vue-fsd/your-rule-name': 'error',
    // Add your new rule here
  }
  // ... rest of configuration
}
```

### Rule Development Tips

1. **Use AST Explorer**: Visit [astexplorer.net](https://astexplorer.net) to understand the AST structure
2. **Study existing rules**: Look at similar rules in the codebase for patterns
3. **Handle edge cases**: Consider different import/export syntaxes
4. **Provide helpful messages**: Make error messages clear and actionable

## Testing

### Test Structure

Create comprehensive tests in `test/rules/your-rule-name.test.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import rule from '../../src/rules/your-rule-name.js'
import { setupTest, runRule } from '../test-utils.js'

describe('your-rule-name rule', () => {
  beforeEach(setupTest)

  it('should allow valid code', () => {
    const context = runRule(rule, {
      code: 'valid code example',
      filename: 'src/shared/ui/Button.vue',
    })

    expect(context.report).not.toHaveBeenCalled()
  })

  it('should report invalid code', () => {
    const context = runRule(rule, {
      code: 'invalid code example',
      filename: 'src/pages/HomePage.vue',
    })

    expect(context.report).toHaveBeenCalledWith({
      node: expect.any(Object),
      messageId: 'messageId',
    })
  })
})
```

### Testing Guidelines

1. **Test all scenarios**: Valid cases, invalid cases, edge cases
2. **Use realistic filenames**: Match actual FSD structure patterns
3. **Test with different file types**: .js, .vue, .ts files
4. **Include option variations**: Test all configuration options
5. **Verify error messages**: Ensure correct messageId is used

### Running Tests

```bash
# Run all tests (this runs lint then vitest with coverage via Makefile)
npm test

# Run vitest in watch mode for fast feedback
npx vitest --watch

# Run tests with coverage explicitly
npx vitest --coverage

# Run a single test file (replace with path to your test)
npx vitest test/rules/your-rule-name.test.js
```

## Documentation

### Rule Documentation

Each rule must have comprehensive documentation in `docs/rules/rule-name.md`:

````markdown
# rule-name

Brief description of what the rule does.

## Rule Details

Detailed explanation of the rule's purpose and behavior.

## Examples

### ✅ Correct

```javascript
// Good examples
```
````

### ❌ Incorrect

```javascript
// Bad examples
```

## Options

Description of configuration options.

## When Not To Use

When this rule might not be appropriate.

## Related Rules

Links to related rules.

````markdown
### Documentation Guidelines

1. **Be Clear and Comprehensive:**
   - Explain the FSD principle being enforced
   - Provide real-world examples
   - Include all configuration options

2. **Use Consistent Formatting:**
   - Follow the existing documentation style
   - Use proper markdown formatting
   - Include code examples with syntax highlighting

3. **Keep Updated:**
   - Update docs when rule behavior changes
   - Ensure examples are accurate and current

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass:**

   ```bash
   npm test
   ```
````

1. **Check code formatting:**

   ```bash
   npm run lint
   ```

2. **Update documentation:**
   - Add or update rule documentation
   - Update README if adding new rules
   - Include inline code comments

3. **Add tests:**
   - Achieve 100% test coverage
   - Include edge cases and error scenarios

### Pull Request Guidelines

1. **Create a focused PR:**
   - One feature or fix per PR
   - Keep changes atomic and reviewable

2. **Write a clear description:**
   - Explain what the PR does and why
   - Reference any related issues
   - Include testing instructions

3. **Follow the template:**
   - Use the provided PR template
   - Fill out all relevant sections

4. **Respond to feedback:**
   - Address review comments promptly
   - Make requested changes
   - Ask questions if clarification needed

### Review Process

- All PRs require at least one approval
- Automated tests must pass
- Documentation must be updated
- Squash and merge preferred

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```text
type(scope): description

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```text
feat(rules): add no-cross-slice-imports rule

Add new rule to prevent imports between slices on the same layer.
Includes comprehensive tests and documentation.

Closes #123
```

```text
fix(no-higher-level-imports): handle relative imports correctly

Previously the rule incorrectly flagged relative imports as violations.
Now properly ignores relative imports starting with './' or '../'.

Fixes #456
```

```text
docs(contributing): add detailed contribution guidelines

Include information about:
- Development setup
- Rule creation process
- Testing requirements
- Documentation standards
```

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated releases:

1. **Commits trigger releases**: Following conventional commits automatically triggers version bumps
2. **Automated changelog**: Release notes are generated from commit messages
3. **NPM publishing**: Packages are automatically published to npm
4. **GitHub releases**: Release tags and notes are created automatically

### Version Bumping

- `fix`: Patch version (1.0.1)
- `feat`: Minor version (1.1.0)
- `feat!` or `BREAKING CHANGE`: Major version (2.0.0)

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bug reports**: Create an issue with reproduction steps
- **Feature requests**: Open an issue with detailed description
- **Security issues**: Open an issue with the label "security"

## Resources

- [ESLint Rule Development](https://eslint.org/docs/developer-guide/working-with-rules)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [AST Explorer](https://astexplorer.net/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Thank you for contributing to eslint-plugin-vue-fsd! Your efforts help make Feature-Sliced Design more accessible and maintainable for the Vue.js community.

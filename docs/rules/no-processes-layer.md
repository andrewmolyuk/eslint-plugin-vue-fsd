# no-processes-layer

Disallow a `processes` folder inside your `src` tree.

## Why

This repository enforces a layered architecture where certain folders are reserved or deprecated.
The `processes` folder is considered a deprecated layer for the Feature-Sliced Design architecture. The rule prevents the presence of a `processes` directory inside your configured `src` path.

The rule is intentionally conservative: it reports once per linting session to reduce noise from the same structural problem appearing in many files.

## Rule details

- Rule name: `vue-fsd/no-processes-layer`
- Default messageId: `forbidden`
- Type: `problem`

This rule checks whether the configured `src` path contains a top-level `processes` directory.

The rule reports at most once per linting session to avoid repeated identical messages across many files.

## Options

The rule accepts a single options object with the following property:

- `src` (string) — the path/alias to your project's source root. Default: `"src"`.

Example (ESLint config):

```json
{
  "plugins": ["vue-fsd"],
  "rules": {
    "vue-fsd/no-processes-layer": ["error", { "src": "src" }]
  }
}
```

If your project uses a custom alias or a non-standard src path, pass that string via `src`.

## Examples

Bad:

```text
// filesystem: src/processes/
src/processes/handler.js
```

Good:

```text
// keep code in another allowed layer (services, workers, etc.)
src/services/processor.js
```

## When not to use

Avoid using this rule in the following cases:

- When migrating an existing codebase that heavily relies on the `processes` layer. In such cases, consider using the rule in a more lenient mode or with exceptions.
- When working on experimental features or prototypes that may not adhere to the established folder structure.

## References

- [ESLint Documentation](https://eslint.org/docs/user-guide/configuring)
- [Feature-Sliced Design](https://feature-sliced.design/)

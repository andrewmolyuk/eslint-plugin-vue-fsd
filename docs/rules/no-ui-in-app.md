# no-ui-in-app

Disallow a `ui` segment inside the `app` layer.

## Why

In Feature-Sliced Design the `app` layer is intended for application-level glue and orchestration, not for UI slices.
The `ui` segment is intended to be used inside feature slices (for example `src/features/*/ui`) and should not be placed directly under `src/app`.

This rule checks whether the configured `src` path contains a top-level `app/ui` directory and reports once per lint session to reduce noise.

## Rule details

- Rule name: `vue-fsd/no-ui-in-app`
- Default messageId: `forbidden`
- Type: `problem`

The rule verifies the presence of `src/app/ui` and reports the structural violation once per linting session.

## Options

The rule accepts a single options object with the following property:

- `src` (string) — the path/alias to your project's source root. Default: `"src"`.

Example (ESLint config):

```json
{
  "plugins": ["vue-fsd"],
  "rules": {
    "vue-fsd/no-ui-in-app": ["error", { "src": "src" }]
  }
}
```

## Examples

Bad:

```text
// filesystem: src/app/ui/
src/app/ui/Button.vue
```

Good:

```text
// keep ui inside features/slices
src/features/auth/ui/LoginForm.vue
```

## When not to use

- If your project intentionally places UI components under `app` for legacy or architectural reasons.

## References

- [Feature-Sliced Design](https://feature-sliced.design/)

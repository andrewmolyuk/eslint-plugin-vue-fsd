# no-layer-public-api

Disallow a layer-level public API file (for example `index.ts`) at the root of layers.

## Why

In a layered Feature-Sliced Design repository each top-level layer (for example `app`, `pages`, `widgets`, `entities`, etc.) should expose a public API at the slice level, not via a root-level `index` file inside the layer folder. Placing a root-level public API file can encourage leaking cross-layer imports and reduce encapsulation.

This rule scans the configured `src` path and reports when a configured `filename` exists directly under a layer directory (for example `src/app/index.ts`). To keep noise low the rule reports at most once per linting session.

## Rule details

- Rule name: `vue-fsd/no-layer-public-api`
- Default messageId: `forbidden`
- Type: `problem`

The rule checks each top-level directory inside the configured `src` for the presence of the configured `filename`. If a file with that name exists and is a regular file at the layer root, the rule reports once with a message pointing to the offending layer and filename.

## Options

The rule accepts a single options object with the following properties:

- `src` (string) — the path or alias to your project's source root. Default: `"src"`.
- `filename` (string) — the filename to treat as a layer-level public API. Default: `"index.ts"`.
- `ignore` (string[]) — array of layer names to ignore (for example `['app']`). Default: `[]`.

Example (ESLint config):

```json
{
  "plugins": ["vue-fsd"],
  "rules": {
    "vue-fsd/no-layer-public-api": ["error", { "src": "src", "filename": "index.ts", "ignore": ["app"] }]
  }
}
```

## Examples

Bad:

```text
// filesystem: src/app/index.ts
src/app/index.ts        <-- reported
src/app/page-a/index.ts <-- fine (slice-level public API)
```

Good:

```text
// keep public API at slice level only
src/app/page-a/index.ts
src/widgets/button/index.ts
```

## When not to use

- When your project intentionally exposes a single root-level API for a layer (legacy codebases or libraries). Use the `ignore` option or set the rule to `off` during migration.
- When the filename you want to detect differs from `index.ts` and you prefer another pattern — use the `filename` option.

## References

- [ESLint Documentation](https://eslint.org/docs/user-guide/configuring)
- [Feature-Sliced Design](https://feature-sliced.design/)

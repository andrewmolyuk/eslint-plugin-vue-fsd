# fsd-layers

Enforce consistent layer structure in feature-sliced design.

This rule checks that the source directory contains only the required and allowed folders/files according to Feature-Sliced Design principles. It runs only once per ESLint session to avoid redundant filesystem checks.

## Rule Details

This rule enforces FSD layer structure by:

- Checking that all required layers/files are present in the source directory
- Restricting which layers/files are allowed (by default, allows standard FSD layers)
- Supporting ignore patterns to exclude certain files/folders from checks
- Running filesystem checks only once per lint session for performance

**Default Behavior**: With no configuration, the rule allows the standard FSD layers (`app`, `pages`, `widgets`, `features`, `entities`, `shared`) plus `main.ts`, but doesn't require any specific layers.

## Options

```json
{
  "vue-fsd/fsd-layers": [
    "error",
    {
      "src": "src",
      "required": ["app", "pages", "shared"],
      "allowed": ["app", "pages", "features", "entities", "shared"],
      "ignore": ["node_modules", ".*", "*.md"]
    }
  ]
}
```

### `src` (string)

The source directory path to check for FSD layer structure. Defaults to `"src"`.

### `required` (array of strings)

List of folders/files that must exist in the source directory. If any required item is missing, the rule will report an error.

Default: `[]` (no requirements)

### `allowed` (array of strings)

List of folders/files that are allowed in the source directory. If this option is provided and non-empty, any folder/file not in this list will trigger an error.

Default: `["app", "pages", "widgets", "features", "entities", "shared", "main.ts"]` (standard FSD layers plus main entry file)

### `ignore` (array of strings)

List of glob patterns to ignore when checking the source directory. Useful for excluding build artifacts, dependencies, or other non-FSD files.

Default: `[]` (no ignores)

## Examples

### ✅ Correct

#### Default behavior (no configuration required)

```json
{
  "vue-fsd/fsd-layers": "error"
}
```

```text
src/
├── app/      ✅ allowed by default
├── pages/    ✅ allowed by default
├── shared/   ✅ allowed by default
└── main.ts   ✅ allowed by default
```

#### Custom configuration

With configuration:

```json
{
  "src": "src",
  "required": ["app", "shared"],
  "allowed": ["app", "pages", "widgets", "features", "entities", "shared", "main.ts"],
  "ignore": ["*.d.ts", "node_modules"]
}
```

```text
src/
├── app/           ✅ required and allowed
├── pages/         ✅ allowed
├── widgets/       ✅ allowed
├── features/      ✅ allowed
├── entities/      ✅ allowed
├── shared/        ✅ required and allowed
├── main.ts        ✅ allowed
├── vite-env.d.ts  ✅ ignored
└── node_modules/  ✅ ignored
```

### ❌ Incorrect

#### Missing required layer

```text
src/
├── app/     ✅ required
└── pages/   ❌ missing required "shared"
```

```text
Required FSD layer "shared" is missing in src.
```

#### Disallowed layer present

```text
src/
├── app/
├── shared/
└── processes/  ❌ not in allowed list
```

```text
FSD layer "processes" is not allowed in src. Allowed: app, pages, widgets, features, entities, shared, main.ts.
```

## Typical FSD Configuration

For a standard Feature-Sliced Design project:

```json
{
  "vue-fsd/fsd-layers": [
    "error",
    {
      "src": "src",
      "required": ["app", "shared"],
      "allowed": ["app", "pages", "widgets", "features", "entities", "shared", "main.ts"],
      "ignore": ["*.d.ts", "assets", "styles"]
    }
  ]
}
```

This configuration:

- Requires `app` and `shared` layers (mandatory in FSD)
- Allows the standard FSD layers: `app`, `pages`, `widgets`, `features`, `entities`, `shared`, plus `main.ts` (the default allowed list)
- Ignores TypeScript declaration files and common asset directories

Note: The `allowed` configuration above matches the default values, so you could omit the `allowed` option entirely and get the same behavior.

## When Not To Use

- If your project doesn't follow Feature-Sliced Design architecture
- If you need more flexible directory structure validation
- If you prefer to handle directory structure validation outside of ESLint

## Performance Notes

This rule performs filesystem operations and is designed to run only once per ESLint session using the `runOnce` utility. This prevents redundant directory scans when linting multiple files in the same project.

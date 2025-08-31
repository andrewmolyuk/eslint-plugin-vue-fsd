# public-api

Enforce consistent public API structure in FSD slices.

This rule ensures that each slice in Feature-Sliced Design layers has a proper public API file. It checks for the existence of the specified filename (by default `index.ts`) in each slice directory and reports violations when slices are missing their public API or have incorrect API files.

## Rule Details

This rule enforces FSD public API conventions by:

- Checking that each slice has the expected public API file (e.g., `index.ts`)
- Reporting slices that are missing their public API files
- Reporting invalid public API files (e.g., `index.js` when expecting `index.ts`)
- Supporting custom filenames for public API files
- Allowing certain slices to be ignored from validation
- Running filesystem checks only once per lint session for performance

**Default Behavior**: With no configuration, the rule checks for `index.ts` files in all standard FSD layers (`app`, `pages`, `widgets`, `features`, `entities`, `shared`).

## Options

```json
{
  "vue-fsd/public-api": [
    "error",
    {
      "src": "src",
      "layers": ["features", "entities", "shared"],
      "filename": "index.ts",
      "ignore": ["temp", "legacy"]
    }
  ]
}
```

### `src` (string)

The source directory path to check for FSD structure. Defaults to `"src"`.

### `layers` (array of strings)

List of FSD layers to check for public API files. Only slices within these layers will be validated.

Default: `["app", "pages", "widgets", "features", "entities", "shared"]`

### `filename` (string)

The expected filename for public API files in each slice.

Default: `"index.ts"`

### `ignore` (array of strings)

List of slice names to ignore when checking for public API files. Useful for temporary slices or legacy code that doesn't follow the convention.

Default: `[]` (no ignores)

## Examples

### ✅ Correct

#### Default behavior (no configuration required)

```json
{
  "vue-fsd/public-api": "error"
}
```

```text
src/
├── features/
│   ├── auth/
│   │   ├── index.ts     ✅ has public API
│   │   └── model.ts
│   └── profile/
│       ├── index.ts     ✅ has public API
│       └── api.ts
└── entities/
    └── user/
        ├── index.ts     ✅ has public API
        └── model.ts
```

#### Custom filename

```json
{
  "vue-fsd/public-api": [
    "error",
    {
      "filename": "public-api.js"
    }
  ]
}
```

```text
src/
└── features/
    └── auth/
        ├── public-api.js  ✅ custom public API filename
        └── model.js
```

### ❌ Incorrect

#### Missing public API file

```text
src/
└── features/
    └── auth/
        ├── model.ts      ❌ missing index.ts
        └── ui.tsx
```

```text
Slice "auth" in layer "features" is missing a public API file (index.ts).
```

#### Invalid public API file

```text
src/
└── features/
    └── auth/
        ├── index.ts      ✅ correct public API
        ├── index.js      ❌ invalid additional index file
        └── model.ts
```

```text
Slice "auth" in layer "features" has an invalid public API file "index.js". Expected index.ts.
```

## Typical FSD Configuration

For a standard Feature-Sliced Design project:

```json
{
  "vue-fsd/public-api": [
    "error",
    {
      "src": "src",
      "layers": ["features", "entities", "shared"],
      "filename": "index.ts",
      "ignore": ["__tests__", "temp"]
    }
  ]
}
```

This configuration:

- Checks `features`, `entities`, and `shared` layers for public API files
- Expects `index.ts` as the public API filename
- Ignores test directories and temporary slices

## When Not To Use

- If your project doesn't follow Feature-Sliced Design architecture
- If you don't want to enforce public API conventions
- If your slices use different public API patterns that aren't file-based

## Related Rules

- [`fsd-layers`](./fsd-layers.md) - Enforces overall FSD layer structure
- [`no-processes-layer`](./no-processes-layer.md) - Prevents usage of deprecated processes layer

## Performance Notes

This rule performs filesystem operations and is designed to run only once per ESLint session using the `runOnce` utility. This prevents redundant directory scans when linting multiple files in the same project.

# no-higher-level-imports

Forbid importing from higher FSD layers.

## Rule Details

This rule enforces the Feature-Sliced Design (FSD) architecture principle that prevents importing from higher layers. In FSD, layers are organized in a hierarchy where higher layers can import from lower layers, but not vice versa.

The default layer hierarchy (from highest to lowest) is:

- `app` (highest)
- `pages`
- `widgets`
- `features`
- `entities`
- `shared` (lowest)

For example, a file in the `features` layer can import from `entities` and `shared` layers, but cannot import from `widgets`, `pages`, or `app` layers.

## Examples

❌ **Incorrect** code for this rule:

```js
// In src/features/auth/login.js
import Button from 'widgets/button' // ❌ features cannot import from widgets
import Layout from 'app/layout' // ❌ features cannot import from app
```

```js
// In src/entities/user/model.js
import UserCard from 'widgets/user-card' // ❌ entities cannot import from widgets
```

✅ **Correct** code for this rule:

```js
// In src/features/auth/login.js
import { userApi } from 'entities/user' // ✅ features can import from entities
import { config } from 'shared/config' // ✅ features can import from shared
import './styles.css' // ✅ relative imports are allowed
```

```js
// In src/widgets/user-card/ui.js
import { User } from 'entities/user' // ✅ widgets can import from entities
import { Button } from 'shared/ui' // ✅ widgets can import from shared
```

## Options

This rule accepts an options object with the following properties:

### `src`

- Type: `string`
- Default: `'src'`

The source directory containing the FSD layers.

### `layers`

- Type: `string[]`
- Default: `['app', 'pages', 'widgets', 'features', 'entities', 'shared']`

An array of layer names in order from highest to lowest. Files in lower layers cannot import from higher layers.

### `ignore`

- Type: `string[]`
- Default: `[]`

An array of [minimatch](https://github.com/isaacs/minimatch) patterns for import paths to ignore.

## Configuration Examples

### Default Configuration

```js
{
  "rules": {
    "vue-fsd/no-higher-level-imports": "error"
  }
}
```

### Custom Configuration

```js
{
  "rules": {
    "vue-fsd/no-higher-level-imports": ["error", {
      "src": "source",
      "layers": ["core", "features", "shared"],
      "ignore": ["shared/lib/**", "*/test-utils"]
    }]
  }
}
```

## When Not To Use

You might want to disable this rule if:

- You're not following the Feature-Sliced Design architecture
- You have a different layer hierarchy that doesn't match the FSD conventions
- You're in a migration period and need temporary exceptions to the layer rules

## Related Rules

- [`fsd-layers`](./fsd-layers.md) - Enforces the presence of required FSD layers
- [`public-api`](./public-api.md) - Enforces consistent public API structure in FSD slices
- [`no-ui-in-app`](./no-ui-in-app.md) - Forbids UI components in the app layer

## Further Reading

- [Feature-Sliced Design](https://feature-sliced.design/)
- [FSD Layer Rules](https://feature-sliced.design/docs/reference/layers)

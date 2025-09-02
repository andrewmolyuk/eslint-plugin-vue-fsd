# no-cross-slice-imports

Forbid cross-imports between slices on the same layer.

## Rule Details

This rule prevents importing between different slices that belong to the same FSD layer. According to Feature-Sliced Design principles, slices on the same layer should not directly import from each other. Instead, they should:

1. Use public APIs when necessary
2. Move shared logic to a lower layer (like `shared`)
3. Communicate through higher layers when interaction is needed

This rule helps maintain proper separation of concerns and prevents tight coupling between slices.

## Examples

❌ **Incorrect** code for this rule:

```js
// In src/widgets/user-card/ui.js
import Button from 'widgets/button/ui' // ❌ cross-slice import within widgets layer
```

```js
// In src/features/auth/login.js
import { validation } from 'features/validation/lib' // ❌ cross-slice import within features layer
```

```js
// In src/entities/user/model.js
import { formatDate } from 'entities/datetime/lib' // ❌ cross-slice import within entities layer
```

✅ **Correct** code for this rule:

```js
// In src/widgets/user-card/ui.js
import Button from 'shared/ui/button' // ✅ import from shared layer
import { UserEntity } from 'entities/user' // ✅ import from lower layer
```

```js
// In src/features/auth/login.js
import { validateForm } from 'shared/lib/validation' // ✅ moved to shared layer
import { User } from 'entities/user' // ✅ import from lower layer
```

```js
// In src/entities/user/model.js
import { formatDate } from 'shared/lib/datetime' // ✅ import from shared layer
```

## Options

This rule accepts an options object with the following properties:

### `src`

- Type: `string`
- Default: `'src'`

The source directory containing the FSD layers.

### `layers`

- Type: `string[]`
- Default: `['widgets', 'features', 'entities']`

An array of layer names where cross-slice imports should be forbidden. By default, this rule only applies to layers where slices commonly exist and cross-imports are problematic.

### `ignore`

- Type: `string[]`
- Default: `[]`

An array of [minimatch](https://github.com/isaacs/minimatch) patterns for import paths to ignore.

## Configuration Examples

### Default Configuration

```js
{
  "rules": {
    "vue-fsd/no-cross-slice-imports": "error"
  }
}
```

### Custom Configuration

```js
{
  "rules": {
    "vue-fsd/no-cross-slice-imports": ["error", {
      "src": "source",
      "layers": ["components", "features", "entities"],
      "ignore": ["*/test-utils", "*/mocks/**"]
    }]
  }
}
```

## When Not To Use

You might want to disable this rule if:

- You're not following the Feature-Sliced Design architecture
- You have a specific architectural need for cross-slice communication
- You're in a migration period and need temporary exceptions
- Your project uses a different slice organization pattern

## Related Rules

- [`no-higher-level-imports`](./no-higher-level-imports.md) - Forbids importing from higher FSD layers
- [`fsd-layers`](./fsd-layers.md) - Enforces the presence of required FSD layers
- [`public-api`](./public-api.md) - Enforces consistent public API structure in FSD slices

## Further Reading

- [Feature-Sliced Design](https://feature-sliced.design/)
- [FSD Slice Rules](https://feature-sliced.design/docs/reference/slices)
- [Cross-Slice Communication](https://feature-sliced.design/docs/guides/examples/communication)

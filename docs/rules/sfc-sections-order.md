# sfc-sections-order

Enforce a consistent order of top-level sections in Vue Single File Components.

## Why

This rule helps maintain consistency across Vue Single File Components by enforcing a specific order of `<script>`, `<template>`, and `<style>` blocks. A consistent structure makes components easier to read, understand, and maintain across a project.

The rule also enforces Vue-specific ordering constraints:

- `<script setup>` blocks must come before regular `<script>` blocks when both are present
- Global `<style>` blocks must come before `<style scoped>` blocks when both are present

## Rule details

- Rule name: `vue-fsd/sfc-sections-order`
- Default messageId: `wrongOrder`
- Type: `suggestion`

This rule validates the order of top-level sections in Vue Single File Components using Vue's official SFC compiler for accurate parsing.

## Options

The rule accepts a single options object with the following properties:

- `order` (array) — an array of strings defining the desired section order. Default: `["script", "template", "style"]`.
- `ignore` (array) — an array of minimatch patterns for files to ignore. Default: `[]`.

Example (ESLint config):

```json
{
  "plugins": ["vue-fsd"],
  "rules": {
    "vue-fsd/sfc-sections-order": [
      "error",
      {
        "order": ["script", "template", "style"],
        "ignore": ["**/legacy/**", "**/vendor/**"]
      }
    ]
  }
}
```

You can customize the order to match your project's conventions:

```json
{
  "rules": {
    "vue-fsd/sfc-sections-order": ["error", { "order": ["template", "script", "style"] }]
  }
}
```

You can ignore specific files or directories using minimatch patterns:

```json
{
  "rules": {
    "vue-fsd/sfc-sections-order": [
      "error",
      {
        "ignore": ["**/components/legacy/**", "**/vendor/**/*.vue", "src/old-components/**"]
      }
    ]
  }
}
```

## Examples

### ✅ Correct

With default configuration (`["script", "template", "style"]`):

```vue
<script>
export default {
  name: 'MyComponent',
}
</script>

<template>
  <div>Hello World</div>
</template>

<style>
.my-component {
  color: blue;
}
</style>
```

Script setup before regular script:

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<script>
export default {
  name: 'Counter',
}
</script>

<template>
  <div>{{ count }}</div>
</template>
```

Global styles before scoped styles:

```vue
<script setup>
// component logic
</script>

<template>
  <div class="component">Content</div>
</template>

<style>
/* Global styles */
.component {
  display: block;
}
</style>

<style scoped>
/* Scoped styles */
.component {
  padding: 1rem;
}
</style>
```

### ❌ Incorrect

Wrong section order:

```vue
<template>
  <div>Hello World</div>
</template>

<script>
export default {
  name: 'MyComponent',
}
</script>

<style>
.my-component {
  color: blue;
}
</style>
```

Regular script before script setup:

```vue
<script>
export default {
  name: 'Counter',
}
</script>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div>{{ count }}</div>
</template>
```

Scoped styles before global styles:

```vue
<template>
  <div class="component">Content</div>
</template>

<style scoped>
/* Scoped styles */
.component {
  padding: 1rem;
}
</style>

<style>
/* Global styles */
.component {
  display: block;
}
</style>
```

## Error Messages

The rule can report several different error messages:

- `wrongOrder`: "SFC top-level sections must be in order: {{order}}."
- `missingScriptOrTemplate`: "SFC should contain at least a `<script>` or a `<template>` block."
- `scriptSetupBeforeScript`: "`<script setup>` must come before regular `<script>` when both are present."
- `scopedStyleAfterGlobal`: "`<style scoped>` must come after global `<style>` when both are present."
- `parsingError`: "Unable to parse SFC file structure."

## Implementation Details

This rule uses Vue's official `@vue/compiler-sfc` package to accurately parse Single File Components, which means:

- It correctly ignores commented-out tags
- It handles complex nested structures
- It respects Vue's SFC parsing rules
- It avoids false positives from string literals containing tag-like content

The `ignore` option uses [minimatch](https://www.npmjs.com/package/minimatch) patterns for flexible file matching:

- `**` matches any number of directories
- `*` matches any filename or directory name
- Patterns are matched against the full file path
- Invalid patterns are silently ignored to prevent errors

## When not to use

Avoid using this rule in the following cases:

- When working with legacy codebases where changing section order would be disruptive (consider using the `ignore` option instead)
- When your team has established different conventions that work well for your project
- When using experimental Vue features that may not be compatible with the SFC compiler

For legacy or third-party code, consider using the `ignore` option to exclude specific files or directories rather than disabling the rule entirely.

## References

- [Vue.js Style Guide](https://vuejs.org/style-guide/rules-recommended.html#single-file-component-top-level-element-order)
- [Vue SFC Specification](https://vue-loader.vuejs.org/spec.html)
- [ESLint Documentation](https://eslint.org/docs/user-guide/configuring)

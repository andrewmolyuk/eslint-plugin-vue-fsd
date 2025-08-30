import type { Linter } from 'eslint'

declare const plugin: Linter.Plugin

export default plugin

// Named export for rules (optional convenience)
export const rules: Record<string, Linter.RuleModule>

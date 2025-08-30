import meta from './meta.js'
import noProcessesLayer from './rules/no-processes-layer.js'

const plugin = {
  meta,
  rules: {
    'no-processes-layer': noProcessesLayer,
  },
  processors: {},
  configs: {},
  utils: {},
}

// Flat config for ESLint v9+
plugin.configs.recommended = [
  {
    plugins: {
      'vue-fsd': plugin,
    },
    rules: { 'vue-fsd/no-processes-layer': 'error' },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
]

// Strict config with all rules enabled
plugin.configs.strict = [
  {
    plugins: {
      'vue-fsd': plugin,
    },
    rules: { 'vue-fsd/no-processes-layer': 'error' },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
]

// Classic config for legacy support
plugin.configs['legacy/recommended'] = {
  plugins: ['vue-fsd'],
  rules: { 'vue-fsd/no-processes-layer': 'error' },
}

// Strict config with all rules enabled (legacy)
plugin.configs['legacy/strict'] = {
  plugins: ['vue-fsd'],
  rules: { 'vue-fsd/no-processes-layer': 'error' },
}

export default plugin

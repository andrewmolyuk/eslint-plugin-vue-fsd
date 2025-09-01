import js from '@eslint/js'

export default [
  // ignore common build and dependency folders
  { ignores: ['node_modules/**', 'dist/**', '.git/**', 'examples/**', '**/*.d.ts'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    // default language options and globals for plugin source files (Node environment)
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      complexity: ['error', { max: 10 }],
    },
  },
  {
    files: ['test/**/*.js'],
    // tests run under vitest/jest-like globals
    languageOptions: {
      globals: {
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {},
  },
]

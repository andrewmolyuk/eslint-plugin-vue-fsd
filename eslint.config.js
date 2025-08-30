import js from '@eslint/js'
import eslintPlugin from 'eslint-plugin-eslint-plugin'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  // ignore common build and dependency folders
  { ignores: ['node_modules/**', 'dist/**', '.git/**', 'examples/**', '**/*.d.ts'] },
  js.configs.recommended,
  eslintPlugin.configs.recommended,
  eslintPluginPrettierRecommended,
  {
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
  },
  {
    files: ['tests/**/*.js'],
    plugins: {},
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

export default [
  // ignore common build and dependency folders
  { ignores: ['node_modules/**', 'dist/**', '.git/**', 'examples/**', '**/*.d.ts'] },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      complexity: ['error', { max: 10 }],
    },
  },
]

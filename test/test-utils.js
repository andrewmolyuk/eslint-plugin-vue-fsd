import { vi } from 'vitest'
import { RuleTester } from 'eslint'
import plugin from '../src/index.js'

// Create a rule tester with the plugin
export const createRuleTester = () => {
  return new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      'vue-modular': plugin,
    },
  })
}

// Setup test environment
export const setupTest = () => {
  vi.restoreAllMocks()
  if (global.__eslintVueFsdState) {
    delete global.__eslintVueFsdState
  }
  if (global.__eslintVueFsdRunId) {
    delete global.__eslintVueFsdRunId
  }
}

// Create a context for testing
export const createContext = (filename = 'index.js', options = [{}]) => ({
  options,
  getFilename: () => filename,
  report: vi.fn(),
  settings: {},
})

// Run a rule with the given context
export const runRule = (rule, context = createContext()) => {
  const ruleInstance = rule.create(context)
  if (ruleInstance.Program) ruleInstance.Program()
  return context
}

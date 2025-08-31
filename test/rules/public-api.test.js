import { describe, it, beforeEach, afterEach } from 'vitest'
import rule from '../../src/rules/public-api.js'
import fs from 'fs'
import { createRuleTester, setupTest } from '../test-utils.js'

const ruleTester = createRuleTester()

// Mock filesystem for testing
let mockFs = {}

beforeEach(() => {
  setupTest() // Clear global state for runOnce

  // Reset filesystem mock
  mockFs = {}

  // Mock fs functions
  const originalExistsSync = fs.existsSync
  const originalStatSync = fs.statSync
  const originalReaddirSync = fs.readdirSync

  fs.existsSync = (filePath) => {
    return mockFs[filePath] !== undefined
  }

  fs.statSync = (filePath) => {
    const item = mockFs[filePath]
    if (!item) throw new Error('ENOENT')
    return {
      isDirectory: () => item.type === 'directory',
      isFile: () => item.type === 'file',
    }
  }

  fs.readdirSync = (dirPath) => {
    const item = mockFs[dirPath]
    if (!item || item.type !== 'directory') throw new Error('ENOTDIR')
    return item.contents || []
  }

  // Store originals for cleanup
  fs._originalExistsSync = originalExistsSync
  fs._originalStatSync = originalStatSync
  fs._originalReaddirSync = originalReaddirSync
})

afterEach(() => {
  // Restore original fs functions
  fs.existsSync = fs._originalExistsSync
  fs.statSync = fs._originalStatSync
  fs.readdirSync = fs._originalReaddirSync

  delete fs._originalExistsSync
  delete fs._originalStatSync
  delete fs._originalReaddirSync
})

function setupMockFs(structure) {
  mockFs = structure
}

describe('public-api', () => {
  it('should pass when all slices have proper public API files', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features', 'entities', 'shared'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth', 'profile'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['index.ts', 'model.ts', 'ui.tsx'],
      },
      'src/features/profile': {
        type: 'directory',
        contents: ['index.ts', 'api.ts'],
      },
      'src/entities': {
        type: 'directory',
        contents: ['user'],
      },
      'src/entities/user': {
        type: 'directory',
        contents: ['index.ts', 'model.ts'],
      },
      'src/shared': {
        type: 'directory',
        contents: ['ui', 'lib'],
      },
      'src/shared/ui': {
        type: 'directory',
        contents: ['index.ts', 'button.tsx'],
      },
      'src/shared/lib': {
        type: 'directory',
        contents: ['index.ts', 'utils.ts'],
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features', 'entities', 'shared'] }],
        },
      ],
      invalid: [],
    })
  })

  it('should report missing public API files', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['model.ts', 'ui.tsx'], // missing index.ts
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [],
      invalid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'] }],
          errors: [
            {
              messageId: 'missingPublicApi',
              data: { slice: 'auth', layer: 'features', filename: 'index.ts' },
            },
          ],
        },
      ],
    })
  })

  it('should report invalid public API files', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['index.ts', 'index.js'], // has both .ts and .js index files
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [],
      invalid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'] }],
          errors: [
            {
              messageId: 'invalidPublicApi',
              data: { slice: 'auth', layer: 'features', file: 'index.js', filename: 'index.ts' },
            },
          ],
        },
      ],
    })
  })

  it('should work with custom filename option', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['public-api.js', 'model.js'],
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'], filename: 'public-api.js' }],
        },
      ],
      invalid: [],
    })
  })

  it('should ignore specified slices', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth', 'temp'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['index.ts'],
      },
      'src/features/temp': {
        type: 'directory',
        contents: ['something.ts'], // missing index.ts but should be ignored
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'], ignore: ['temp'] }],
        },
      ],
      invalid: [],
    })
  })

  it('should skip non-existent layers', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['index.ts'],
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features', 'widgets', 'pages'] }], // widgets and pages don't exist
        },
      ],
      invalid: [],
    })
  })

  it('should skip when src directory does not exist', () => {
    setupMockFs({})

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'nonexistent' }],
        },
      ],
      invalid: [],
    })
  })

  it('should handle filesystem errors gracefully', () => {
    // Mock fs.readdirSync to throw an error
    const originalReaddirSync = fs.readdirSync
    fs.readdirSync = () => {
      throw new Error('Permission denied')
    }

    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src' }],
        },
      ],
      invalid: [],
    })

    // Restore original function
    fs.readdirSync = originalReaddirSync
  })

  it('should handle statSync errors gracefully', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth'],
      },
    })

    // Mock statSync to throw for the slice directory
    const originalStatSync = fs.statSync
    fs.statSync = (filePath) => {
      if (filePath.includes('auth')) {
        throw new Error('Stat error')
      }
      const item = mockFs[filePath]
      if (!item) throw new Error('ENOENT')
      return {
        isDirectory: () => item.type === 'directory',
        isFile: () => item.type === 'file',
      }
    }

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'] }],
        },
      ],
      invalid: [],
    })

    // Restore original function
    fs.statSync = originalStatSync
  })

  it('should work with default options', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['app', 'features'],
      },
      'src/app': {
        type: 'directory',
        contents: ['index.ts'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['index.ts'],
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          // No options - should use defaults
        },
      ],
      invalid: [],
    })
  })

  it('should report multiple missing public APIs', () => {
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth', 'profile'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['model.ts'], // missing index.ts
      },
      'src/features/profile': {
        type: 'directory',
        contents: ['api.ts'], // missing index.ts
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [],
      invalid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'] }],
          errors: [
            {
              messageId: 'missingPublicApi',
              data: { slice: 'auth', layer: 'features', filename: 'index.ts' },
            },
            {
              messageId: 'missingPublicApi',
              data: { slice: 'profile', layer: 'features', filename: 'index.ts' },
            },
          ],
        },
      ],
    })
  })

  it('should handle existsSync errors gracefully', () => {
    // Mock fs.existsSync to throw an error
    const originalExistsSync = fs.existsSync
    fs.existsSync = () => {
      throw new Error('existsSync error')
    }

    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
    })

    ruleTester.run('public-api', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src' }],
        },
      ],
      invalid: [],
    })

    // Restore original function
    fs.existsSync = originalExistsSync
  })

  it('should not run multiple times due to runOnce optimization', () => {
    // Don't call setupTest() to preserve global state
    setupMockFs({
      src: {
        type: 'directory',
        contents: ['features'],
      },
      'src/features': {
        type: 'directory',
        contents: ['auth'],
      },
      'src/features/auth': {
        type: 'directory',
        contents: ['model.ts'], // missing index.ts
      },
    })

    // First run should report error
    ruleTester.run('public-api first run', rule, {
      valid: [],
      invalid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'] }],
          errors: [
            {
              messageId: 'missingPublicApi',
              data: { slice: 'auth', layer: 'features', filename: 'index.ts' },
            },
          ],
        },
      ],
    })

    // Second run should not report error due to runOnce optimization
    ruleTester.run('public-api second run', rule, {
      valid: [
        {
          code: 'const test = 1',
          options: [{ src: 'src', layers: ['features'] }],
        },
      ],
      invalid: [],
    })
  })
})

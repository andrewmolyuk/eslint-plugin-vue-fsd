import { describe, it, beforeEach, vi, expect } from 'vitest'
import rule from '../../src/rules/no-higher-level-imports.js'
import { createRuleTester, setupTest, createContext } from '../test-utils.js'

const ruleTester = createRuleTester()

describe('no-higher-level-imports rule', () => {
  beforeEach(setupTest)

  it('validates the rule', () => {
    ruleTester.run('no-higher-level-imports', rule, {
      valid: [
        {
          code: "import x from 'entities/user';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        {
          code: "import shared from 'shared/lib';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        {
          code: "import './relative';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        {
          code: "import app from 'app/main';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'], ignore: ['app/**'] }],
        },
      ],
      invalid: [
        {
          code: "import ui from 'widgets/button';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
          errors: [{ messageId: 'forbidden' }],
        },
        {
          code: "import app from 'app/main';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
          errors: [{ messageId: 'forbidden' }],
        },
        {
          code: "const pages = require('pages/home');",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
          errors: [{ messageId: 'forbidden' }],
        },
        {
          code: "const widgets = await import('widgets/modal');",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
          errors: [{ messageId: 'forbidden' }],
        },
      ],
    })
  })

  it('handles minimatch errors gracefully', () => {
    // Create an extremely long pattern that will cause minimatch to throw
    // This will trigger the catch block in isIgnoredImport (lines 68-69)
    const tooLongPattern = 'x'.repeat(64 * 1024) + 'y'

    ruleTester.run('no-higher-level-imports minimatch error', rule, {
      valid: [
        {
          code: "import shared from 'shared/lib';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'], ignore: [tooLongPattern] }],
        },
      ],
      invalid: [
        // When minimatch throws an error, the import should still be processed normally
        {
          code: "import app from 'app/main';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'], ignore: [tooLongPattern] }],
          errors: [{ messageId: 'forbidden' }],
        },
      ],
    })
  })

  it('handles edge cases and error conditions', () => {
    ruleTester.run('no-higher-level-imports edge cases', rule, {
      valid: [
        // Files outside of src directory
        {
          code: "import app from 'app/main';",
          filename: '/project/lib/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        // Files not in recognized layers
        {
          code: "import app from 'app/main';",
          filename: '/project/src/unknown-layer/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        // Empty ignore array
        {
          code: "import shared from 'shared/lib';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'], ignore: [] }],
        },
        // Import from src/ path
        {
          code: "import feature from 'src/features/other';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        // Import from src/ path without layer (should return null and be ignored)
        {
          code: "import something from 'src/';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        // Import from unknown layer
        {
          code: "import unknown from 'unknown-layer/something';",
          filename: '/project/src/features/my-feature/file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }],
        },
        // File should be ignored
        {
          code: "import app from 'app/main';",
          filename: '/project/src/features/ignored-file.js',
          options: [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'], ignore: ['**/ignored-file.js'] }],
        },
      ],
      invalid: [],
    })
  })

  it('handles missing context information', () => {
    // Test case for when context.getFilename() returns falsy (line 39)
    const mockContext = createContext(null, [{ src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] }])

    // Override getFilename to return null
    mockContext.getFilename = () => null

    // Create the rule instance
    const ruleInstance = rule.create(mockContext)

    // When filename is null, the rule should return an empty object
    // So ruleInstance should be {}
    expect(ruleInstance).toEqual({})
  })

  it('handles invalid import source values', () => {
    // Test cases for invalid source values in extractImportLayer (line 54)
    const mockContext = createContext('/project/src/features/my-feature/file.js', [
      { src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] },
    ])

    const ruleInstance = rule.create(mockContext)

    // Test with null source value
    const nullNode = { source: { value: null } }
    ruleInstance.ImportDeclaration(nullNode)

    // Test with undefined source value
    const undefinedNode = { source: { value: undefined } }
    ruleInstance.ImportDeclaration(undefinedNode)

    // Test with non-string source value
    const numberNode = { source: { value: 123 } }
    ruleInstance.ImportDeclaration(numberNode)

    // None should cause errors or reports
  })

  it('handles context.report errors gracefully', () => {
    // Test that the catch block in checkImportSource (lines 86-87) is covered
    // by creating a mock context where report throws an error
    const mockContext = createContext('/project/src/features/my-feature/file.js', [
      { src: 'src', layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] },
    ])

    // Mock the report function to throw an error
    mockContext.report = vi.fn().mockImplementation(() => {
      throw new Error('Report error')
    })

    // Create the rule instance
    const ruleInstance = rule.create(mockContext)

    // Create a mock ImportDeclaration node that would normally trigger a violation
    const mockNode = {
      source: { value: 'app/main' },
    }

    // This should trigger the catch block when context.report throws
    ruleInstance.ImportDeclaration(mockNode)

    // The error should be caught and ignored, so the test should not fail
  })
})

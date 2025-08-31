import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import rule from '../../src/rules/fsd-layers.js'
import { runRule, createContext, setupTest } from '../test-utils.js'
import fs from 'fs'
import path from 'path'

describe('fsd-layers', () => {
  const testDir = path.join(process.cwd(), 'test-src-temp')

  beforeEach(() => {
    setupTest()
    // Clean up any existing test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('allows valid FSD structure with required layers', () => {
    // Create test directory structure
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'pages'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'features'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'entities'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'shared'), { recursive: true })

    const ctx = createContext('file.js', [
      {
        src: testDir,
        required: ['app', 'pages', 'shared'],
        allowed: ['app', 'pages', 'features', 'entities', 'shared'],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('reports missing required layers', () => {
    // Create test directory structure missing some required layers
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'shared'), { recursive: true })

    const ctx = createContext('file.js', [
      {
        src: testDir,
        required: ['app', 'pages', 'shared'],
        allowed: ['app', 'pages', 'features', 'entities', 'shared'],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'missingRequired',
      data: { name: 'pages', src: testDir },
    })
  })

  it('reports not allowed layers', () => {
    // Create test directory structure with disallowed layer
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'pages'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'shared'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'processes'), { recursive: true }) // Not allowed

    const ctx = createContext('file.js', [
      {
        src: testDir,
        required: ['app', 'pages', 'shared'],
        allowed: ['app', 'pages', 'features', 'entities', 'shared'],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'notAllowed',
      data: {
        name: 'processes',
        src: testDir,
        allowed: 'app, pages, features, entities, shared',
      },
    })
  })

  it('works with default FSD options', () => {
    // Create test directory structure with FSD layers and one non-FSD folder
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'anything'), { recursive: true }) // This should be flagged

    const ctx = createContext('file.js', [
      {
        src: testDir,
      },
    ])

    const result = runRule(rule, ctx)
    // Should report the non-FSD folder as not allowed
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'notAllowed',
      data: {
        name: 'anything',
        src: testDir,
        allowed: 'app, pages, widgets, features, entities, shared, main.ts',
      },
    })
  })

  it('ignores specified patterns', () => {
    // Create test directory structure with ignored files/folders
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'pages'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'shared'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'node_modules'), { recursive: true })
    fs.mkdirSync(path.join(testDir, '.git'), { recursive: true })
    fs.writeFileSync(path.join(testDir, '.gitignore'), '')

    const ctx = createContext('file.js', [
      {
        src: testDir,
        required: ['app', 'pages', 'shared'],
        allowed: ['app', 'pages', 'shared'],
        ignore: ['node_modules', '.*', '*.md'],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('handles mixed files and directories', () => {
    // Create test directory structure with both files and directories
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'pages'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'shared'), { recursive: true })
    fs.writeFileSync(path.join(testDir, 'main.ts'), 'export {}')
    fs.writeFileSync(path.join(testDir, 'vite-env.d.ts'), '')

    const ctx = createContext('file.js', [
      {
        src: testDir,
        required: ['app', 'pages', 'shared', 'main.ts'],
        allowed: ['app', 'pages', 'shared', 'main.ts', 'vite-env.d.ts'],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('handles non-existent src directory gracefully', () => {
    const nonExistentDir = path.join(process.cwd(), 'non-existent-dir')

    const ctx = createContext('file.js', [
      {
        src: nonExistentDir,
        required: ['app'],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'invalidSrc',
      data: { src: nonExistentDir },
    })
  })

  it('handles filesystem errors gracefully', () => {
    // Test with a file instead of directory as src
    const testFile = path.join(testDir, 'test-file.txt')
    fs.mkdirSync(testDir, { recursive: true })
    fs.writeFileSync(testFile, 'test content')

    const ctx = createContext('file.js', [
      {
        src: testFile, // This is a file, not a directory
        required: ['app'],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'invalidSrc',
      data: { src: testFile },
    })
  })

  it('runs only once per session', () => {
    // Create test directory structure
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })

    const ctx1 = createContext('file1.js', [
      {
        src: testDir,
        required: ['missing-layer'],
      },
    ])

    const ctx2 = createContext('file2.js', [
      {
        src: testDir,
        required: ['missing-layer'],
      },
    ])

    // First run should report the error
    const result1 = runRule(rule, ctx1)
    expect(result1.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'missingRequired',
      data: { name: 'missing-layer', src: testDir },
    })

    // Second run should not report anything (runs only once)
    const result2 = runRule(rule, ctx2)
    expect(result2.report).not.toHaveBeenCalled()
  })

  it('handles empty arrays for options', () => {
    // Create test directory structure
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'anything'), { recursive: true })

    const ctx = createContext('file.js', [
      {
        src: testDir,
        required: [],
        allowed: [],
        ignore: [],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('handles minimatch errors gracefully', () => {
    // Create test directory structure
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(testDir, 'pages'), { recursive: true })

    // Use an extremely long pattern that will cause minimatch to throw
    const tooLongPattern = 'x'.repeat(64 * 1024) + 'y'

    const ctx = createContext('file.js', [
      {
        src: testDir,
        required: ['app', 'pages'],
        allowed: ['app', 'pages'],
        ignore: [tooLongPattern],
      },
    ])

    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('works with no options provided', () => {
    // Create test directory structure using testDir instead of real src
    const testSrcDir = path.join(testDir, 'test-src')
    fs.mkdirSync(testSrcDir, { recursive: true })
    fs.mkdirSync(path.join(testSrcDir, 'app'), { recursive: true })

    const ctx = createContext('file.js', [{ src: testSrcDir }])

    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()

    // No need to clean up - handled by afterEach
  })

  it('handles stat errors on individual files gracefully', () => {
    // Create test directory with a file that we'll make inaccessible
    fs.mkdirSync(testDir, { recursive: true })
    fs.mkdirSync(path.join(testDir, 'app'), { recursive: true })

    // Create a directory and then remove it to create a broken reference
    const problematicDir = path.join(testDir, 'broken-dir')
    fs.mkdirSync(problematicDir)

    // Mock fs.statSync to throw for this specific path
    const originalStatSync = fs.statSync
    fs.statSync = vi.fn().mockImplementation((filePath) => {
      if (filePath === problematicDir) {
        throw new Error('Stat failed')
      }
      return originalStatSync(filePath)
    })

    try {
      const ctx = createContext('file.js', [
        {
          src: testDir,
          allowed: ['app', 'pages', 'shared'],
        },
      ])

      const result = runRule(rule, ctx)
      // Should not crash even if stat fails on some entries
      expect(result.report).not.toHaveBeenCalled()
    } finally {
      // Restore original function
      fs.statSync = originalStatSync
    }
  })

  it('handles general filesystem errors in main try block', () => {
    // Mock fs.readdirSync to throw an error
    const originalReaddirSync = fs.readdirSync
    fs.readdirSync = vi.fn().mockImplementation(() => {
      throw new Error('Permission denied')
    })

    try {
      fs.mkdirSync(testDir, { recursive: true })

      const ctx = createContext('file.js', [
        {
          src: testDir,
          required: ['app'],
        },
      ])

      const result = runRule(rule, ctx)
      // Should not crash even if readdirSync throws
      expect(result.report).not.toHaveBeenCalled()
    } finally {
      // Restore original function
      fs.readdirSync = originalReaddirSync
    }
  })

  it('handles missing src directory with empty options gracefully', () => {
    const nonExistentDir = path.join(process.cwd(), 'totally-non-existent-dir')

    const ctx = createContext('file.js', [
      {
        src: nonExistentDir,
        required: [], // Empty array
        allowed: [], // Empty array
      },
    ])

    const result = runRule(rule, ctx)
    // Should not report invalidSrc when both required and allowed are empty
    expect(result.report).not.toHaveBeenCalled()
  })
})

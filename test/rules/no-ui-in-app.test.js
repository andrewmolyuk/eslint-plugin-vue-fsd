import { describe, it, beforeEach, expect, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import rule from '../../src/rules/no-ui-in-app.js'
import { setupTest, runRule, createContext } from '../test-utils.js'

describe('no-ui-in-app rule', () => {
  beforeEach(setupTest)

  it('does not report when app is missing', () => {
    // src exists but app folder does not
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return false
      return true
    })
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['pages', 'shared'])

    const context = runRule(rule)

    expect(context.report).not.toHaveBeenCalled()
  })

  it('reports when app/ui directory exists', () => {
    // Simulate src/app exists and contains ui
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return true
      if (p.endsWith(path.sep + 'ui')) return true
      return true
    })

    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      if (p.endsWith(path.sep + 'ui')) return { isDirectory: () => true }
      return { isDirectory: () => false }
    })

    vi.spyOn(fs, 'readdirSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return ['ui']
      return ['app', 'pages']
    })

    const ctx = createContext()
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith(expect.objectContaining({ messageId: 'forbidden' }))
  })

  it('ignores non-directory ui under app', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return true
      if (p.endsWith(path.sep + 'ui')) return true
      return true
    })

    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      if (p.endsWith(path.sep + 'ui')) return { isDirectory: () => false }
      return { isDirectory: () => false }
    })

    // For app, readdirSync returns ['ui']
    vi.spyOn(fs, 'readdirSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return ['ui']
      return ['app']
    })

    const ctx = createContext()
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('ignores stat errors for individual child entries', () => {
    // Simulate app exists and readdir returns one child
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return true
      return true
    })

    // First call for layerPath returns directory, then throw for child
    const statSpy = vi.spyOn(fs, 'statSync')
    statSpy.mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      // simulate stat error for child
      throw new Error('stat failed')
    })

    vi.spyOn(fs, 'readdirSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return ['child']
      return ['app']
    })

    const ctx = createContext()
    const res = runRule(rule, ctx)
    expect(res.report).not.toHaveBeenCalled()
  })

  it('ignores readdir errors at layer path', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      void p
      return { isDirectory: () => true }
    })
    vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw new Error('read failed')
    })

    const ctx = createContext()
    const res = runRule(rule, ctx)
    expect(res.report).not.toHaveBeenCalled()
  })

  it('runs once per lint session', () => {
    // Simulate app/ui exists
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return true
      if (p.endsWith(path.sep + 'ui')) return true
      return true
    })
    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      // ensure p is used to satisfy linters
      void p
      return { isDirectory: () => true }
    })
    vi.spyOn(fs, 'readdirSync').mockImplementation((p) => {
      if (p.endsWith(path.sep + 'app')) return ['ui']
      return ['app']
    })

    const first = runRule(rule)
    const second = runRule(rule)

    expect(first.report).toHaveBeenCalled()
    expect(second.report).not.toHaveBeenCalled()
  })
})

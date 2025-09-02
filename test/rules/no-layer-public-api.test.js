import { describe, it, beforeEach, expect, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import rule from '../../src/rules/no-layer-public-api.js'
import { setupTest, runRule, createContext } from '../test-utils.js'

describe('no-layer-public-api rule', () => {
  beforeEach(setupTest)

  it('does not report when no index.ts in layers', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app', 'pages'])
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)

    const ctx = runRule(rule)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  it('skips ignored entry early (covers ignore check)', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app'])
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return true
      if (p.endsWith('index.ts')) return true
      return false
    })
    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return { isDirectory: () => true }
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      return { isDirectory: () => false, isFile: () => false }
    })

    const ctx = createContext('file.js', [{ src: 'src', ignore: ['app'] }])
    const res = runRule(rule, ctx)
    expect(res.report).not.toHaveBeenCalled()
  })

  it('skips when index file is missing for a layer (covers existsSync check)', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app'])
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return true
      return false
    })
    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return { isDirectory: () => true }
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      return { isDirectory: () => false, isFile: () => false }
    })

    const ctx = runRule(rule)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  it('reports when index.ts exists at layer root', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app', 'pages'])
    // Ensure src exists and index file exists
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith('index.ts')) return true
      // treat src path as existing
      if (p === 'src' || p.endsWith(path.sep + 'src')) return true
      return false
    })

    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return { isDirectory: () => true }
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      if (p.endsWith('index.ts')) return { isFile: () => true }
      return { isDirectory: () => false, isFile: () => false }
    })

    const ctx = runRule(rule)
    expect(ctx.report).toHaveBeenCalledWith(expect.objectContaining({ messageId: 'forbidden' }))
  })

  it('respects ignore option', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app', 'pages'])
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => p.endsWith('index.ts'))
    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      void p
      return { isDirectory: () => true, isFile: () => true }
    })

    const ctx = createContext('file.js', [{ src: 'src', ignore: ['app'] }])
    const res = runRule(rule, ctx)
    expect(res.report).not.toHaveBeenCalled()
  })

  it('runs only once per session', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app'])
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      void p
      return { isDirectory: () => true, isFile: () => true }
    })

    const first = runRule(rule)
    const second = runRule(rule)

    expect(first.report).toHaveBeenCalled()
    expect(second.report).not.toHaveBeenCalled()
  })

  it('ignores stat errors on the index file', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app'])
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return true
      if (p.endsWith('index.ts')) return true
      return false
    })

    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return { isDirectory: () => true }
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      // throw when trying to stat the index file
      if (p.endsWith('index.ts')) throw new Error('stat failed')
      return { isDirectory: () => false, isFile: () => false }
    })

    const ctx = runRule(rule)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  it('ignores errors from readdirSync', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => p === 'src' || p.endsWith(path.sep + 'src'))
    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return { isDirectory: () => true }
      return { isDirectory: () => false, isFile: () => false }
    })

    vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw new Error('readdir failed')
    })

    const ctx = runRule(rule)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  it('ignores stat errors when checking the layer directory', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app'])
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return true
      if (p.endsWith('index.ts')) return true
      return false
    })

    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return { isDirectory: () => true }
      // simulate stat throwing for the layer path
      if (p.endsWith(path.sep + 'app')) throw new Error('layer stat failed')
      if (p.endsWith('index.ts')) return { isFile: () => true }
      return { isDirectory: () => false, isFile: () => false }
    })

    const ctx = runRule(rule)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  it('ignores errors thrown by existsSync when checking index path', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['app'])
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return true
      if (p.endsWith('index.ts')) throw new Error('exists failed')
      return false
    })

    vi.spyOn(fs, 'statSync').mockImplementation((p) => {
      if (p === 'src' || p.endsWith(path.sep + 'src')) return { isDirectory: () => true }
      if (p.endsWith(path.sep + 'app')) return { isDirectory: () => true }
      return { isDirectory: () => false, isFile: () => false }
    })

    const ctx = runRule(rule)
    expect(ctx.report).not.toHaveBeenCalled()
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs from 'fs'
import rule from '../../src/rules/no-processes-layer.js'
import { setupTest, runRule, createContext } from '../test-utils.js'

describe('no-processes-layer rule', () => {
  beforeEach(setupTest)

  it('allow missing processes dir', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['components', 'modules'])

    const context = runRule(rule)

    expect(context.report).not.toHaveBeenCalled()
  })

  it('report existing processes dir', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['components', 'modules', 'processes'])

    const context = runRule(rule)

    expect(context.report).toHaveBeenCalledWith(expect.objectContaining({ messageId: 'forbidden' }))
  })

  it('ignore read errors', () => {
    vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw new Error('Read error')
    })

    const context = runRule(rule)

    expect(context.report).not.toHaveBeenCalled()
  })

  it('allow to configure src path', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['components', 'modules'])

    const contextWithOptions = createContext('index.js', [{ src: 'custom/src' }])
    const context = runRule(rule, contextWithOptions)

    expect(context.report).not.toHaveBeenCalled()
    expect(context.options[0].src).toEqual('custom/src')
  })

  it('should run only once per linting session', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['components', 'processes'])

    const first = runRule(rule)
    const second = runRule(rule)

    expect(first.report).toHaveBeenCalledTimes(1)
    expect(first.report).toHaveBeenCalledWith(expect.objectContaining({ messageId: 'forbidden' }))
    expect(second.report).toHaveBeenCalledTimes(0)
  })
})

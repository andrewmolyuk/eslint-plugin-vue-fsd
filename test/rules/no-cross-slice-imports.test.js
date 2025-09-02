import { describe, it, vi, expect } from 'vitest'
import rule from '../../src/rules/no-cross-slice-imports.js'
import { createRuleTester } from '../test-utils.js'

const tester = createRuleTester()

describe('no-cross-slice-imports', () => {
  it('reports cross-slice import on same layer', () => {
    tester.run('no-cross-slice-imports', rule, {
      valid: [
        { filename: 'src/widgets/own/ui.js', code: "import Self from './self'" },
        { filename: 'src/widgets/own/ui.js', code: "import Entity from 'entities/user'" },
      ],
      invalid: [
        {
          filename: 'src/widgets/own/ui.js',
          code: "import Other from 'widgets/other/ui'",
          errors: [{ messageId: 'forbidden' }],
        },
      ],
    })
  })

  it('handles dynamic imports, require and src-prefixed imports', () => {
    tester.run('no-cross-slice-imports', rule, {
      valid: [
        // relative import should be ignored
        { filename: 'src/widgets/own/ui.js', code: "import Local from './local'" },
        // same slice import allowed
        { filename: 'src/widgets/own/ui.js', code: "import Same from 'widgets/own/ui'" },
        // non-src file should be ignored
        { filename: 'lib/widgets/own/ui.js', code: "import Other from 'widgets/other/ui'" },
        // ignore pattern prevents reporting
        { filename: 'src/widgets/own/ui.js', code: "import Other from 'widgets/other/ui'", options: [{ ignore: ['widgets/other/**'] }] },
      ],
      invalid: [
        // dynamic import
        { filename: 'src/widgets/own/ui.js', code: "import('widgets/other/ui')", errors: [{ messageId: 'forbidden' }] },
        // require call
        { filename: 'src/widgets/own/ui.js', code: "const x = require('widgets/other/ui')", errors: [{ messageId: 'forbidden' }] },
        // src-prefixed import
        { filename: 'src/widgets/own/ui.js', code: "import Other from 'src/widgets/other/ui'", errors: [{ messageId: 'forbidden' }] },
      ],
    })
  })

  it('ignores when current layer is not in configured layers and when file has no slice', () => {
    tester.run('no-cross-slice-imports', rule, {
      valid: [
        // current layer 'app' is not in default options.layers, should be ignored
        { filename: 'src/app/main.js', code: "import Other from 'widgets/other/ui'" },
        // file at layer root (no slice) should be ignored
        { filename: 'src/widgets/index.js', code: "import Other from 'widgets/other/ui'" },
        // test layer IS in configured layers but file has no slice - should be ignored
        { filename: 'src/entities/index.js', code: "import Other from 'entities/other/ui'", options: [{ layers: ['entities'] }] },
      ],
      invalid: [
        // test layer IS in configured layers and file HAS slice - should report error
        {
          filename: 'src/entities/user/index.js',
          code: "import Other from 'entities/other/ui'",
          options: [{ layers: ['entities'] }],
          errors: [{ messageId: 'forbidden' }],
        },
      ],
    })
  })

  it('executes catch block when helper throws', async () => {
    const { createContext } = await import('../test-utils.js')
    const utils = await import('../../src/utils.js')
    // mock isIgnoredImport to throw to hit the catch block
    const spy = vi.spyOn(utils, 'isIgnoredImport').mockImplementation(() => {
      throw new Error('mock')
    })

    const ctx = createContext('src/widgets/own/ui.js')
    const ruleInstance = rule.create(ctx)
    // call visitor directly
    ruleInstance.ImportDeclaration({ source: { value: 'widgets/other/ui' } })

    // no report should be called because exception is swallowed
    expect(ctx.report).not.toHaveBeenCalled()

    spy.mockRestore()
  })

  it('covers edge cases for missing context and shouldIgnoreFile', async () => {
    const { createContext } = await import('../test-utils.js')

    // test missing getFilename
    const ctxNoFilename = { ...createContext(), getFilename: null }
    const ruleInstance1 = rule.create(ctxNoFilename)
    expect(ruleInstance1).toEqual({})

    // test shouldIgnoreFile returns true
    const ctxIgnored = createContext('src/widgets/own/ui.js', [{ ignore: ['**/*'] }])
    const ruleInstance2 = rule.create(ctxIgnored)
    expect(ruleInstance2).toEqual({})

    // test when layerIndex is not -1 (positive branch of line 48)
    const ctxInLayer = createContext('src/widgets/user/ui.js', [{ layers: ['widgets'] }])
    const ruleInstance3 = rule.create(ctxInLayer)
    expect(typeof ruleInstance3.ImportDeclaration).toBe('function')
    expect(typeof ruleInstance3.CallExpression).toBe('function')

    // test explicit case where layerIndex === -1 (negative branch of line 48)
    const ctxNotInLayer = createContext('src/pages/user/ui.js', [{ layers: ['widgets', 'entities'] }]) // pages not in layers
    const ruleInstance4 = rule.create(ctxNotInLayer)
    expect(ruleInstance4).toEqual({})
  })
})

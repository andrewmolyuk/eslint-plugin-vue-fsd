import { describe, it, expect } from 'vitest'
import plugin from '../src/index.js'

describe('plugin configs', () => {
  it('provides recommended preset for ESLint v9', () => {
    const recommended = plugin.configs.recommended
    expect(Array.isArray(recommended)).toBe(true)

    const cfg = recommended[0]
    expect(cfg).toBeDefined()
    // plugin is exposed under plugins property for modern configs
    expect(cfg.plugins).toBeDefined()
    expect(cfg.plugins['vue-fsd']).toBe(plugin)

    // rules map should contain the recommended rules
    expect(cfg.rules).toBeDefined()
    expect(cfg.rules['vue-fsd/no-processes-layer']).toBe('error')
    expect(cfg.rules['vue-fsd/no-ui-in-app']).toBe('error')

    // languageOptions should be present for modern config
    expect(cfg.languageOptions).toBeDefined()
    expect(cfg.languageOptions.ecmaVersion).toBe(2022)
  })

  it('provides legacy recommended preset for ESLint v8', () => {
    const legacy = plugin.configs['legacy/recommended']
    expect(legacy).toBeDefined()
    // legacy config exposes plugins as an array
    expect(Array.isArray(legacy.plugins)).toBe(true)
    expect(legacy.plugins).toContain('vue-fsd')

    expect(legacy.rules).toBeDefined()
    expect(legacy.rules['vue-fsd/no-processes-layer']).toBe('error')
    expect(legacy.rules['vue-fsd/no-ui-in-app']).toBe('error')
  })
})

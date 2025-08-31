import { describe, it, expect, beforeEach } from 'vitest'
import rule from '../../src/rules/sfc-sections-order.js'
import { runRule, createContext, setupTest } from '../test-utils.js'

describe('sfc-sections-order', () => {
  beforeEach(() => {
    setupTest()
  })

  it('reports when neither template nor script present', () => {
    const src = `<style>.a{}</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'missingScriptOrTemplate',
    })
  })

  it('allows correct order: script -> template -> style', () => {
    const src = `<script>export default {}</script>
<template><div></div></template>
<style>.a{}</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('reports wrong section order', () => {
    const src = `<template><div></div></template>
<script>export default {}</script>
<style>.a{}</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'wrongOrder',
      data: { order: 'script -> template -> style' },
    })
  })

  it('allows script setup before template', () => {
    const src = `<script setup>
const msg = 'Hello'
</script>
<template><div>{{ msg }}</div></template>
<style>.a{}</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('reports when regular script comes before script setup', () => {
    const src = `<script>
export default { name: 'Test' }
</script>
<script setup>
const msg = 'Hello'
</script>
<template><div></div></template>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'scriptSetupBeforeScript',
    })
  })

  it('allows script setup before regular script', () => {
    const src = `<script setup>
const msg = 'Hello'
</script>
<script>
export default { name: 'Test' }
</script>
<template><div></div></template>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('allows global style before scoped style', () => {
    const src = `<script setup>
const msg = 'Hello'
</script>
<template><div></div></template>
<style>
.global { color: red; }
</style>
<style scoped>
.scoped { color: blue; }
</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('reports when scoped style comes before global style', () => {
    const src = `<script setup>
const msg = 'Hello'
</script>
<template><div></div></template>
<style scoped>
.scoped { color: blue; }
</style>
<style>
.global { color: red; }
</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'scopedStyleAfterGlobal',
    })
  })

  it('handles multiple global and scoped styles correctly', () => {
    const src = `<script setup>
const msg = 'Hello'
</script>
<template><div></div></template>
<style>
.global1 { color: red; }
</style>
<style>
.global2 { color: green; }
</style>
<style scoped>
.scoped1 { color: blue; }
</style>
<style scoped>
.scoped2 { color: purple; }
</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('ignores commented out tags', () => {
    const src = `<!-- <style>commented out</style> -->
<script setup>
const msg = 'Hello'
</script>
<template><div></div></template>
<style>.a{}</style>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('works with custom order option', () => {
    const src = `<template><div></div></template>
<script>export default {}</script>
<style>.a{}</style>`
    const ctx = createContext('file.vue', [{ order: ['template', 'script', 'style'] }])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('reports wrong order with custom order option', () => {
    const src = `<script>export default {}</script>
<template><div></div></template>
<style>.a{}</style>`
    const ctx = createContext('file.vue', [{ order: ['template', 'script', 'style'] }])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'wrongOrder',
      data: { order: 'template -> script -> style' },
    })
  })

  it('handles only template', () => {
    const src = `<template><div></div></template>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('handles only script', () => {
    const src = `<script>export default {}</script>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('handles only script setup', () => {
    const src = `<script setup>const msg = 'Hello'</script>`
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('skips non-vue files', () => {
    const src = `<template><div></div></template>`
    const ctx = createContext('file.js')
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('reports parsing error when SFC compiler fails', () => {
    // Mock getSourceCode to return invalid input that will cause SFC compiler to throw
    const ctx = createContext('file.vue')
    ctx.getSourceCode = () => ({ text: null }) // This will cause parse to throw
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'parsingError',
    })
  })

  it('works with no options provided', () => {
    const src = `<script>export default {}</script><template><div></div></template><style>h1{color:red;}</style>`
    // Create context with no options to test the fallback case in parseRuleOptions
    const ctx = createContext('file.vue', [])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('ignores files matching ignore patterns', () => {
    const src = `<template><div></div></template><script>export default {}</script><style>h1{color:red;}</style>`
    const ctx = createContext('src/components/legacy/OldComponent.vue', [{ ignore: ['**/legacy/**'] }])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('ignores files matching multiple ignore patterns', () => {
    const src = `<template><div></div></template><script>export default {}</script><style>h1{color:red;}</style>`
    const ctx = createContext('src/test/TestComponent.vue', [{ ignore: ['**/test/**', '**/legacy/**'] }])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).not.toHaveBeenCalled()
  })

  it('does not ignore files not matching ignore patterns', () => {
    const src = `<template><div></div></template><script>export default {}</script><style>h1{color:red;}</style>`
    const ctx = createContext('src/components/MyComponent.vue', [{ ignore: ['**/legacy/**'] }])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'wrongOrder',
      data: { order: 'script -> template -> style' },
    })
  })

  it('handles minimatch errors gracefully', () => {
    const src = `<template><div></div></template>
<script>export default {}</script>
<style>h1{color:red;}</style>`

    // Create an extremely long pattern that exceeds minimatch's 64KB limit
    // This will cause minimatch to throw "pattern is too long" error
    const tooLongPattern = 'x'.repeat(64 * 1024) + 'y'

    const ctx = createContext('file.vue', [{ ignore: [tooLongPattern] }])
    ctx.getSourceCode = () => ({ text: src })

    const result = runRule(rule, ctx)

    // When minimatch throws an error, the catch block returns false,
    // which means the file is NOT ignored and should be processed normally
    // Since the SFC has wrong order (template before script), it should report an error
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'wrongOrder',
      data: { order: 'script -> template -> style' },
    })
  })

  it('handles non-array ignore option gracefully', () => {
    const src = `<template><div></div></template><script>export default {}</script><style>h1{color:red;}</style>`
    const ctx = createContext('src/components/MyComponent.vue', [{ ignore: 'not-an-array' }])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'wrongOrder',
      data: { order: 'script -> template -> style' },
    })
  })

  it('uses default order when invalid order option is provided', () => {
    const src = `<template><div></div></template><script>export default {}</script><style>h1{color:red;}</style>`
    const ctx = createContext('src/components/MyComponent.vue', [{ order: ['invalid', 'order'] }])
    ctx.getSourceCode = () => ({ text: src })
    const result = runRule(rule, ctx)
    expect(result.report).toHaveBeenCalledWith({
      node: undefined,
      messageId: 'wrongOrder',
      data: { order: 'script -> template -> style' }, // Uses default order
    })
  })
})

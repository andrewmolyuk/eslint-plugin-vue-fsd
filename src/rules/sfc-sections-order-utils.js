import { parse as parseSFC } from '@vue/compiler-sfc'
import { minimatch } from 'minimatch'

export function shouldIgnoreFile(filename, ignorePatterns) {
  if (!ignorePatterns || !Array.isArray(ignorePatterns)) {
    return false
  }

  return ignorePatterns.some((pattern) => {
    try {
      return minimatch(filename, pattern)
    } catch {
      return false
    }
  })
}

export function parseOrderOption(options, defaultOrder) {
  if (Array.isArray(options.order) && options.order.length === 3 && options.order.every((section) => defaultOrder.includes(section))) {
    return options.order
  }
  return defaultOrder
}

export function collectScriptBlocks(descriptor) {
  const scriptBlocks = []
  if (descriptor.scriptSetup && descriptor.scriptSetup.loc) {
    scriptBlocks.push({ type: 'setup', offset: descriptor.scriptSetup.loc.start.offset })
  }
  if (descriptor.script && descriptor.script.loc) {
    scriptBlocks.push({ type: 'regular', offset: descriptor.script.loc.start.offset })
  }
  return scriptBlocks
}

export function validateScriptOrder(scriptBlocks, context, node) {
  if (scriptBlocks.length === 2) {
    const setupBlock = scriptBlocks.find((b) => b.type === 'setup')
    const regularBlock = scriptBlocks.find((b) => b.type === 'regular')
    if (setupBlock.offset > regularBlock.offset) {
      context.report({ node, messageId: 'scriptSetupBeforeScript' })
      return false
    }
  }
  return true
}

export function addScriptBlocksToTags(scriptBlocks, tags) {
  scriptBlocks.forEach((block) => {
    tags.push({ name: 'script', index: block.offset })
  })
}

export function collectStyleBlocks(descriptor) {
  const styleBlocks = []
  descriptor.styles.forEach((style) => {
    if (style.loc) {
      const isScoped = style.scoped === true
      styleBlocks.push({
        type: isScoped ? 'scoped' : 'global',
        offset: style.loc.start.offset,
      })
    }
  })
  return styleBlocks
}

export function validateStyleOrder(styleBlocks, context, node) {
  const globalStyles = styleBlocks.filter((s) => s.type === 'global')
  const scopedStyles = styleBlocks.filter((s) => s.type === 'scoped')

  if (globalStyles.length > 0 && scopedStyles.length > 0) {
    const lastGlobal = Math.max(...globalStyles.map((s) => s.offset))
    const firstScoped = Math.min(...scopedStyles.map((s) => s.offset))
    if (firstScoped < lastGlobal) {
      context.report({ node, messageId: 'scopedStyleAfterGlobal' })
      return false
    }
  }
  return true
}

export function addStyleBlocksToTags(styleBlocks, tags) {
  styleBlocks.forEach((style) => {
    tags.push({ name: 'style', index: style.offset })
  })
}

export function checkRequiredSections(tags, context, node) {
  const names = tags.map((t) => t.name)
  const hasTemplate = names.includes('template')
  const hasScript = names.includes('script')

  if (!hasTemplate && !hasScript) {
    context.report({ node, messageId: 'missingScriptOrTemplate' })
    return false
  }
  return true
}

export function groupSectionsByType(tags) {
  // Sort tags by their position in the file
  tags.sort((a, b) => a.index - b.index)

  // Group consecutive blocks of the same type
  const sections = []
  let currentSection = null

  for (const tag of tags) {
    if (currentSection && currentSection.name === tag.name) {
      continue // Skip, we already have this section type
    }
    currentSection = { name: tag.name }
    sections.push(currentSection)
  }
  return sections
}

export function checkSectionOrder(sections, order, context, node) {
  const sectionOrder = sections.map((s) => order.indexOf(s.name)).filter((i) => i >= 0)

  for (let i = 0; i + 1 < sectionOrder.length; i++) {
    if (sectionOrder[i] > sectionOrder[i + 1]) {
      context.report({ node, messageId: 'wrongOrder', data: { order: order.join(' -> ') } })
      return
    }
  }
}

export function processVueFile(context, node, filename, order) {
  const source = context.getSourceCode().text
  const tags = []

  try {
    const { descriptor } = parseSFC(source, { filename })

    // Process template
    if (descriptor.template && descriptor.template.loc) {
      tags.push({ name: 'template', index: descriptor.template.loc.start.offset })
    }

    // Process script blocks
    const scriptBlocks = collectScriptBlocks(descriptor)
    if (!validateScriptOrder(scriptBlocks, context, node)) {
      return
    }
    addScriptBlocksToTags(scriptBlocks, tags)

    // Process style blocks
    const styleBlocks = collectStyleBlocks(descriptor)
    if (!validateStyleOrder(styleBlocks, context, node)) {
      return
    }
    addStyleBlocksToTags(styleBlocks, tags)

    // Validate overall section order
    if (!checkRequiredSections(tags, context, node)) {
      return
    }

    const sections = groupSectionsByType(tags)
    checkSectionOrder(sections, order, context, node)
  } catch {
    context.report({ node, messageId: 'parsingError' })
    return
  }
}

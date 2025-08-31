import { parseRuleOptions } from '../utils.js'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { minimatch } from 'minimatch'

const defaultOptions = {
  order: ['script', 'template', 'style'],
  ignore: [],
}

function processScriptBlocks(descriptor, context, node, tags) {
  const scriptBlocks = []
  if (descriptor.scriptSetup && descriptor.scriptSetup.loc) {
    scriptBlocks.push({ type: 'setup', offset: descriptor.scriptSetup.loc.start.offset })
  }
  if (descriptor.script && descriptor.script.loc) {
    scriptBlocks.push({ type: 'regular', offset: descriptor.script.loc.start.offset })
  }

  // Check script setup before script ordering if both exist
  if (scriptBlocks.length === 2) {
    const setupBlock = scriptBlocks.find((b) => b.type === 'setup')
    const regularBlock = scriptBlocks.find((b) => b.type === 'regular')
    if (setupBlock.offset > regularBlock.offset) {
      context.report({ node, messageId: 'scriptSetupBeforeScript' })
      return false
    }
  }

  // Add script blocks to tags array
  scriptBlocks.forEach((block) => {
    tags.push({ name: 'script', index: block.offset })
  })

  return true
}

function processStyleBlocks(descriptor, context, node, tags) {
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

  // Check global before scoped style ordering
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

  // Add style blocks to tags array
  styleBlocks.forEach((style) => {
    tags.push({ name: 'style', index: style.offset })
  })

  return true
}

function validateSectionOrder(tags, order, context, node) {
  const names = tags.map((t) => t.name)

  const hasTemplate = names.includes('template')
  const hasScript = names.includes('script')

  if (!hasTemplate && !hasScript) {
    context.report({ node, messageId: 'missingScriptOrTemplate' })
    return
  }

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

  // Check that sections follow the configured order
  const sectionOrder = sections.map((s) => order.indexOf(s.name)).filter((i) => i >= 0)

  for (let i = 0; i + 1 < sectionOrder.length; i++) {
    if (sectionOrder[i] > sectionOrder[i + 1]) {
      context.report({ node, messageId: 'wrongOrder', data: { order: order.join(' -> ') } })
      return
    }
  }
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce single-file component top-level sections order (configurable via `order` option).',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          order: {
            description: 'Array of top-level sections in desired order, e.g. ["script","template","style"].',
            type: 'array',
            items: { enum: ['script', 'template', 'style'] },
          },
          ignore: {
            description: 'Array of minimatch patterns for files to ignore.',
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      missingScriptOrTemplate: 'SFC should contain at least a <script> or a <template> block.',
      wrongOrder: 'SFC top-level sections must be in order: {{order}}.',
      parsingError: 'Unable to parse SFC file structure.',
      scriptSetupBeforeScript: '<script setup> must come before regular <script> when both are present.',
      scopedStyleAfterGlobal: '<style scoped> must come after global <style> when both are present.',
    },
  },

  create(context) {
    const filename = context.getFilename && context.getFilename()
    if (!filename || !filename.endsWith('.vue')) return {}

    const options = parseRuleOptions(context, defaultOptions)

    // Check if file should be ignored
    if (options.ignore && Array.isArray(options.ignore)) {
      const shouldIgnore = options.ignore.some((pattern) => {
        try {
          return minimatch(filename, pattern)
        } catch {
          return false
        }
      })
      if (shouldIgnore) return {}
    }

    let order = defaultOptions.order
    if (
      Array.isArray(options.order) &&
      options.order.length === 3 &&
      options.order.every((section) => defaultOptions.order.includes(section))
    ) {
      order = options.order
    }

    return {
      Program(node) {
        const source = context.getSourceCode().text
        const tags = []

        try {
          const { descriptor } = parseSFC(source, { filename })

          // Process template
          if (descriptor.template && descriptor.template.loc) {
            tags.push({ name: 'template', index: descriptor.template.loc.start.offset })
          }

          // Process script blocks with ordering validation
          if (!processScriptBlocks(descriptor, context, node, tags)) {
            return
          }

          // Process style blocks with ordering validation
          if (!processStyleBlocks(descriptor, context, node, tags)) {
            return
          }

          // Validate overall section order
          validateSectionOrder(tags, order, context, node)
        } catch {
          context.report({ node, messageId: 'parsingError' })
          return
        }
      },
    }
  },
}

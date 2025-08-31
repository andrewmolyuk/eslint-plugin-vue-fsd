import { parseRuleOptions } from '../utils.js'
import { shouldIgnoreFile, parseOrderOption, processVueFile } from './sfc-sections-order-utils.js'

const defaultOptions = {
  order: ['script', 'template', 'style'],
  ignore: [],
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
    if (shouldIgnoreFile(filename, options.ignore)) return {}

    const order = parseOrderOption(options, defaultOptions.order)

    return {
      Program(node) {
        processVueFile(context, node, filename, order)
      },
    }
  },
}

import { parseRuleOptions } from '../utils.js'
import { shouldIgnoreFile } from './sfc-sections-order-utils.js'
import { minimatch } from 'minimatch'
import path from 'path'

const defaultOptions = {
  src: 'src',
  layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
  ignore: [],
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid importing from higher FSD layers.',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          src: { type: 'string' },
          layers: { type: 'array', items: { type: 'string' } },
          ignore: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      forbidden: 'Import from higher layer "{{imported}}" is forbidden in "{{current}}" file.',
    },
  },

  create(context) {
    const options = parseRuleOptions(context, defaultOptions)
    const filename = context.getFilename && context.getFilename()
    if (!filename) return {}

    // file-level ignore
    if (shouldIgnoreFile(filename, options.ignore)) return {}

    const normalizedSrc = path.normalize(options.src)
    const parts = path.normalize(filename).split(path.sep)
    const srcIndex = parts.indexOf(normalizedSrc)
    if (srcIndex === -1 || parts.length <= srcIndex + 1) return {}

    const currentLayer = parts[srcIndex + 1]
    const layerIndex = options.layers.indexOf(currentLayer)
    if (layerIndex === -1) return {}

    function extractImportLayer(sourceValue) {
      if (!sourceValue || typeof sourceValue !== 'string') return null
      if (sourceValue.startsWith('.') || sourceValue.startsWith('/')) return null

      const segs = sourceValue.split('/')
      if (segs[0] === normalizedSrc) return segs[1] || null
      return segs[0]
    }

    function isIgnoredImport(value) {
      if (!Array.isArray(options.ignore) || options.ignore.length === 0) return false
      return options.ignore.some((p) => {
        try {
          return minimatch(value, p)
        } catch {
          return false
        }
      })
    }

    function checkImportSource(value, node) {
      try {
        if (isIgnoredImport(value)) return
        const importedLayer = extractImportLayer(value)
        if (!importedLayer) return

        const importedIndex = options.layers.indexOf(importedLayer)
        if (importedIndex === -1) return

        if (importedIndex < layerIndex) {
          context.report({ node, messageId: 'forbidden', data: { imported: importedLayer, current: currentLayer } })
        }
      } catch {
        // ignore
      }
    }

    return {
      ImportDeclaration(node) {
        if (node.source && node.source.value) checkImportSource(node.source.value, node)
      },
      ImportExpression(node) {
        if (node.source && node.source.type === 'Literal' && node.source.value) checkImportSource(node.source.value, node)
      },
      CallExpression(node) {
        if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'require') {
          const arg = node.arguments && node.arguments[0]
          if (arg && arg.type === 'Literal' && arg.value) checkImportSource(arg.value, node)
        }
      },
    }
  },
}

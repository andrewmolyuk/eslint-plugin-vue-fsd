import { parseRuleOptions } from '../utils.js'
import { shouldIgnoreFile } from './sfc-sections-order-utils.js'
import { isIgnoredImport, extractImportTarget, getLayerAndSliceFromFilename } from '../utils.js'

const defaultOptions = {
  src: 'src',
  layers: ['pages', 'widgets', 'features', 'entities'],
  ignore: [],
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid cross-imports between slices on the same layer.',
      recommended: false,
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
      forbidden: 'Cross-slice import "{{importPath}}" is forbidden inside the same layer "{{layer}}".',
    },
  },

  create(context) {
    const options = parseRuleOptions(context, defaultOptions)
    const filename = context.getFilename && context.getFilename()
    if (!filename) return {}

    if (shouldIgnoreFile(filename, options.ignore)) return {}

    const fileInfo = getLayerAndSliceFromFilename(filename, options.src)
    if (!fileInfo || !fileInfo.slice) return {}

    const currentLayer = fileInfo.layer
    const currentSlice = fileInfo.slice
    const layerIndex = options.layers.indexOf(currentLayer)
    if (layerIndex === -1) return {}

    function checkImportSource(value, node) {
      try {
        if (isIgnoredImport(value, options.ignore)) return
        const imported = extractImportTarget(value, options.src)
        if (!imported || !imported.layer || !imported.slice) return

        // only check when same layer
        if (imported.layer !== currentLayer) return
        if (imported.slice === currentSlice) return

        // report cross-slice import
        context.report({ node, messageId: 'forbidden', data: { importPath: value, layer: currentLayer } })
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

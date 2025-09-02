import { runOnce, parseRuleOptions } from '../utils.js'
import fs from 'fs'
import path from 'path'

const defaultOptions = {
  src: 'src',
  filename: 'index.ts',
  ignore: [],
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid layer-level public API files (index.ts) at the root of layers.',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          src: { type: 'string' },
          filename: { type: 'string' },
          ignore: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      forbidden: 'Do not place a layer-level public API file "{{filename}}" inside layer "{{layer}}".',
    },
  },

  create(context) {
    const allowFsCheck = runOnce('no-layer-public-api')
    const { src, filename, ignore } = parseRuleOptions(context, defaultOptions)

    function isLayerDir(layerPath) {
      try {
        return fs.statSync(layerPath).isDirectory()
      } catch {
        return false
      }
    }

    function checkIndexInLayer(entry, node) {
      try {
        const layerPath = path.join(src, entry)
        if (!isLayerDir(layerPath)) return
        if (Array.isArray(ignore) && ignore.includes(entry)) return

        const indexPath = path.join(layerPath, filename)
        if (!fs.existsSync(indexPath)) return

        try {
          const stat = fs.statSync(indexPath)
          if (stat && typeof stat.isFile === 'function' && stat.isFile()) {
            context.report({ node, messageId: 'forbidden', data: { layer: entry, filename } })
          }
        } catch {
          // ignore stat errors on the index file
        }
      } catch {
        // ignore errors per-entry
      }
    }

    return {
      Program(node) {
        if (!allowFsCheck) return

        try {
          if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) return

          const entries = fs.readdirSync(src)
          for (const entry of entries) checkIndexInLayer(entry, node)
        } catch {
          // ignore filesystem errors
        }
      },
    }
  },
}

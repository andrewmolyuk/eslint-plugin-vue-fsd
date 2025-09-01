import { runOnce, parseRuleOptions } from '../utils.js'
import fs from 'fs'
import path from 'path'

const defaultOptions = {
  src: 'src',
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid UI segment inside the app layer (app should not contain slices/UI segments).',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          src: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      forbidden: 'Do not place "ui" segment inside the "app" layer.',
    },
  },

  create(context) {
    const allowFsCheck = runOnce('no-ui-in-app')
    const { src } = parseRuleOptions(context, defaultOptions)
    const layer = 'app'
    const forbiddenSegment = 'ui'

    function checkLayerForUi(layerPath, node) {
      if (!fs.existsSync(layerPath) || !fs.statSync(layerPath).isDirectory()) return false

      // Check each slice (immediate child directory) under app for a `ui` segment
      const entries = fs.readdirSync(layerPath)
      for (const entry of entries) {
        try {
          const entryPath = path.join(layerPath, entry)
          if (!fs.statSync(entryPath).isDirectory()) continue

          // If the entry itself is the forbidden segment (src/app/ui)
          if (entry === forbiddenSegment) {
            context.report({ node, messageId: 'forbidden' })
            return true
          }
        } catch {
          // ignore stat errors per-entry
        }
      }

      return false
    }

    return {
      Program(node) {
        if (!allowFsCheck) return

        try {
          const layerPath = path.join(src, layer)
          checkLayerForUi(layerPath, node)
        } catch {
          // ignore filesystem errors
        }
      },
    }
  },
}

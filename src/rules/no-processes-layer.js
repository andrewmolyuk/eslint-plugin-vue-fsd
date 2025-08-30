import { runOnce, parseRuleOptions } from '../utils'
import fs from 'fs'

const defaultOptions = {
  src: 'src',
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a deprecated`processes` folder inside src directory.',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          src: {
            description: 'The src path to find the `processes` folder (string).',
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      forbidden: 'Do not use a `processes` folder inside src (deprecated layer).',
    },
  },

  create(context) {
    // allow filesystem check to run only once per lint session
    const allowFsCheck = runOnce('no-processes-layer')
    const { src } = parseRuleOptions(context, defaultOptions)

    return {
      Program(node) {
        if (!allowFsCheck) return
        try {
          const entries = fs.readdirSync(src)
          for (const entry of entries) {
            if (entry === 'processes') {
              context.report({ node, messageId: 'forbidden' })
              break
            }
          }
        } catch {
          // ignore filesystem errors
        }
      },
    }
  },
}

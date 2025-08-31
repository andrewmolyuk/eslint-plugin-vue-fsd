import { runOnce, parseRuleOptions } from '../utils.js'
import fs from 'fs'
import path from 'path'
import { minimatch } from 'minimatch'

const defaultOptions = {
  src: 'src',
  required: [],
  allowed: ['app', 'pages', 'widgets', 'features', 'entities', 'shared', 'main.ts'],
  ignore: [],
}

function shouldIgnoreEntry(entry, ignore) {
  if (!Array.isArray(ignore) || ignore.length === 0) {
    return false
  }

  return ignore.some((pattern) => {
    try {
      return minimatch(entry, pattern)
    } catch {
      return false
    }
  })
}

function isValidEntry(entry, src) {
  const fullPath = path.join(src, entry)
  try {
    const stat = fs.statSync(fullPath)
    return stat.isDirectory() || stat.isFile()
  } catch {
    return false
  }
}

function getFilteredEntries(src, ignore) {
  const entries = fs.readdirSync(src)
  return entries.filter((entry) => {
    if (shouldIgnoreEntry(entry, ignore)) {
      return false
    }
    return isValidEntry(entry, src)
  })
}

function checkRequiredEntries(context, node, required, filteredEntries, src) {
  if (!Array.isArray(required) || required.length === 0) {
    return
  }

  for (const requiredEntry of required) {
    if (!filteredEntries.includes(requiredEntry)) {
      context.report({
        node,
        messageId: 'missingRequired',
        data: { name: requiredEntry, src },
      })
    }
  }
}

function checkAllowedEntries(context, node, allowed, filteredEntries, src) {
  if (!Array.isArray(allowed) || allowed.length === 0) {
    return
  }

  for (const entry of filteredEntries) {
    if (!allowed.includes(entry)) {
      context.report({
        node,
        messageId: 'notAllowed',
        data: { name: entry, src, allowed: allowed.join(', ') },
      })
    }
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce consistent layer structure in feature-sliced design.',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          src: {
            description: 'The src path to check for FSD layer structure (string).',
            type: 'string',
          },
          required: {
            description: 'List of required folders/files that must exist in src (array of strings).',
            type: 'array',
            items: {
              type: 'string',
            },
          },
          allowed: {
            description: 'List of allowed folders/files in src, others will be flagged (array of strings).',
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignore: {
            description: 'List of patterns to ignore when checking (array of strings).',
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      invalidSrc: 'Source directory "{{src}}" does not exist or is not a directory.',
      missingRequired: 'Required FSD layer "{{name}}" is missing in {{src}}.',
      notAllowed: 'FSD layer "{{name}}" is not allowed in {{src}}. Allowed: {{allowed}}.',
    },
  },

  create(context) {
    // allow filesystem check to run only once per lint session
    const allowFsCheck = runOnce('fsd-layers')
    const { src, required, allowed, ignore } = parseRuleOptions(context, defaultOptions)

    return {
      Program(node) {
        if (!allowFsCheck) return

        try {
          // Check if src directory exists
          if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
            // Only report missing src if there are specific requirements
            if ((Array.isArray(required) && required.length > 0) || (Array.isArray(allowed) && allowed.length > 0)) {
              context.report({ node, messageId: 'invalidSrc', data: { src } })
            }
            return
          }

          const filteredEntries = getFilteredEntries(src, ignore)
          checkRequiredEntries(context, node, required, filteredEntries, src)
          checkAllowedEntries(context, node, allowed, filteredEntries, src)
        } catch {
          // ignore filesystem errors
        }
      },
    }
  },
}

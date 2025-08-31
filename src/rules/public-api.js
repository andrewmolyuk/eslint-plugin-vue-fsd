import { runOnce, parseRuleOptions } from '../utils.js'
import fs from 'fs'
import path from 'path'

const defaultOptions = {
  src: 'src',
  layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
  filename: 'index.ts',
  ignore: [],
}

function getValidSlices(layerPath, ignore) {
  return fs.readdirSync(layerPath).filter((entry) => {
    const slicePath = path.join(layerPath, entry)
    try {
      return fs.statSync(slicePath).isDirectory() && !ignore.includes(entry)
    } catch {
      return false
    }
  })
}

function checkSlicePublicApi(context, node, slice, layer, slicePath, filename) {
  const sliceEntries = fs.readdirSync(slicePath)

  // Look for the specific filename
  const hasPublicApi = sliceEntries.includes(filename)
  const otherIndexFiles = sliceEntries.filter((entry) => {
    const basename = path.parse(entry).name
    return basename === 'index' && entry !== filename
  })

  if (!hasPublicApi) {
    // No public API found
    context.report({
      node,
      messageId: 'missingPublicApi',
      data: { slice, layer, filename },
    })
  }

  // Report any other index files as invalid
  for (const invalidFile of otherIndexFiles) {
    context.report({
      node,
      messageId: 'invalidPublicApi',
      data: { slice, layer, file: invalidFile, filename },
    })
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce consistent public API structure in FSD slices.',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          src: {
            description: 'The src path to check for FSD structure (string).',
            type: 'string',
          },
          layers: {
            description: 'List of FSD layers to check for public API (array of strings).',
            type: 'array',
            items: {
              type: 'string',
            },
          },
          filename: {
            description: 'Expected filename for public API files (string).',
            type: 'string',
          },
          ignore: {
            description: 'List of slice names to ignore when checking (array of strings).',
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
      missingPublicApi: 'Slice "{{slice}}" in layer "{{layer}}" is missing a public API file ({{filename}}).',
      invalidPublicApi: 'Slice "{{slice}}" in layer "{{layer}}" has an invalid public API file "{{file}}". Expected {{filename}}.',
    },
  },

  create(context) {
    // allow filesystem check to run only once per lint session
    const allowFsCheck = runOnce('public-api')
    const { src, layers, filename, ignore } = parseRuleOptions(context, defaultOptions)

    return {
      Program(node) {
        if (!allowFsCheck) return

        try {
          // Check if src directory exists
          if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
            // it should be checked in fsd-layers rule
            return
          }

          // Check each layer
          for (const layer of layers) {
            const layerPath = path.join(src, layer)

            if (!fs.existsSync(layerPath) || !fs.statSync(layerPath).isDirectory()) {
              continue
            }

            const slices = getValidSlices(layerPath, ignore)

            // Check each slice for public API
            for (const slice of slices) {
              const slicePath = path.join(layerPath, slice)
              checkSlicePublicApi(context, node, slice, layer, slicePath, filename)
            }
          }
        } catch {
          // ignore filesystem errors
        }
      },
    }
  },
}

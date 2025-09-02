export const runOnce = (ruleId) => {
  if (!global.__eslintVueFsdRunId) {
    global.__eslintVueFsdRunId = `${process.pid}_${process.cwd()}`
  }

  if (!global.__eslintVueFsdState) {
    global.__eslintVueFsdState = new Map()
  }

  const eslintRunId = global.__eslintVueFsdRunId
  if (!global.__eslintVueFsdState.has(eslintRunId)) {
    global.__eslintVueFsdState.set(eslintRunId, new Set())
  }

  const seen = global.__eslintVueFsdState.get(eslintRunId)
  if (seen.has(ruleId)) return false

  seen.add(ruleId)
  return true
}

export const parseRuleOptions = (context, defaultOptions) => {
  const options = context.options && context.options[0] ? context.options[0] : {}
  const parsed = {}

  for (const [key, value] of Object.entries(defaultOptions)) {
    parsed[key] = options[key] !== undefined ? options[key] : value

    if (Array.isArray(parsed[key])) {
      parsed[key] = parsed[key].map((item) => String(item).trim())
    } else if (typeof parsed[key] === 'string') {
      parsed[key] = String(parsed[key]).trim()
    }
  }

  return parsed
}

import { minimatch } from 'minimatch'
import path from 'path'

export const normalizeSrcPath = (src) => path.normalize(src)

export const splitPath = (filename) => path.normalize(filename).split(path.sep)

export const getSrcIndex = (parts, normalizedSrc) => parts.indexOf(normalizedSrc)

export const getLayerAndSliceFromFilename = (filename, src) => {
  const normalizedSrc = normalizeSrcPath(src)
  const parts = splitPath(filename)
  const srcIndex = getSrcIndex(parts, normalizedSrc)
  if (srcIndex === -1 || parts.length <= srcIndex + 1) return null
  const layer = parts[srcIndex + 1]
  let slice = parts.length > srcIndex + 2 ? parts[srcIndex + 2] : null
  // treat files like src/<layer>/index.js as layer-root (no slice)
  if (slice && slice.includes('.')) {
    // if the slice is the final filename, not a directory slice, consider no slice
    const isFinalSegment = parts.length === srcIndex + 3
    if (isFinalSegment) slice = null
  }
  return { layer, slice }
}

export const isIgnoredImport = (value, ignorePatterns) => {
  if (!Array.isArray(ignorePatterns) || ignorePatterns.length === 0) return false
  return ignorePatterns.some((p) => {
    try {
      return minimatch(value, p)
    } catch {
      return false
    }
  })
}

export const extractImportTarget = (sourceValue, src) => {
  if (!sourceValue || typeof sourceValue !== 'string') return null
  if (sourceValue.startsWith('.') || sourceValue.startsWith('/')) return null

  const normalizedSrc = normalizeSrcPath(src)
  const segs = sourceValue.split('/')

  const isSourcePrefixed = segs[0] === normalizedSrc
  const layerIndex = isSourcePrefixed ? 1 : 0
  const sliceIndex = isSourcePrefixed ? 2 : 1

  const layer = segs[layerIndex] || null
  const slice = segs[sliceIndex] || null

  return { layer, slice }
}

import { describe, it, expect } from 'vitest'
import { getLayerAndSliceFromFilename, extractImportTarget } from '../src/utils.js'

describe('utils', () => {
  describe('getLayerAndSliceFromFilename', () => {
    it('handles files with dots that are not final segments', () => {
      // This should cover line 54 where isFinalSegment is false
      const result = getLayerAndSliceFromFilename('src/widgets/component.vue/index.js', 'src')
      expect(result).toEqual({ layer: 'widgets', slice: 'component.vue' })
    })

    it('handles files with dots that are final segments', () => {
      // This should cover the branch where slice becomes null
      const result = getLayerAndSliceFromFilename('src/widgets/index.js', 'src')
      expect(result).toEqual({ layer: 'widgets', slice: null })
    })

    it('returns null when src not found or insufficient path', () => {
      // Line 52: srcIndex === -1
      expect(getLayerAndSliceFromFilename('lib/entities/user/index.js', 'src')).toBeNull()

      // Line 52: parts.length <= srcIndex + 1 (no layer after src)
      expect(getLayerAndSliceFromFilename('src', 'src')).toBeNull()
      expect(getLayerAndSliceFromFilename('src/', 'src')).toEqual({ layer: '', slice: null })
    })

    it('handles file directly in layer with extension (slice becomes null)', () => {
      // This should cover the isFinalSegment === true branch
      const result = getLayerAndSliceFromFilename('src/entities/user.js', 'src')
      expect(result).toEqual({ layer: 'entities', slice: null })
    })
  })

  describe('extractImportTarget', () => {
    it('handles imports with missing segments', () => {
      // This should cover line 82 where segs[1] or segs[2] could be null/undefined
      const result1 = extractImportTarget('layer', 'src')
      expect(result1).toEqual({ layer: 'layer', slice: null })

      const result2 = extractImportTarget('src/layer', 'src')
      expect(result2).toEqual({ layer: 'layer', slice: null })

      const result3 = extractImportTarget('src/', 'src')
      expect(result3).toEqual({ layer: null, slice: null })

      const result4 = extractImportTarget('src/layer/', 'src')
      expect(result4).toEqual({ layer: 'layer', slice: null })
    })

    it('handles various edge cases for branch coverage', () => {
      // Test empty string segments
      const result1 = extractImportTarget('', 'src')
      expect(result1).toBeNull()

      // Test null sourceValue
      const result2 = extractImportTarget(null, 'src')
      expect(result2).toBeNull()

      // Test relative path (should return null)
      const result3 = extractImportTarget('./relative', 'src')
      expect(result3).toBeNull()

      // Test absolute path (should return null)
      const result4 = extractImportTarget('/absolute', 'src')
      expect(result4).toBeNull()

      // Test edge case for line 82 - when segs[1] is undefined (non-src path)
      const result5 = extractImportTarget('layer/', 'src')
      expect(result5).toEqual({ layer: 'layer', slice: null })

      // Test edge case for line 82 - when segs[1] is empty string (covers the || null branch)
      const result6 = extractImportTarget('layer//', 'src')
      expect(result6).toEqual({ layer: 'layer', slice: null })

      // Test the src path with empty segments to cover segs[2] || null
      const result7 = extractImportTarget('src/layer/', 'src')
      expect(result7).toEqual({ layer: 'layer', slice: null })

      // Test edge case for line 82 - test when segs[1] exists and is truthy
      const result9 = extractImportTarget('layer/slice', 'src')
      expect(result9).toEqual({ layer: 'layer', slice: 'slice' })

      // Test edge case where segs[0] is empty but not undefined
      const result10 = extractImportTarget('/slice', 'src')
      expect(result10).toBeNull() // should return null for absolute paths

      // Test case where sourceValue starts with empty segment (to cover segs[0] || null)
      const result11 = extractImportTarget('', 'src') // empty string should return null anyway
      expect(result11).toBeNull()

      // Different approach - test non-src path where segs[0] could be empty
      const result12 = extractImportTarget('layer', 'different-src') // should go to line 82
      expect(result12).toEqual({ layer: 'layer', slice: null })

      // Test with consecutive slashes to create empty segments (may cover the || null branches)
      const result13 = extractImportTarget('layer//slice', 'src') // double slash creates empty segment
      expect(result13).toEqual({ layer: 'layer', slice: null }) // empty string between slashes makes segs[1] empty

      // Test where segs has empty strings due to splitting
      const result14 = extractImportTarget('layer/', 'different-src') // trailing slash, different src to hit line 82
      expect(result14).toEqual({ layer: 'layer', slice: null })

      // Try to hit the segs[0] || null branch by creating a path where segs[0] is empty
      // This can happen if sourceValue starts with a slash but passes the early return check
      // Since we can't test with leading slash (early return), try empty first segment differently
      const result15 = extractImportTarget('layer///', 'src') // multiple slashes create multiple empty segments
      expect(result15).toEqual({ layer: 'layer', slice: null })

      // Try another approach - test where the path doesn't match src but has edge cases
      // Test case where we force line 82 to execute with edge case values
      const result16 = extractImportTarget('0', 'src') // single character that's falsy when used as boolean
      expect(result16).toEqual({ layer: '0', slice: null })

      const result17 = extractImportTarget('false', 'src') // string 'false' is truthy
      expect(result17).toEqual({ layer: 'false', slice: null })
    })
  })
})

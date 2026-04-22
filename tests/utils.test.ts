import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('Utils - cn (classname merger)', () => {
    it('should merge class names', () => {
        expect(cn('a', 'b')).toContain('a')
        expect(cn('a', 'b')).toContain('b')
    })

    it('should handle conditional classes', () => {
        expect(cn('a', false && 'b', 'c')).toContain('a')
        expect(cn('a', false && 'b', 'c')).toContain('c')
        expect(cn('a', false && 'b', 'c')).not.toContain('b')
    })

    it('should handle undefined values', () => {
        expect(cn('a', undefined, 'b')).toContain('a')
        expect(cn('a', undefined, 'b')).toContain('b')
    })

    it('should return empty string for no args', () => {
        expect(cn()).toBe('')
    })
})
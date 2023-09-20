import { describe, expect, it } from 'vitest'
import { contractReference } from './reference'

describe('contractReference', () => {
  it('looks like HH-XXXX', () => {
    expect(contractReference()).toMatch(/^HH-[2-9A-Z]{4}$/)
  })

  it('never uses confusable characters', () => {
    for (let i = 0; i < 200; i++) {
      expect(contractReference()).not.toMatch(/[01OIL]/)
    }
  })

  it('is deterministic for a given random source', () => {
    expect(contractReference(() => 0)).toBe('HH-2222')
  })

  it('generates unique references', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 300; i++) seen.add(contractReference())
    expect(seen.size).toBe(300)
  })
})

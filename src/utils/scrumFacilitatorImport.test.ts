import { describe, it, expect, beforeEach } from 'vitest'
import { readLatestRetroNotes } from './scrumFacilitatorImport'

const KEY = 'scrum-facilitator-history'

function historyEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: '1',
    savedAt: Date.now(),
    exportData: {
      ceremonyType: 'retro',
      date: '2026-09-01',
      stepsCompleted: 5,
      totalSteps: 5,
      ...overrides,
    },
  }
}

describe('readLatestRetroNotes', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when there is no history', () => {
    expect(readLatestRetroNotes()).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    localStorage.setItem(KEY, '{not json')
    expect(readLatestRetroNotes()).toBeNull()
  })

  it('returns null when the most recent entry is not a retro', () => {
    localStorage.setItem(KEY, JSON.stringify([historyEntry({ ceremonyType: 'planning', retroNotes: undefined })]))
    expect(readLatestRetroNotes()).toBeNull()
  })

  it('returns null when a retro entry has no notes', () => {
    localStorage.setItem(KEY, JSON.stringify([historyEntry({ retroNotes: { Well: [] } })]))
    expect(readLatestRetroNotes()).toBeNull()
  })

  it('formats a single-column retro without a column header', () => {
    localStorage.setItem(KEY, JSON.stringify([
      historyEntry({ retroNotes: { Well: [{ id: 's1', text: 'Item 1' }, { id: 's2', text: 'Item 2' }] } }),
    ]))
    const result = readLatestRetroNotes()
    expect(result).toEqual({ date: '2026-09-01', text: '• Item 1\n• Item 2' })
  })

  it('formats a multi-column retro with column headers', () => {
    localStorage.setItem(KEY, JSON.stringify([
      historyEntry({
        retroNotes: {
          Well: [{ id: 's1', text: 'Item 1' }],
          Improve: [{ id: 's2', text: 'Item 2' }],
        },
      }),
    ]))
    const result = readLatestRetroNotes()
    expect(result).toEqual({ date: '2026-09-01', text: 'Well:\n• Item 1\nImprove:\n• Item 2' })
  })

  it('skips columns with only blank sticky notes', () => {
    localStorage.setItem(KEY, JSON.stringify([
      historyEntry({
        retroNotes: {
          Well: [{ id: 's1', text: '   ' }],
          Improve: [{ id: 's2', text: 'Item 2' }],
        },
      }),
    ]))
    const result = readLatestRetroNotes()
    expect(result).toEqual({ date: '2026-09-01', text: '• Item 2' })
  })

  it('finds the most recent retro, skipping non-retro entries before it', () => {
    localStorage.setItem(KEY, JSON.stringify([
      historyEntry({ ceremonyType: 'daily', retroNotes: undefined }),
      historyEntry({ date: '2026-08-15', retroNotes: { Well: [{ id: 's1', text: 'Older' }] } }),
    ]))
    const result = readLatestRetroNotes()
    expect(result).toEqual({ date: '2026-08-15', text: '• Older' })
  })

  it('returns null when the stored value is not an array', () => {
    localStorage.setItem(KEY, JSON.stringify({ not: 'an array' }))
    expect(readLatestRetroNotes()).toBeNull()
  })
})

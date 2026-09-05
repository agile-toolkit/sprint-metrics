const HISTORY_KEY = 'scrum-facilitator-history'

interface StickyNote {
  id: string
  text: string
}

type RetroNotes = Record<string, StickyNote[]>

interface ExportData {
  ceremonyType: string
  date: string
  retroNotes?: RetroNotes
}

interface HistoryEntry {
  exportData: ExportData
}

export interface RetroImport {
  date: string
  text: string
}

// Scrum Facilitator writes its last 5 ceremony sessions to
// scrum-facilitator-history (newest first). This finds the most recent
// retro with any sticky notes and flattens them into pre-fill text for
// Sprint Metrics' free-text `retrospective` field — no staleness cutoff,
// since the history is already capped at 5 entries and the button shows
// the session date so the user can judge freshness themselves.
export function readLatestRetroNotes(): RetroImport | null {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return null
    const history = JSON.parse(raw) as HistoryEntry[]
    if (!Array.isArray(history)) return null

    for (const entry of history) {
      const data = entry?.exportData
      if (data?.ceremonyType !== 'retro' || !data.retroNotes) continue
      const columns = Object.entries(data.retroNotes).filter(([, notes]) => Array.isArray(notes) && notes.some(n => n.text?.trim()))
      if (columns.length === 0) continue

      const multiColumn = columns.length > 1
      const text = columns
        .map(([column, notes]) => {
          const bullets = notes.filter(n => n.text?.trim()).map(n => `• ${n.text.trim()}`).join('\n')
          return multiColumn ? `${column}:\n${bullets}` : bullets
        })
        .join('\n')

      return { date: data.date, text }
    }
    return null
  } catch {
    return null
  }
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SprintData, ProjectConfig } from '../types'

interface Props {
  sprints: SprintData[]
  config: ProjectConfig
  onAddSprint: (sprint: SprintData) => void
  onDeleteSprint: (id: string) => void
  onUpdateConfig: (config: ProjectConfig) => void
  onClear: () => void
  onImportCSV: (text: string) => void
  onExportCSV: () => void
}

export default function SprintDataTable({
  sprints, config, onAddSprint, onDeleteSprint, onUpdateConfig, onClear, onImportCSV, onExportCSV,
}: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [planned, setPlanned] = useState(40)
  const [completed, setCompleted] = useState(0)
  const [carried, setCarried] = useState(0)
  const [goal, setGoal] = useState('')
  const [mood, setMood] = useState(0)
  const [teamSize, setTeamSize] = useState(0)
  const [absenceDays, setAbsenceDays] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [localConfig, setLocalConfig] = useState(config)
  const [pokerMsg, setPokerMsg] = useState<string | null>(null)

  const handleImportFromPoker = () => {
    try {
      const raw = localStorage.getItem('sprintMetrics_planningPoker')
      if (!raw) { setPokerMsg(t('data.poker_no_data')); return }
      const stories: { title: string; finalEstimate: number | null }[] = JSON.parse(raw)
      const estimated = stories.filter(s => s.finalEstimate !== null)
      if (estimated.length === 0) { setPokerMsg(t('data.poker_no_data')); return }
      const total = estimated.reduce((sum, s) => sum + (s.finalEstimate ?? 0), 0)
      const next = { ...localConfig, targetScope: total }
      setLocalConfig(next)
      onUpdateConfig(next)
      setPokerMsg(t('data.poker_imported', { count: estimated.length, total }))
    } catch {
      setPokerMsg(t('data.poker_no_data'))
    }
    setTimeout(() => setPokerMsg(null), 5000)
  }

  const handleAdd = () => {
    if (!name.trim()) return
    onAddSprint({
      id: crypto.randomUUID(),
      name: name.trim(),
      planned,
      completed,
      carriedOver: carried,
      goal: goal.trim() || undefined,
      mood: mood > 0 ? mood : undefined,
      teamSize: teamSize > 0 ? teamSize : undefined,
      absenceDays: teamSize > 0 && absenceDays > 0 ? absenceDays : undefined,
    })
    setName(`Sprint ${sprints.length + 2}`)
    setCompleted(0)
    setCarried(0)
    setGoal('')
    setMood(0)
    setTeamSize(0)
    setAbsenceDays(0)
    setShowAdd(false)
  }

  const handleCSVInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onImportCSV(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('data.title')}</h1>

      {/* Project config */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 dark:text-gray-50">{t('data.config_title')}</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">{t('data.project_name')}</label>
            <input className="input" value={localConfig.name} onChange={e => setLocalConfig(c => ({ ...c, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">{t('data.target_scope')}</label>
            <input type="number" min={1} className="input" value={localConfig.targetScope} onChange={e => setLocalConfig(c => ({ ...c, targetScope: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">{t('data.sprint_length')}</label>
            <input type="number" min={1} max={4} className="input" value={localConfig.sprintLengthWeeks} onChange={e => setLocalConfig(c => ({ ...c, sprintLengthWeeks: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button onClick={() => onUpdateConfig(localConfig)} className="btn-primary text-sm">{t('data.save_config')}</button>
          <button type="button" onClick={handleImportFromPoker} className="btn-secondary text-sm">
            🃏 {t('data.import_from_poker')}
          </button>
          {pokerMsg && <span className="text-xs text-brand-600">{pokerMsg}</span>}
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setName(`Sprint ${sprints.length + 1}`); setShowAdd(v => !v) }} className="btn-primary">
          + {t('data.add')}
        </button>
        <label className="btn-secondary cursor-pointer">
          {t('data.import_csv')}
          <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVInput} />
        </label>
        <button onClick={onExportCSV} className="btn-secondary">{t('data.export_csv')}</button>
        {sprints.length > 0 && (
          <button onClick={() => confirm(t('data.clear_confirm')) && onClear()} className="btn-ghost text-red-400">
            {t('data.clear_all')}
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">{t('data.sprint_name')}</label>
              <input autoFocus className="input" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <div>
              <label className="label">{t('data.planned')}</label>
              <input type="number" min={0} className="input" value={planned} onChange={e => setPlanned(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">{t('data.completed')}</label>
              <input type="number" min={0} className="input" value={completed} onChange={e => setCompleted(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">{t('data.carried')}</label>
              <input type="number" min={0} className="input" value={carried} onChange={e => setCarried(Number(e.target.value))} />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className="label">{t('data.goal')}</label>
              <input className="input" value={goal} onChange={e => setGoal(e.target.value)} placeholder="" />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className="label">{t('data.mood')}</label>
              <div className="flex gap-1 mt-1">
                {(['😫', '😟', '😐', '🙂', '😄'] as const).map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMood(mood === i + 1 ? 0 : i + 1)}
                    className={`text-xl px-2 py-1 rounded transition-colors ${mood === i + 1 ? 'bg-brand-100 ring-2 ring-brand-400 dark:bg-brand-700/20 dark:ring-brand-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title={`${i + 1}/5`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{t('data.teamSize')}</label>
              <input type="number" min={0} className="input" value={teamSize || ''} placeholder="—" onChange={e => setTeamSize(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">{t('data.absenceDays')}</label>
              <input type="number" min={0} className="input" value={absenceDays || ''} placeholder="—" disabled={teamSize === 0} onChange={e => setAbsenceDays(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} disabled={!name.trim()} className="btn-primary text-sm">{t('data.add')}</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {sprints.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.sprint_name')}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.planned')}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.completed')}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.carried')}</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.moodLabel')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sprints.map(sp => (
                <tr key={sp.id} className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-2.5">
                    <span className="font-medium">{sp.name}</span>
                    {sp.goal && <span className="block text-xs text-gray-400 italic dark:text-gray-500">{sp.goal}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">{sp.planned}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${sp.completed >= sp.planned ? 'text-green-600' : 'text-orange-500'}`}>{sp.completed}</td>
                  <td className={`px-4 py-2.5 text-right ${sp.carriedOver > 0 ? 'text-red-500' : 'text-gray-400'}`}>{sp.carriedOver}</td>
                  <td className="px-4 py-2.5 text-center text-lg">
                    {sp.mood ? (['😫', '😟', '😐', '🙂', '😄'] as const)[sp.mood - 1] : <span className="text-gray-200 text-sm dark:text-gray-700">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => onDeleteSprint(sp.id)} className="text-gray-200 hover:text-red-400 text-xs dark:text-gray-700 dark:hover:text-red-400" title={t('data.delete')}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600">{t('data.csv_hint')}</p>
    </div>
  )
}

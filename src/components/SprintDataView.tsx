import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { SprintData, ProjectConfig } from '../types'
import { computeHealthScore, buildMaxNormVel, getHealthColor, HEALTH_BADGE_CLASSES } from '../utils/healthScore'

function readWorkProfilesCount(): number {
  try {
    const raw = localStorage.getItem('work-profiles-data')
    if (!raw) return 0
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}

interface Props {
  sprints: SprintData[]
  config: ProjectConfig
  onAddSprint: (sprint: SprintData) => void
  onDeleteSprint: (id: string) => void
  onUpdateConfig: (config: ProjectConfig) => void
  onImportCSV: (text: string) => void
  onExportCSV: () => void
  onClear: () => void
}

export default function SprintDataView({
  sprints,
  config,
  onAddSprint,
  onDeleteSprint,
  onUpdateConfig,
  onImportCSV,
  onExportCSV,
  onClear,
}: Props) {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', planned: '', completed: '', carriedOver: '', goal: '', retrospective: '', milestone: '' })
  const [formMood, setFormMood] = useState(0)
  const [formTeamSize, setFormTeamSize] = useState(0)
  const [formAbsenceDays, setFormAbsenceDays] = useState(0)
  const [localConfig, setLocalConfig] = useState(config)
  const [pokerMsg, setPokerMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [wpProfileCount] = useState(() => readWorkProfilesCount())

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  function importFromPoker() {
    try {
      const raw = localStorage.getItem('sprintMetrics_planningPoker')
      if (!raw) { setPokerMsg(t('data.poker_no_data')); setTimeout(() => setPokerMsg(null), 5000); return }
      const stories: { title: string; finalEstimate: number | null }[] = JSON.parse(raw)
      const estimated = stories.filter(s => s.finalEstimate !== null)
      if (estimated.length === 0) { setPokerMsg(t('data.poker_no_data')); setTimeout(() => setPokerMsg(null), 5000); return }
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

  function addSprint() {
    if (!form.name.trim()) return
    onAddSprint({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      planned: Number(form.planned) || 0,
      completed: Number(form.completed) || 0,
      carriedOver: Number(form.carriedOver) || 0,
      goal: form.goal.trim() || undefined,
      retrospective: form.retrospective.trim() || undefined,
      milestone: form.milestone.trim() || undefined,
      mood: formMood > 0 ? formMood : undefined,
      teamSize: formTeamSize > 0 ? formTeamSize : undefined,
      absenceDays: formTeamSize > 0 && formAbsenceDays > 0 ? formAbsenceDays : undefined,
    })
    setForm({ name: '', planned: '', completed: '', carriedOver: '', goal: '', retrospective: '', milestone: '' })
    setFormMood(0)
    setFormTeamSize(0)
    setFormAbsenceDays(0)
    setAdding(false)
  }

  function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onImportCSV(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('dataview.title')}</h2>

      <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="label">{t('data.project_name')}</label>
          <input
            type="text"
            className="input"
            value={localConfig.name}
            onChange={e => setLocalConfig(c => ({ ...c, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">{t('data.target_scope')}</label>
          <input
            type="number"
            min={1}
            className="input"
            value={localConfig.targetScope}
            onChange={e => setLocalConfig(c => ({ ...c, targetScope: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="label">{t('data.sprint_length')}</label>
          <input
            type="number"
            min={1}
            max={4}
            className="input"
            value={localConfig.sprintLengthWeeks}
            onChange={e =>
              setLocalConfig(c => ({ ...c, sprintLengthWeeks: Number(e.target.value) }))
            }
          />
        </div>
        <div className="sm:col-span-3 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onUpdateConfig(localConfig)}
            className="btn-primary text-sm"
          >
            {t('data.save_config')}
          </button>
          <button type="button" onClick={importFromPoker} className="btn-secondary text-sm">
            🃏 {t('data.import_from_poker')}
          </button>
          {pokerMsg && <span className="text-xs text-brand-600">{pokerMsg}</span>}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={() => { setAdding(true); if (wpProfileCount > 0 && formTeamSize === 0) setFormTeamSize(wpProfileCount) }} className="btn-primary">
          + {t('data.add')}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
          {t('data.import_csv')}
        </button>
        <button type="button" onClick={onExportCSV} className="btn-secondary">
          {t('data.export_csv')}
        </button>
        {sprints.length > 0 && (
          <button
            type="button"
            onClick={() => confirm(t('data.clear_confirm')) && onClear()}
            className="btn-ghost text-red-400"
          >
            {t('data.clear_all')}
          </button>
        )}
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={importCSV} />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-600">{t('data.csv_hint')}</p>

      {adding && (
        <div className="card bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">{t('data.sprint_name')}</label>
              <input
                autoFocus
                className="input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            {(['planned', 'completed', 'carriedOver'] as const).map(field => (
              <div key={field}>
                <label className="label">
                  {field === 'planned'
                    ? t('data.planned')
                    : field === 'completed'
                      ? t('data.completed')
                      : t('data.carried')}
                </label>
                <input
                  type="number"
                  className="input"
                  value={form[field]}
                  min={0}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-4">
              <label className="label">{t('data.goal')}</label>
              <input
                className="input"
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
              />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className="label">{t('data.retrospective')}</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={form.retrospective}
                onChange={e => setForm(f => ({ ...f, retrospective: e.target.value }))}
              />
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label className="label">{t('data.milestone')}</label>
              <input
                className="input"
                maxLength={30}
                value={form.milestone}
                onChange={e => setForm(f => ({ ...f, milestone: e.target.value }))}
              />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className="label">{t('data.mood')}</label>
              <div className="flex gap-1 mt-1">
                {(['😫', '😟', '😐', '🙂', '😄'] as const).map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormMood(formMood === i + 1 ? 0 : i + 1)}
                    className={`text-xl px-2 py-1 rounded transition-colors ${formMood === i + 1 ? 'bg-brand-100 ring-2 ring-brand-400 dark:bg-brand-700/20 dark:ring-brand-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title={`${i + 1}/5`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{t('data.teamSize')}</label>
              <input type="number" min={0} className="input" value={formTeamSize || ''} placeholder="—" onChange={e => setFormTeamSize(Number(e.target.value))} />
              {wpProfileCount > 0 && (
                <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">{t('integration.teamSizeFromProfiles', { count: wpProfileCount })}</p>
              )}
            </div>
            <div>
              <label className="label">{t('data.absenceDays')}</label>
              <input type="number" min={0} className="input" value={formAbsenceDays || ''} placeholder="—" disabled={formTeamSize === 0} onChange={e => setFormAbsenceDays(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addSprint} className="btn-primary text-sm">
              {t('dataview.add_row')}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary text-sm">
              {t('dataview.cancel')}
            </button>
          </div>
        </div>
      )}

      {sprints.length === 0 ? (
        <p className="text-gray-400 text-sm italic dark:text-gray-600">{t('dataview.empty')}</p>
      ) : (
        <div className="overflow-x-auto card p-0">
          {(() => {
            const maxNV = buildMaxNormVel(sprints, config)
            return (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <th className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">{t('data.sprint_name')}</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">{t('data.planned')}</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">{t('data.completed')}</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">{t('data.carried')}</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 text-center dark:text-gray-400">{t('data.moodLabel')}</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 text-center dark:text-gray-400">{t('data.healthScore')}</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {sprints.map((sprint, idx) => {
                    const score = computeHealthScore(sprint, maxNV, config)
                    const color = getHealthColor(score)
                    return (
                      <tr key={sprint.id} className={idx % 2 === 0 ? '' : 'bg-gray-50/80 dark:bg-gray-800/50'}>
                        <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="font-medium">{sprint.name}</span>
                          {sprint.milestone && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              🏁 {sprint.milestone}
                            </span>
                          )}
                          {sprint.goal && <span className="block text-xs text-gray-400 italic dark:text-gray-500">{sprint.goal}</span>}
                          {sprint.retrospective && <span className="block text-xs text-gray-400 italic dark:text-gray-500">↩ {sprint.retrospective}</span>}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{sprint.planned}</td>
                        <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                          <span
                            className={`font-semibold ${
                              sprint.completed >= sprint.planned ? 'text-green-600' : 'text-amber-600'
                            }`}
                          >
                            {sprint.completed}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          {sprint.carriedOver}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-100 text-center text-lg dark:border-gray-800">
                          {sprint.mood ? (['😫', '😟', '😐', '🙂', '😄'] as const)[sprint.mood - 1] : <span className="text-gray-200 text-sm dark:text-gray-700">—</span>}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-100 text-center dark:border-gray-800">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${HEALTH_BADGE_CLASSES[color]}`}
                            title={color === 'red' ? t('data.healthScoreLow') : color === 'amber' ? t('data.healthScoreMid') : t('data.healthScoreHigh')}
                          >
                            {score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b border-gray-100 text-right dark:border-gray-800">
                          <button
                            type="button"
                            onClick={() => onDeleteSprint(sprint.id)}
                            className="text-gray-300 hover:text-red-400 dark:text-gray-700 dark:hover:text-red-400"
                            title={t('data.delete')}
                            aria-label={t('data.delete')}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          })()}
        </div>
      )}
    </div>
  )
}

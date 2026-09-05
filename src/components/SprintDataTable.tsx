import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SprintData, ProjectConfig } from '../types'
import { computeHealthScore, buildMaxNormVel, getHealthColor, HEALTH_BADGE_CLASSES } from '../utils/healthScore'
import { readLatestRetroNotes } from '../utils/scrumFacilitatorImport'
import { CloseIcon, CardsIcon, FlagIcon, UndoIcon, EditIcon } from './icons'

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

interface KanbanCfdCounts {
  boardName: string
  todo: number
  inProgress: number
  done: number
}

function readKanbanCfdCounts(): KanbanCfdCounts | null {
  try {
    const raw = localStorage.getItem('kanban-designer:currentBoard')
    if (!raw) return null
    const board = JSON.parse(raw)
    const columns = board?.columns
    if (!Array.isArray(columns) || columns.length === 0) return null
    const cardCount = (col: unknown) => {
      const cards = (col as { cards?: unknown[] })?.cards
      return Array.isArray(cards) ? cards.length : 0
    }
    const todo = cardCount(columns[0])
    const done = columns.length > 1 ? cardCount(columns[columns.length - 1]) : 0
    const inProgress = columns.length > 2
      ? columns.slice(1, -1).reduce((sum: number, col: unknown) => sum + cardCount(col), 0)
      : 0
    return { boardName: typeof board.boardName === 'string' ? board.boardName : '', todo, inProgress, done }
  } catch {
    return null
  }
}

interface EditFormState {
  name: string
  planned: number
  completed: number
  carriedOver: number
  goal: string
  retrospective: string
  milestone: string
  mood: number
  teamSize: number
  absenceDays: number
  todo: number | ''
  inProgress: number | ''
  done: number | ''
}

function toEditForm(sp: SprintData): EditFormState {
  return {
    name: sp.name,
    planned: sp.planned,
    completed: sp.completed,
    carriedOver: sp.carriedOver,
    goal: sp.goal ?? '',
    retrospective: sp.retrospective ?? '',
    milestone: sp.milestone ?? '',
    mood: sp.mood ?? 0,
    teamSize: sp.teamSize ?? 0,
    absenceDays: sp.absenceDays ?? 0,
    todo: sp.todo ?? '',
    inProgress: sp.inProgress ?? '',
    done: sp.done ?? '',
  }
}

interface Props {
  sprints: SprintData[]
  config: ProjectConfig
  onAddSprint: (sprint: SprintData) => void
  onDeleteSprint: (id: string) => void
  onUpdateSprint: (sprint: SprintData) => void
  onUpdateConfig: (config: ProjectConfig) => void
  onClear: () => void
  onImportCSV: (text: string) => void
  onExportCSV: () => void
}

export default function SprintDataTable({
  sprints, config, onAddSprint, onDeleteSprint, onUpdateSprint, onUpdateConfig, onClear, onImportCSV, onExportCSV,
}: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [planned, setPlanned] = useState(40)
  const [completed, setCompleted] = useState(0)
  const [carried, setCarried] = useState(0)
  const [goal, setGoal] = useState('')
  const [retrospective, setRetrospective] = useState('')
  const [milestone, setMilestone] = useState('')
  const [mood, setMood] = useState(0)
  const [teamSize, setTeamSize] = useState(0)
  const [absenceDays, setAbsenceDays] = useState(0)
  const [todo, setTodo] = useState<number | ''>('')
  const [inProgress, setInProgress] = useState<number | ''>('')
  const [done, setDone] = useState<number | ''>('')
  const [showAdd, setShowAdd] = useState(false)
  const [localConfig, setLocalConfig] = useState(config)
  const [pokerMsg, setPokerMsg] = useState<string | null>(null)
  const [wpProfileCount] = useState(() => readWorkProfilesCount())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState<EditFormState | null>(null)
  const [kanbanCfd] = useState(() => readKanbanCfdCounts())
  const [showKanbanHint, setShowKanbanHint] = useState(false)
  const [retroImport] = useState(() => readLatestRetroNotes())

  const applyRetroImport = () => {
    if (retroImport) setRetrospective(retroImport.text)
  }

  const startEdit = (sp: SprintData) => {
    setShowAdd(false)
    setEditingId(sp.id)
    setEdit(toEditForm(sp))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEdit(null)
  }

  const saveEdit = () => {
    if (!edit || !editingId || !edit.name.trim()) return
    onUpdateSprint({
      id: editingId,
      name: edit.name.trim(),
      planned: edit.planned,
      completed: edit.completed,
      carriedOver: edit.carriedOver,
      goal: edit.goal.trim() || undefined,
      retrospective: edit.retrospective.trim() || undefined,
      milestone: edit.milestone.trim() || undefined,
      mood: edit.mood > 0 ? edit.mood : undefined,
      teamSize: edit.teamSize > 0 ? edit.teamSize : undefined,
      absenceDays: edit.teamSize > 0 && edit.absenceDays > 0 ? edit.absenceDays : undefined,
      todo: edit.todo !== '' ? Number(edit.todo) : undefined,
      inProgress: edit.inProgress !== '' ? Number(edit.inProgress) : undefined,
      done: edit.done !== '' ? Number(edit.done) : undefined,
    })
    cancelEdit()
  }

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
      retrospective: retrospective.trim() || undefined,
      milestone: milestone.trim() || undefined,
      mood: mood > 0 ? mood : undefined,
      teamSize: teamSize > 0 ? teamSize : undefined,
      absenceDays: teamSize > 0 && absenceDays > 0 ? absenceDays : undefined,
      todo: todo !== '' ? Number(todo) : undefined,
      inProgress: inProgress !== '' ? Number(inProgress) : undefined,
      done: done !== '' ? Number(done) : undefined,
    })
    setName(`Sprint ${sprints.length + 2}`)
    setCompleted(0)
    setCarried(0)
    setGoal('')
    setRetrospective('')
    setMilestone('')
    setMood(0)
    setTeamSize(0)
    setAbsenceDays(0)
    setTodo('')
    setInProgress('')
    setDone('')
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
          <button type="button" onClick={handleImportFromPoker} className="btn-secondary text-sm inline-flex items-center gap-1">
            <CardsIcon className="w-3.5 h-3.5" />
            {t('data.import_from_poker')}
          </button>
          {pokerMsg && <span className="text-xs text-brand-600">{pokerMsg}</span>}
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => {
          cancelEdit()
          setName(`Sprint ${sprints.length + 1}`)
          if (!showAdd && wpProfileCount > 0) setTeamSize(s => s === 0 ? wpProfileCount : s)
          if (!showAdd && kanbanCfd) {
            setTodo(v => v === '' ? kanbanCfd.todo : v)
            setInProgress(v => v === '' ? kanbanCfd.inProgress : v)
            setDone(v => v === '' ? kanbanCfd.done : v)
            setShowKanbanHint(true)
          }
          setShowAdd(v => !v)
        }} className="btn-primary">
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
              <label className="label">{t('data.retrospective')}</label>
              <textarea className="input resize-none" rows={2} value={retrospective} onChange={e => setRetrospective(e.target.value)} placeholder="" />
              {retroImport && (
                <button
                  type="button"
                  onClick={applyRetroImport}
                  className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 mt-1"
                >
                  {t('integration.importRetroNotes', { date: retroImport.date })}
                </button>
              )}
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label className="label">{t('data.milestone')}</label>
              <input className="input" maxLength={30} value={milestone} onChange={e => setMilestone(e.target.value)} placeholder="" />
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
              {wpProfileCount > 0 && (
                <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">{t('integration.teamSizeFromProfiles', { count: wpProfileCount })}</p>
              )}
            </div>
            <div>
              <label className="label">{t('data.absenceDays')}</label>
              <input type="number" min={0} className="input" value={absenceDays || ''} placeholder="—" disabled={teamSize === 0} onChange={e => setAbsenceDays(Number(e.target.value))} />
            </div>
            <div className="col-span-2 sm:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">{t('nav.cfd')} — {t('dashboard.cfd_optional')}</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">{t('data.todo')}</label>
                  <input type="number" min={0} className="input" value={todo} placeholder="—" onChange={e => setTodo(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">{t('data.inProgress')}</label>
                  <input type="number" min={0} className="input" value={inProgress} placeholder="—" onChange={e => setInProgress(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">{t('data.done')}</label>
                  <input type="number" min={0} className="input" value={done} placeholder="—" onChange={e => setDone(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              {showKanbanHint && kanbanCfd && (
                <p className="text-xs text-brand-600 mt-1.5 flex items-center gap-1.5">
                  {t('integration.kanbanCfdHint', { boardName: kanbanCfd.boardName })}
                  <button type="button" onClick={() => setShowKanbanHint(false)} className="text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400" aria-label={t('data.cancel')}><CloseIcon className="w-3 h-3" /></button>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} disabled={!name.trim()} className="btn-primary text-sm">{t('data.add')}</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">{t('data.cancel')}</button>
          </div>
        </div>
      )}

      {/* Table */}
      {sprints.length > 0 && (
        <div className="card overflow-x-auto p-0">
          {(() => {
            const maxNV = buildMaxNormVel(sprints, config)
            return (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.sprint_name')}</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.planned')}</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.completed')}</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.carried')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.moodLabel')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">{t('data.healthScore')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sprints.map(sp => {
                    const score = computeHealthScore(sp, maxNV, config)
                    const color = getHealthColor(score)
                    if (sp.id === editingId && edit) {
                      return (
                        <tr key={sp.id} className="border-b border-gray-50 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                          <td colSpan={7} className="px-4 py-3">
                            <div onKeyDown={e => e.key === 'Escape' && cancelEdit()} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="label">{t('data.sprint_name')}</label>
                                <input autoFocus className="input" value={edit.name} onChange={e => setEdit(v => v && ({ ...v, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                              </div>
                              <div>
                                <label className="label">{t('data.planned')}</label>
                                <input type="number" min={0} className="input" value={edit.planned} onChange={e => setEdit(v => v && ({ ...v, planned: Number(e.target.value) }))} />
                              </div>
                              <div>
                                <label className="label">{t('data.completed')}</label>
                                <input type="number" min={0} className="input" value={edit.completed} onChange={e => setEdit(v => v && ({ ...v, completed: Number(e.target.value) }))} />
                              </div>
                              <div>
                                <label className="label">{t('data.carried')}</label>
                                <input type="number" min={0} className="input" value={edit.carriedOver} onChange={e => setEdit(v => v && ({ ...v, carriedOver: Number(e.target.value) }))} />
                              </div>
                              <div className="col-span-2 sm:col-span-4">
                                <label className="label">{t('data.goal')}</label>
                                <input className="input" value={edit.goal} onChange={e => setEdit(v => v && ({ ...v, goal: e.target.value }))} />
                              </div>
                              <div className="col-span-2 sm:col-span-4">
                                <label className="label">{t('data.retrospective')}</label>
                                <textarea className="input resize-none" rows={2} value={edit.retrospective} onChange={e => setEdit(v => v && ({ ...v, retrospective: e.target.value }))} />
                              </div>
                              <div className="col-span-2 sm:col-span-2">
                                <label className="label">{t('data.milestone')}</label>
                                <input className="input" maxLength={30} value={edit.milestone} onChange={e => setEdit(v => v && ({ ...v, milestone: e.target.value }))} />
                              </div>
                              <div className="col-span-2 sm:col-span-4">
                                <label className="label">{t('data.mood')}</label>
                                <div className="flex gap-1 mt-1">
                                  {(['😫', '😟', '😐', '🙂', '😄'] as const).map((emoji, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setEdit(v => v && ({ ...v, mood: v.mood === i + 1 ? 0 : i + 1 }))}
                                      className={`text-xl px-2 py-1 rounded transition-colors ${edit.mood === i + 1 ? 'bg-brand-100 ring-2 ring-brand-400 dark:bg-brand-700/20 dark:ring-brand-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                      title={`${i + 1}/5`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="label">{t('data.teamSize')}</label>
                                <input type="number" min={0} className="input" value={edit.teamSize || ''} placeholder="—" onChange={e => setEdit(v => v && ({ ...v, teamSize: Number(e.target.value) }))} />
                              </div>
                              <div>
                                <label className="label">{t('data.absenceDays')}</label>
                                <input type="number" min={0} className="input" value={edit.absenceDays || ''} placeholder="—" disabled={edit.teamSize === 0} onChange={e => setEdit(v => v && ({ ...v, absenceDays: Number(e.target.value) }))} />
                              </div>
                              <div className="col-span-2 sm:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">{t('nav.cfd')} — {t('dashboard.cfd_optional')}</p>
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <label className="label">{t('data.todo')}</label>
                                    <input type="number" min={0} className="input" value={edit.todo} placeholder="—" onChange={e => setEdit(v => v && ({ ...v, todo: e.target.value === '' ? '' : Number(e.target.value) }))} />
                                  </div>
                                  <div>
                                    <label className="label">{t('data.inProgress')}</label>
                                    <input type="number" min={0} className="input" value={edit.inProgress} placeholder="—" onChange={e => setEdit(v => v && ({ ...v, inProgress: e.target.value === '' ? '' : Number(e.target.value) }))} />
                                  </div>
                                  <div>
                                    <label className="label">{t('data.done')}</label>
                                    <input type="number" min={0} className="input" value={edit.done} placeholder="—" onChange={e => setEdit(v => v && ({ ...v, done: e.target.value === '' ? '' : Number(e.target.value) }))} />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button onClick={saveEdit} disabled={!edit.name.trim()} className="btn-primary text-sm">{t('data.save')}</button>
                              <button onClick={cancelEdit} className="btn-ghost">{t('data.cancel')}</button>
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    return (
                      <tr key={sp.id} className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-2.5">
                          <span className="font-medium">{sp.name}</span>
                          {sp.milestone && (
                            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <FlagIcon className="w-3 h-3" />
                              {sp.milestone}
                            </span>
                          )}
                          {sp.goal && <span className="block text-xs text-gray-400 italic dark:text-gray-500">{sp.goal}</span>}
                          {sp.retrospective && (
                            <span className="flex items-center gap-1 text-xs text-gray-400 italic dark:text-gray-500">
                              <UndoIcon className="w-3 h-3" />
                              {sp.retrospective}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">{sp.planned}</td>
                        <td className={`px-4 py-2.5 text-right font-semibold ${sp.completed >= sp.planned ? 'text-green-600' : 'text-orange-500'}`}>{sp.completed}</td>
                        <td className={`px-4 py-2.5 text-right ${sp.carriedOver > 0 ? 'text-red-500' : 'text-gray-400'}`}>{sp.carriedOver}</td>
                        <td className="px-4 py-2.5 text-center text-lg">
                          {sp.mood ? (['😫', '😟', '😐', '🙂', '😄'] as const)[sp.mood - 1] : <span className="text-gray-200 text-sm dark:text-gray-700">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${HEALTH_BADGE_CLASSES[color]}`}
                            title={color === 'red' ? t('data.healthScoreLow') : color === 'amber' ? t('data.healthScoreMid') : t('data.healthScoreHigh')}
                          >
                            {score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <button onClick={() => startEdit(sp)} className="text-gray-400 hover:text-brand-500 mr-2 dark:text-gray-500 dark:hover:text-brand-400" title={t('data.edit')} aria-label={t('data.edit')}><EditIcon className="w-3.5 h-3.5" /></button>
                          <button onClick={() => onDeleteSprint(sp.id)} className="text-gray-400 hover:text-red-400 text-xs dark:text-gray-500 dark:hover:text-red-400" title={t('data.delete')} aria-label={t('data.delete')}><CloseIcon className="w-3 h-3" /></button>
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

      <p className="text-xs text-gray-400 dark:text-gray-600">{t('data.csv_hint')}</p>
    </div>
  )
}

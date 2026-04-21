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
  const [showAdd, setShowAdd] = useState(false)
  const [localConfig, setLocalConfig] = useState(config)

  const handleAdd = () => {
    if (!name.trim()) return
    onAddSprint({
      id: crypto.randomUUID(),
      name: name.trim(),
      planned,
      completed,
      carriedOver: carried,
    })
    setName(`Sprint ${sprints.length + 2}`)
    setCompleted(0)
    setCarried(0)
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
      <h1 className="text-2xl font-bold text-gray-900">{t('data.title')}</h1>

      {/* Project config */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">{t('data.config_title')}</h2>
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
        <button onClick={() => onUpdateConfig(localConfig)} className="btn-primary text-sm mt-3">{t('data.save_config')}</button>
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
        <div className="card bg-gray-50">
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
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('data.sprint_name')}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t('data.planned')}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t('data.completed')}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t('data.carried')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sprints.map(sp => (
                <tr key={sp.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium">{sp.name}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{sp.planned}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${sp.completed >= sp.planned ? 'text-green-600' : 'text-orange-500'}`}>{sp.completed}</td>
                  <td className={`px-4 py-2.5 text-right ${sp.carriedOver > 0 ? 'text-red-500' : 'text-gray-400'}`}>{sp.carriedOver}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => onDeleteSprint(sp.id)} className="text-gray-200 hover:text-red-400 text-xs" title={t('data.delete')}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">{t('data.csv_hint')}</p>
    </div>
  )
}

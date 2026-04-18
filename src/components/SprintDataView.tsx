import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { SprintData, ProjectConfig } from '../types'

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
  const [form, setForm] = useState({ name: '', planned: '', completed: '', carriedOver: '' })
  const [localConfig, setLocalConfig] = useState(config)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  function addSprint() {
    if (!form.name.trim()) return
    onAddSprint({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      planned: Number(form.planned) || 0,
      completed: Number(form.completed) || 0,
      carriedOver: Number(form.carriedOver) || 0,
    })
    setForm({ name: '', planned: '', completed: '', carriedOver: '' })
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
      <h2 className="text-2xl font-bold text-gray-900">{t('dataview.title')}</h2>

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
        <div className="sm:col-span-3">
          <button
            type="button"
            onClick={() => onUpdateConfig(localConfig)}
            className="btn-primary text-sm"
          >
            {t('data.save_config')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={() => setAdding(true)} className="btn-primary">
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
      <p className="text-xs text-gray-400">{t('data.csv_hint')}</p>

      {adding && (
        <div className="card bg-gray-50">
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
        <p className="text-gray-400 text-sm italic">{t('dataview.empty')}</p>
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-200">
                <th className="px-3 py-2 font-semibold text-gray-600">{t('data.sprint_name')}</th>
                <th className="px-3 py-2 font-semibold text-gray-600">{t('data.planned')}</th>
                <th className="px-3 py-2 font-semibold text-gray-600">{t('data.completed')}</th>
                <th className="px-3 py-2 font-semibold text-gray-600">{t('data.carried')}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sprints.map((sprint, idx) => (
                <tr key={sprint.id} className={idx % 2 === 0 ? '' : 'bg-gray-50/80'}>
                  <td className="px-3 py-2 border-b border-gray-100 font-medium">{sprint.name}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{sprint.planned}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    <span
                      className={`font-semibold ${
                        sprint.completed >= sprint.planned ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {sprint.completed}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-500">
                    {sprint.carriedOver}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteSprint(sprint.id)}
                      className="text-gray-300 hover:text-red-400"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

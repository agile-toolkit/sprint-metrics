import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, SprintData, ProjectConfig } from './types'
import { SAMPLE_SPRINTS, SAMPLE_CONFIG } from './data/sample'
import VelocityChart from './components/VelocityChart'
import BurnUpChart from './components/BurnUpChart'
import BurnDownChart from './components/BurnDownChart'
import ForecastView from './components/ForecastView'
import SprintDataTable from './components/SprintDataTable'
import SprintDataView from './components/SprintDataView'
import LearnView from './components/LearnView'

const SPRINTS_KEY = 'sprint-metrics-sprints'
const CONFIG_KEY = 'sprint-metrics-config'

function loadSprints(): SprintData[] {
  try { return JSON.parse(localStorage.getItem(SPRINTS_KEY) ?? '[]') } catch { return [] }
}
function loadConfig(): ProjectConfig {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null') ?? { name: 'My Project', targetScope: 200, sprintLengthWeeks: 2 } } catch { return { name: 'My Project', targetScope: 200, sprintLengthWeeks: 2 } }
}
function saveSprints(s: SprintData[]) { localStorage.setItem(SPRINTS_KEY, JSON.stringify(s)) }
function saveConfig(c: ProjectConfig) { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)) }

function parseCSV(text: string): SprintData[] {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const parts = line.split(',').map(p => p.trim())
      return {
        id: crypto.randomUUID(),
        name: parts[0] ?? 'Sprint',
        planned: Number(parts[1]) || 0,
        completed: Number(parts[2]) || 0,
        carriedOver: Number(parts[3]) || 0,
      }
    })
    .filter(s => s.name)
}

function exportCSV(sprints: SprintData[]): void {
  const header = '# Sprint Name,Planned SP,Completed SP,Carried Over\n'
  const rows = sprints.map(s => `${s.name},${s.planned},${s.completed},${s.carriedOver}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sprint-metrics.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [dataMode, setDataMode] = useState<'quick' | 'detailed'>('quick')
  const [sprints, setSprints] = useState<SprintData[]>(loadSprints)
  const [config, setConfig] = useState<ProjectConfig>(loadConfig)

  const updateSprints = (next: SprintData[]) => { setSprints(next); saveSprints(next) }
  const updateConfig = (next: ProjectConfig) => { setConfig(next); saveConfig(next) }

  const avgVelocity = sprints.length > 0
    ? Math.round(sprints.reduce((s, sp) => s + sp.completed, 0) / sprints.length)
    : 0
  const totalCompleted = sprints.reduce((s, sp) => s + sp.completed, 0)
  const sprintsToTarget = avgVelocity > 0
    ? Math.max(0, Math.ceil((config.targetScope - totalCompleted) / avgVelocity))
    : null

  const navItems: { key: Screen; label: string }[] = [
    { key: 'dashboard', label: t('nav.dashboard') },
    { key: 'data', label: t('nav.data') },
    { key: 'learn', label: t('nav.learn') },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setScreen('dashboard')} className="font-semibold text-brand-600 hover:text-brand-700">
            {t('app.title')}
          </button>
          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <button key={item.key} onClick={() => setScreen(item.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${screen === item.key ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                {item.label}
              </button>
            ))}
            <select
              value={i18n.language.slice(0, 2)}
              onChange={e => i18n.changeLanguage(e.target.value)}
              className="ml-2 text-sm text-gray-500 bg-transparent border border-gray-200 rounded px-1 py-0.5 cursor-pointer hover:border-gray-400 focus:outline-none"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="be">BE</option>
              <option value="ru">RU</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {screen === 'learn' && <LearnView />}
        {screen === 'data' && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-gray-200 pb-2">
              <button
                type="button"
                onClick={() => setDataMode('quick')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dataMode === 'quick' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t('dataview.mode_quick')}
              </button>
              <button
                type="button"
                onClick={() => setDataMode('detailed')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dataMode === 'detailed' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t('dataview.mode_detailed')}
              </button>
            </div>
            {dataMode === 'quick' ? (
              <SprintDataTable
                sprints={sprints}
                config={config}
                onAddSprint={s => updateSprints([...sprints, s])}
                onDeleteSprint={id => updateSprints(sprints.filter(s => s.id !== id))}
                onUpdateConfig={updateConfig}
                onClear={() => updateSprints([])}
                onImportCSV={text => updateSprints(parseCSV(text))}
                onExportCSV={() => exportCSV(sprints)}
              />
            ) : (
              <SprintDataView
                sprints={sprints}
                config={config}
                onAddSprint={s => updateSprints([...sprints, s])}
                onDeleteSprint={id => updateSprints(sprints.filter(s => s.id !== id))}
                onUpdateConfig={updateConfig}
                onClear={() => updateSprints([])}
                onImportCSV={text => updateSprints(parseCSV(text))}
                onExportCSV={() => exportCSV(sprints)}
              />
            )}
          </div>
        )}
        {screen === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {config.name || t('dashboard.title')}
              </h1>
              {sprints.length === 0 && (
                <button
                  onClick={() => { updateSprints(SAMPLE_SPRINTS); updateConfig(SAMPLE_CONFIG) }}
                  className="btn-secondary text-sm"
                >
                  {t('dashboard.load_sample')}
                </button>
              )}
            </div>

            {sprints.length === 0 ? (
              <div className="card text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">📈</div>
                <p>{t('dashboard.no_data')}</p>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: t('dashboard.stats_velocity'), value: `${avgVelocity} SP` },
                    { label: t('dashboard.stats_sprints'), value: String(sprints.length) },
                    { label: t('dashboard.stats_completed'), value: `${totalCompleted} SP` },
                    { label: t('dashboard.stats_forecast'), value: sprintsToTarget !== null ? (sprintsToTarget === 0 ? '✓' : `${sprintsToTarget}`) : '—' },
                  ].map(stat => (
                    <div key={stat.label} className="card text-center py-4">
                      <div className="text-2xl font-bold text-brand-600 tabular-nums">{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <VelocityChart sprints={sprints} />
                  <BurnUpChart sprints={sprints} config={config} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <BurnDownChart sprints={sprints} />
                  <ForecastView sprints={sprints} config={config} />
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

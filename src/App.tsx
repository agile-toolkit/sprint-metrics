import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'
import type { Screen, SprintData, ProjectConfig, MotivatorSnapshot } from './types'
import { SAMPLE_SPRINTS, SAMPLE_CONFIG } from './data/sample'
import AppHeader from './components/AppHeader'
import VelocityChart from './components/VelocityChart'
import BurnUpChart from './components/BurnUpChart'
import BurnDownChart from './components/BurnDownChart'
import ForecastView from './components/ForecastView'
import SprintDataTable from './components/SprintDataTable'
import SprintDataView from './components/SprintDataView'
import LearnView from './components/LearnView'

const SPRINTS_KEY = 'sprint-metrics-sprints'
const CONFIG_KEY = 'sprint-metrics-config'
const MOTIVATOR_KEY = 'sprint-metrics:motivatorSnapshot'
const MM_LAST_SESSION_KEY = 'moving-motivators:lastSession'

function loadSprints(): SprintData[] {
  try { return JSON.parse(localStorage.getItem(SPRINTS_KEY) ?? '[]') } catch { return [] }
}
function loadConfig(): ProjectConfig {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null') ?? { name: 'My Project', targetScope: 200, sprintLengthWeeks: 2 } } catch { return { name: 'My Project', targetScope: 200, sprintLengthWeeks: 2 } }
}
function saveSprints(s: SprintData[]) { localStorage.setItem(SPRINTS_KEY, JSON.stringify(s)) }
function saveConfig(c: ProjectConfig) { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)) }
function loadMotivatorSnapshot(): MotivatorSnapshot | null {
  try {
    const saved = localStorage.getItem(MOTIVATOR_KEY)
    if (saved) return JSON.parse(saved) as MotivatorSnapshot
    // Auto-detect from Moving Motivators lastSession key
    const mm = localStorage.getItem(MM_LAST_SESSION_KEY)
    if (mm) {
      const parsed = JSON.parse(mm)
      if (Array.isArray(parsed?.topMotivators) && parsed.topMotivators.length > 0) {
        return { date: parsed.date ?? new Date().toISOString().slice(0, 10), topMotivators: parsed.topMotivators, shifts: parsed.shifts }
      }
    }
  } catch { /* ignore */ }
  return null
}
function saveMotivatorSnapshot(s: MotivatorSnapshot | null) {
  if (s) localStorage.setItem(MOTIVATOR_KEY, JSON.stringify(s))
  else localStorage.removeItem(MOTIVATOR_KEY)
}

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

function exportCSV(sprints: SprintData[], projectName: string): void {
  const header = 'Sprint Name,Planned SP,Completed SP,Carried Over,Goal,Mood\n'
  const rows = sprints.map(s =>
    [s.name, s.planned, s.completed, s.carriedOver, s.goal ?? '', s.mood ?? ''].join(',')
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  const safeName = (projectName || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  a.download = `sprint-metrics-${safeName}-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [dataMode, setDataMode] = useState<'quick' | 'detailed'>('quick')
  const [sprints, setSprints] = useState<SprintData[]>(loadSprints)
  const [config, setConfig] = useState<ProjectConfig>(loadConfig)
  const [copying, setCopying] = useState(false)
  const [motivatorSnapshot, setMotivatorSnapshot] = useState<MotivatorSnapshot | null>(loadMotivatorSnapshot)
  const [improvementToast, setImprovementToast] = useState<number | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motivatorSnapshot) {
      const detected = loadMotivatorSnapshot()
      if (detected) { setMotivatorSnapshot(detected); saveMotivatorSnapshot(detected) }
    }
  }, [motivatorSnapshot])

  const updateSprints = (next: SprintData[]) => { setSprints(next); saveSprints(next) }
  const updateConfig = (next: ProjectConfig) => { setConfig(next); saveConfig(next) }

  const handleAddSprint = (sprint: SprintData) => {
    updateSprints([...sprints, sprint])
    try {
      const raw = localStorage.getItem('improvement-board-items')
      if (raw) {
        const items: { status: string }[] = JSON.parse(raw)
        const openCount = items.filter(it => it.status !== 'done').length
        if (openCount > 0) setImprovementToast(openCount)
      }
    } catch { /* ignore */ }
  }

  const copyDashboardImage = async () => {
    if (!dashboardRef.current || copying) return
    setCopying(true)
    try {
      const canvas = await html2canvas(dashboardRef.current, { backgroundColor: '#f9fafb', scale: 2 })
      canvas.toBlob(blob => {
        if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      })
    } finally {
      setCopying(false)
    }
  }

  const importMotivatorFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as MotivatorSnapshot
        if (!Array.isArray(parsed.topMotivators)) return
        setMotivatorSnapshot(parsed)
        saveMotivatorSnapshot(parsed)
      } catch { /* ignore invalid JSON */ }
    }
    reader.readAsText(file)
  }

  const clearMotivatorSnapshot = () => { setMotivatorSnapshot(null); saveMotivatorSnapshot(null) }

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
      <div className="print:hidden">
        <AppHeader
          title={t('app.title')}
          onTitleClick={() => setScreen('dashboard')}
          navItems={navItems.map(item => ({
            key: item.key,
            label: item.label,
            active: screen === item.key,
            onClick: () => setScreen(item.key as Screen),
          }))}
        />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {improvementToast !== null && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            <span>
              🔔 {t('integration.improvementBoardOpen', { count: improvementToast })}{' '}
              <a
                href="https://agile-toolkit.github.io/improvement-board/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-amber-900"
              >
                {t('integration.improvementBoardLink')}
              </a>
            </span>
            <button
              type="button"
              onClick={() => setImprovementToast(null)}
              className="text-amber-500 hover:text-amber-700 flex-shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
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
                onAddSprint={handleAddSprint}
                onDeleteSprint={id => updateSprints(sprints.filter(s => s.id !== id))}
                onUpdateConfig={updateConfig}
                onClear={() => updateSprints([])}
                onImportCSV={text => updateSprints(parseCSV(text))}
                onExportCSV={() => exportCSV(sprints, config.name)}
              />
            ) : (
              <SprintDataView
                sprints={sprints}
                config={config}
                onAddSprint={handleAddSprint}
                onDeleteSprint={id => updateSprints(sprints.filter(s => s.id !== id))}
                onUpdateConfig={updateConfig}
                onClear={() => updateSprints([])}
                onImportCSV={text => updateSprints(parseCSV(text))}
                onExportCSV={() => exportCSV(sprints, config.name)}
              />
            )}
          </div>
        )}
        {screen === 'dashboard' && (
          <div ref={dashboardRef}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {config.name || t('dashboard.title')}
                </h1>
                {sprints.length > 0 && sprints[sprints.length - 1].goal && (
                  <p className="text-sm text-gray-500 mt-0.5 italic">
                    {sprints[sprints.length - 1].goal}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 print:hidden">
                {motivatorSnapshot ? (
                  <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
                    ★ {motivatorSnapshot.topMotivators.slice(0, 2).join(', ')}
                    <button
                      onClick={clearMotivatorSnapshot}
                      className="ml-1 text-orange-400 hover:text-orange-600"
                      title={t('integration.motivatorsClear')}
                    >×</button>
                  </span>
                ) : (
                  <label className="btn-secondary text-sm cursor-pointer">
                    🎯 {t('integration.importMotivators')}
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) importMotivatorFile(f); e.target.value = '' }}
                    />
                  </label>
                )}
                {sprints.length > 0 && (
                  <>
                    <button
                      onClick={() => exportCSV(sprints, config.name)}
                      className="btn-secondary text-sm"
                    >
                      ⬇ {t('results.exportCsv')}
                    </button>
                    <button
                      onClick={copyDashboardImage}
                      disabled={copying}
                      className="btn-secondary text-sm"
                    >
                      {copying ? '…' : `📋 ${t('results.copyImage')}`}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="btn-secondary text-sm"
                    >
                      🖨️ {t('results.printReport')}
                    </button>
                  </>
                )}
                {sprints.length === 0 && (
                  <button
                    onClick={() => { updateSprints(SAMPLE_SPRINTS); updateConfig(SAMPLE_CONFIG) }}
                    className="btn-secondary text-sm"
                  >
                    {t('dashboard.load_sample')}
                  </button>
                )}
              </div>
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
                  <VelocityChart sprints={sprints} motivatorSnapshot={motivatorSnapshot} config={config} />
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

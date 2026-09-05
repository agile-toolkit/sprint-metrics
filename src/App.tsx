import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, SprintData, ProjectConfig, ProjectRecord, MotivatorSnapshot } from './types'
import { SAMPLE_SPRINTS, SAMPLE_CONFIG } from './data/sample'
import AppHeader from './components/AppHeader'
import ThemeToggle from './components/ThemeToggle'
import FacilitatorToggle from './components/FacilitatorToggle'
import { useFacilitatorMode } from './components/useFacilitatorMode'
import { CloseIcon, BellIcon, TrendDownIcon, StarFilledIcon, TargetIcon, DownloadIcon, ClipboardIcon, PrintIcon, RefreshIcon, TrendUpIcon, CheckIcon } from './components/icons'
import ProjectSwitcher from './components/ProjectSwitcher'
import PortfolioView from './components/PortfolioView'
import VelocityChart from './components/VelocityChart'
import BurnUpChart from './components/BurnUpChart'
import BurnDownChart from './components/BurnDownChart'
import ForecastView from './components/ForecastView'
import AgileEvmView from './components/AgileEvmView'
import SprintDataTable from './components/SprintDataTable'
import SprintDataView from './components/SprintDataView'
import LearnView from './components/LearnView'
import CFDChart from './components/CFDChart'
import {
  ACTIVE_PROJECT_KEY, DEFAULT_CONFIG,
  hasTwoConsecutiveDeclines, saveProjects, initAppState,
  loadMotivatorSnapshot, saveMotivatorSnapshot, writeLastSession,
  parseCSV, exportCSV, buildImprovementBoardUrl, loadTeamIdentitySnapshot,
} from './sprintData'

export default function App() {
  const { t } = useTranslation()
  const [facilitatorMode, toggleFacilitatorMode] = useFacilitatorMode('agile-toolkit:facilitatorMode')

  const [initData] = useState(initAppState)
  const [projects, setProjects] = useState<ProjectRecord[]>(initData.projects)
  const [activeProjectId, setActiveProjectId] = useState<string>(initData.activeId)
  const [migrationPending, setMigrationPending] = useState<boolean>(initData.migrationPending)
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const [screen, setScreen] = useState<Screen>('dashboard')
  const [dataMode, setDataMode] = useState<'quick' | 'detailed'>('quick')
  const [copying, setCopying] = useState(false)
  const [motivatorSnapshot, setMotivatorSnapshot] = useState<MotivatorSnapshot | null>(loadMotivatorSnapshot)
  const [teamIdentity] = useState(loadTeamIdentitySnapshot)
  const [improvementToast, setImprovementToast] = useState<number | null>(null)
  const [changePlannerDismissed, setChangePlannerDismissed] = useState(false)
  const [lastDeleted, setLastDeleted] = useState<{ sprint: SprintData; index: number } | null>(null)
  const deleteUndoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)

  const activeProject = projects.find(p => p.id === activeProjectId) ?? projects[0]
  const sprints = activeProject?.sprints ?? []
  const config = activeProject?.config ?? DEFAULT_CONFIG

  useEffect(() => {
    if (!motivatorSnapshot) {
      const detected = loadMotivatorSnapshot()
      if (detected) { setMotivatorSnapshot(detected); saveMotivatorSnapshot(detected) }
    }
  }, [motivatorSnapshot])

  useEffect(() => () => {
    if (deleteUndoTimer.current) clearTimeout(deleteUndoTimer.current)
  }, [])

  const persistProjects = (updated: ProjectRecord[]) => {
    setProjects(updated)
    saveProjects(updated)
  }

  const updateSprints = (next: SprintData[]) => {
    persistProjects(projects.map(p => p.id === activeProjectId ? { ...p, sprints: next } : p))
  }

  const updateConfig = (next: ProjectConfig) => {
    persistProjects(projects.map(p => p.id === activeProjectId ? { ...p, name: next.name, config: next } : p))
  }

  // Single persistProjects call, not updateSprints()+updateConfig() back to back: both would
  // read the same pre-update `projects` closure in one synchronous handler, so the second
  // call's map() would overwrite the first's effect instead of composing with it.
  const loadSampleData = () => {
    persistProjects(projects.map(p =>
      p.id === activeProjectId ? { ...p, name: SAMPLE_CONFIG.name, config: SAMPLE_CONFIG, sprints: SAMPLE_SPRINTS } : p
    ))
  }

  // Soft delete: the sprint is removed from storage immediately (no visual lag), but held
  // in `lastDeleted` for a 5s undo window. Deleting a second sprint while a toast is
  // showing commits the first delete right away — only one undo is tracked at a time.
  const handleDeleteSprint = (id: string) => {
    const index = sprints.findIndex(s => s.id === id)
    if (index === -1) return
    if (deleteUndoTimer.current) clearTimeout(deleteUndoTimer.current)
    setLastDeleted({ sprint: sprints[index], index })
    updateSprints(sprints.filter(s => s.id !== id))
    deleteUndoTimer.current = setTimeout(() => setLastDeleted(null), 5000)
  }

  const undoDeleteSprint = () => {
    if (!lastDeleted) return
    if (deleteUndoTimer.current) clearTimeout(deleteUndoTimer.current)
    const restored = [...sprints]
    restored.splice(Math.min(lastDeleted.index, restored.length), 0, lastDeleted.sprint)
    updateSprints(restored)
    setLastDeleted(null)
  }

  const dismissDeleteUndo = () => {
    if (deleteUndoTimer.current) clearTimeout(deleteUndoTimer.current)
    setLastDeleted(null)
  }

  const switchProject = (id: string) => {
    setActiveProjectId(id)
    localStorage.setItem(ACTIVE_PROJECT_KEY, id)
    setScreen('dashboard')
    setDataMode('quick')
    setChangePlannerDismissed(false)
    dismissDeleteUndo()
  }

  const createProject = (name: string) => {
    const n = name.trim() || 'New Project'
    const newProject: ProjectRecord = {
      id: crypto.randomUUID(),
      name: n,
      config: { name: n, targetScope: 200, sprintLengthWeeks: 2 },
      sprints: [],
      createdAt: new Date().toISOString(),
    }
    const updated = [...projects, newProject]
    persistProjects(updated)
    localStorage.setItem(ACTIVE_PROJECT_KEY, newProject.id)
    setActiveProjectId(newProject.id)
    setScreen('dashboard')
    setDataMode('quick')
  }

  const deleteProject = (id: string) => {
    if (projects.length <= 1) return
    const updated = projects.filter(p => p.id !== id)
    persistProjects(updated)
    if (activeProjectId === id) {
      const next = updated[0].id
      setActiveProjectId(next)
      localStorage.setItem(ACTIVE_PROJECT_KEY, next)
      setScreen('portfolio')
    }
  }

  const confirmMigration = () => {
    saveProjects(projects)
    localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId)
    setMigrationPending(false)
  }

  const dismissMigration = () => {
    const freshProject: ProjectRecord = {
      id: crypto.randomUUID(),
      name: 'My Project',
      config: DEFAULT_CONFIG,
      sprints: [],
      createdAt: new Date().toISOString(),
    }
    const updated = [freshProject]
    persistProjects(updated)
    setActiveProjectId(freshProject.id)
    localStorage.setItem(ACTIVE_PROJECT_KEY, freshProject.id)
    setMigrationPending(false)
  }

  const velocityValues = sprints.map(s => s.completed)
  const moodValues = sprints.filter(s => s.mood != null).map(s => s.mood as number)
  const showChangePlannerAlert =
    !changePlannerDismissed &&
    (hasTwoConsecutiveDeclines(velocityValues) || hasTwoConsecutiveDeclines(moodValues))

  const handleAddSprint = (sprint: SprintData) => {
    setChangePlannerDismissed(false)
    const next = [...sprints, sprint]
    updateSprints(next)
    writeLastSession(next, config, activeProjectId)
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
      const { default: html2canvas } = await import('html2canvas')
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
    { key: 'cfd', label: t('nav.cfd') },
    { key: 'evm', label: t('nav.evm') },
    { key: 'portfolio', label: t('nav.portfolio') },
    { key: 'learn', label: t('nav.learn') },
  ]

  return (
    <div className="min-h-screen flex flex-col" data-accent="teal">
      <div className="print:hidden">
        <AppHeader
          title={t('app.title')}
          onTitleClick={() => setScreen('dashboard')}
          hideLanguagePicker={facilitatorMode}
          navItems={facilitatorMode ? [] : navItems.map(item => ({
            key: item.key,
            label: item.label,
            active: screen === item.key,
            onClick: () => setScreen(item.key as Screen),
          }))}
        >
          <ProjectSwitcher
            projects={projects}
            activeProjectId={activeProjectId}
            onSwitch={switchProject}
            onCreateProject={() => { setNewProjectName(''); setNewProjectModalOpen(true) }}
            onPortfolio={() => setScreen('portfolio')}
          />
          <ThemeToggle />
          <FacilitatorToggle
            active={facilitatorMode}
            onToggle={toggleFacilitatorMode}
            labelOn={t('facilitator.toggle_on')}
            labelOff={t('facilitator.toggle_off')}
          />
        </AppHeader>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {migrationPending && (
          <div className="mb-4 card p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">{t('project.migrate_heading')}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">{t('project.migrate_body')}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={dismissMigration} className="btn-secondary text-sm">
                  {t('project.migrate_dismiss')}
                </button>
                <button type="button" onClick={confirmMigration} className="btn-primary text-sm">
                  {t('project.migrate_save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {improvementToast !== null && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <BellIcon className="w-3.5 h-3.5 flex-shrink-0" />
              {t('integration.improvementBoardOpen', { count: improvementToast })}{' '}
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
              aria-label={t('common.dismiss')}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {showChangePlannerAlert && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <TrendDownIcon className="w-3.5 h-3.5 flex-shrink-0" />
              {t('integration.changePlannerAlert')}{' '}
              <a
                href="https://agile-toolkit.github.io/change-planner/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-red-900 dark:hover:text-red-200"
              >
                {t('integration.changePlannerLink')}
              </a>
              {sprints.length > 0 && (
                <>
                  {' · '}
                  <a
                    href={buildImprovementBoardUrl(sprints[sprints.length - 1].name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium hover:text-red-900 dark:hover:text-red-200"
                  >
                    {t('integration.improvementBoardLogLink')}
                  </a>
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => setChangePlannerDismissed(true)}
              className="text-red-500 hover:text-red-700 flex-shrink-0"
              aria-label={t('common.dismiss')}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {screen === 'learn' && <LearnView />}

        {screen === 'cfd' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">{t('nav.cfd')}</h1>
            <CFDChart sprints={sprints} />
          </div>
        )}

        {screen === 'evm' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">{t('nav.evm')}</h1>
            <AgileEvmView sprints={sprints} config={config} onUpdateConfig={updateConfig} />
          </div>
        )}

        {screen === 'portfolio' && (
          <PortfolioView
            projects={projects}
            activeProjectId={activeProjectId}
            onSwitch={switchProject}
            onDelete={deleteProject}
            onCreateProject={() => { setNewProjectName(''); setNewProjectModalOpen(true) }}
          />
        )}

        {screen === 'data' && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setDataMode('quick')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dataMode === 'quick' ? 'bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {t('dataview.mode_quick')}
              </button>
              <button
                type="button"
                onClick={() => setDataMode('detailed')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dataMode === 'detailed' ? 'bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
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
                onDeleteSprint={handleDeleteSprint}
                onUpdateSprint={sprint => updateSprints(sprints.map(s => s.id === sprint.id ? sprint : s))}
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
                onDeleteSprint={handleDeleteSprint}
                onUpdateSprint={sprint => updateSprints(sprints.map(s => s.id === sprint.id ? sprint : s))}
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {config.name || t('dashboard.title')}
                </h1>
                {teamIdentity && (
                  <a
                    href="https://agile-toolkit.github.io/team-identity/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-0.5"
                    title={t('integration.teamIdentityBadgeTitle')}
                  >
                    <span aria-hidden="true">{teamIdentity.symbol}</span>
                    {t('integration.teamIdentityBadge', { teamName: teamIdentity.teamName })}
                  </a>
                )}
                {sprints.length > 0 && sprints[sprints.length - 1].goal && (
                  <p className="text-sm text-gray-500 mt-0.5 italic dark:text-gray-400">
                    {sprints[sprints.length - 1].goal}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 print:hidden">
                {motivatorSnapshot ? (
                  <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-800">
                    <StarFilledIcon className="w-3 h-3 flex-shrink-0" />
                    {motivatorSnapshot.topMotivators.slice(0, 2).join(', ')}
                    <button
                      onClick={clearMotivatorSnapshot}
                      className="ml-1 text-orange-400 hover:text-orange-600"
                      title={t('integration.motivatorsClear')}
                    ><CloseIcon className="w-3 h-3" /></button>
                  </span>
                ) : (
                  <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-1">
                    <TargetIcon className="w-3.5 h-3.5" />
                    {t('integration.importMotivators')}
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
                      className="btn-secondary text-sm inline-flex items-center gap-1"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      {t('results.exportCsv')}
                    </button>
                    <button
                      onClick={copyDashboardImage}
                      disabled={copying}
                      className="btn-secondary text-sm inline-flex items-center gap-1"
                    >
                      {copying ? '…' : (
                        <>
                          <ClipboardIcon className="w-3.5 h-3.5" />
                          {t('results.copyImage')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="btn-secondary text-sm inline-flex items-center gap-1"
                    >
                      <PrintIcon className="w-3.5 h-3.5" />
                      {t('results.printReport')}
                    </button>
                    <button
                      onClick={() => {
                        writeLastSession(sprints, config, activeProjectId)
                        window.open('https://agile-toolkit.github.io/scrum-facilitator/?ceremony=retro', '_blank')
                      }}
                      className="btn-secondary text-sm inline-flex items-center gap-1"
                    >
                      <RefreshIcon className="w-3.5 h-3.5" />
                      {t('integration.startRetro')}
                    </button>
                  </>
                )}
                {sprints.length === 0 && (
                  <button
                    onClick={loadSampleData}
                    className="btn-secondary text-sm"
                  >
                    {t('dashboard.load_sample')}
                  </button>
                )}
              </div>
            </div>

            {sprints.length === 0 ? (
              <div className="card text-center py-12 px-6">
                <TrendUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {t('dashboard.empty_heading')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm">
                  {t('dashboard.empty_subtitle')}
                </p>
                <ol className="flex flex-col sm:flex-row justify-center gap-4 mb-8 text-sm">
                  {([
                    { num: 1, label: t('dashboard.empty_step1') },
                    { num: 2, label: t('dashboard.empty_step2') },
                    { num: 3, label: t('dashboard.empty_step3') },
                  ] as { num: number; label: string }[]).map(step => (
                    <li key={step.num} className="flex items-center gap-2 justify-center sm:flex-col sm:gap-1">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                        {step.num}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">{step.label}</span>
                    </li>
                  ))}
                </ol>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setScreen('data')}
                    className="btn-primary"
                  >
                    {t('dashboard.add_first_sprint')}
                  </button>
                  <button
                    type="button"
                    onClick={loadSampleData}
                    className="btn-secondary"
                  >
                    {t('dashboard.load_sample')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {([
                    { label: t('dashboard.stats_velocity'), value: `${avgVelocity} SP` },
                    { label: t('dashboard.stats_sprints'), value: String(sprints.length) },
                    { label: t('dashboard.stats_completed'), value: `${totalCompleted} SP` },
                    { label: t('dashboard.stats_forecast'), value: sprintsToTarget !== null ? (sprintsToTarget === 0 ? <CheckIcon className="w-5 h-5" /> : `${sprintsToTarget}`) : '—' },
                  ] as { label: string; value: ReactNode }[]).map(stat => (
                    <div key={stat.label} className="card text-center py-4">
                      <div className="text-2xl font-bold text-brand-600 tabular-nums flex items-center justify-center">{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-1 dark:text-gray-500">{stat.label}</div>
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

      {newProjectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setNewProjectModalOpen(false) }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">{t('project.new')}</h2>
            <input
              type="text"
              autoFocus
              className="input mb-4"
              placeholder={t('project.new_name_prompt')}
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { createProject(newProjectName); setNewProjectModalOpen(false) }
                if (e.key === 'Escape') setNewProjectModalOpen(false)
              }}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setNewProjectModalOpen(false)} className="btn-secondary">
                {t('dataview.cancel')}
              </button>
              <button
                type="button"
                onClick={() => { createProject(newProjectName); setNewProjectModalOpen(false) }}
                className="btn-primary"
              >
                {t('project.new')}
              </button>
            </div>
          </div>
        </div>
      )}

      {lastDeleted && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <span className="text-gray-700 dark:text-gray-200">
            {t('data.deleteUndo', { name: lastDeleted.sprint.name })}
          </span>
          <button type="button" onClick={undoDeleteSprint} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            {t('data.deleteUndoAction')}
          </button>
          <button
            type="button"
            onClick={dismissDeleteUndo}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={t('common.dismiss')}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

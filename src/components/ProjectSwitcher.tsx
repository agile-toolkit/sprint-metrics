import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectRecord } from '../types'
import { ChartIcon } from './icons'

interface ProjectSwitcherProps {
  projects: ProjectRecord[]
  activeProjectId: string
  onSwitch: (id: string) => void
  onCreateProject: () => void
  onPortfolio: () => void
}

export default function ProjectSwitcher({ projects, activeProjectId, onSwitch, onCreateProject, onPortfolio }: ProjectSwitcherProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeProject = projects.find(p => p.id === activeProjectId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={activeProject?.name}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 max-w-[140px]"
      >
        <span className="truncate font-medium">{activeProject?.name ?? 'Project'}</span>
        <svg className="w-3 h-3 flex-shrink-0 text-gray-400" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <path d="M6 8L1 3h10z"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1 overflow-hidden">
          {projects.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSwitch(p.id); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                p.id === activeProjectId
                  ? 'font-semibold text-brand-600 dark:text-brand-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="truncate">{p.name}</span>
              {p.id === activeProjectId && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" aria-hidden="true" />
              )}
            </button>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
            <button
              type="button"
              onClick={() => { onPortfolio(); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <ChartIcon className="w-3.5 h-3.5" />
              {t('nav.portfolio')}
            </button>
            <button
              type="button"
              onClick={() => { onCreateProject(); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              + {t('project.new')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

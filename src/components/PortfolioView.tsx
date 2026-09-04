import { useTranslation } from 'react-i18next'
import type { ProjectRecord } from '../types'
import { computeHealthScore, buildMaxNormVel, getHealthColor, HEALTH_BADGE_CLASSES } from '../utils/healthScore'
import { FolderIcon } from './icons'

interface PortfolioViewProps {
  projects: ProjectRecord[]
  activeProjectId: string
  onSwitch: (id: string) => void
  onDelete: (id: string) => void
  onCreateProject: () => void
}

export default function PortfolioView({ projects, activeProjectId, onSwitch, onDelete, onCreateProject }: PortfolioViewProps) {
  const { t } = useTranslation()

  const projectStats = projects.map(p => {
    const last3 = p.sprints.slice(-3)
    const avgVel = last3.length > 0
      ? Math.round(last3.reduce((s, sp) => s + sp.completed, 0) / last3.length)
      : 0
    const maxNormVel = buildMaxNormVel(p.sprints, p.config)
    const lastSprint = p.sprints[p.sprints.length - 1]
    const health = lastSprint ? computeHealthScore(lastSprint, maxNormVel, p.config) : null
    return { project: p, last3, avgVel, health }
  })

  const maxVel = Math.max(1, ...projectStats.flatMap(ps => ps.last3.map(s => s.completed)))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{t('project.portfolio')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('project.portfolio_subtitle')}</p>
        </div>
        <button type="button" onClick={onCreateProject} className="btn-primary text-sm">
          + {t('project.new')}
        </button>
      </div>

      {projects.length === 1 && (
        <div className="card py-10 text-center text-gray-500 dark:text-gray-400">
          <FolderIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm max-w-xs mx-auto">{t('project.portfolio_empty')}</p>
          <button type="button" onClick={onCreateProject} className="mt-5 btn-secondary text-sm">
            + {t('project.new')}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {projectStats.map(({ project, last3, avgVel, health }) => {
          const isActive = project.id === activeProjectId
          const healthColor = health !== null ? getHealthColor(health) : null

          return (
            <div
              key={project.id}
              className={`card p-4 ${isActive ? 'ring-2 ring-brand-400 dark:ring-brand-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                    {isActive && (
                      <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400 px-2 py-0.5 rounded-full">
                        {t('project.active')}
                      </span>
                    )}
                    {health !== null && healthColor && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${HEALTH_BADGE_CLASSES[healthColor]}`}>
                        {t('project.health')} {health}
                      </span>
                    )}
                  </div>

                  {project.sprints.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t('project.no_sprints')}</p>
                  ) : (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                        {t('project.last3_velocity')} · {t('project.avg_velocity', { avg: avgVel })}
                      </p>
                      <div className="flex items-end gap-3">
                        {last3.map(sp => (
                          <div key={sp.id} className="flex flex-col items-center gap-1">
                            <span className="text-xs tabular-nums font-medium text-gray-700 dark:text-gray-300">{sp.completed}</span>
                            <div
                              className="w-8 bg-brand-400 dark:bg-brand-500 rounded-t transition-all"
                              style={{ height: `${Math.max(4, Math.round((sp.completed / maxVel) * 48))}px` }}
                            />
                            <span
                              className="text-xs text-gray-400 dark:text-gray-500 max-w-[32px] truncate text-center"
                              title={sp.name}
                            >
                              {sp.name.replace(/sprint\s*/i, 'S')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSwitch(project.id)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      {t('project.switch')}
                    </button>
                  )}
                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(t('project.delete_confirm', { name: project.name }))) {
                          onDelete(project.id)
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      {t('project.delete')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

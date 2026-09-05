import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, ResponsiveContainer } from 'recharts'
import type { SprintData } from '../types'
import { groupSprintsIntoQuarters, downloadQuarterlyCsv } from '../utils/quarterlyRollup'
import { DownloadIcon, ChartIcon } from './icons'

interface Props {
  sprints: SprintData[]
  sprintLengthWeeks: number
  projectName: string
}

const MOOD_EMOJIS = ['😫', '😟', '😐', '🙂', '😄']

export default function QuarterlyView({ sprints, sprintLengthWeeks, projectName }: Props) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<string | null>(null)

  const quarters = groupSprintsIntoQuarters(sprints, sprintLengthWeeks)

  if (sprints.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 text-gray-400 dark:text-gray-500">
        <ChartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p>{t('quarterly.noData')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('quarterly.title')}</h1>
        <button
          type="button"
          onClick={() => downloadQuarterlyCsv(quarters, projectName)}
          className="btn-secondary text-sm inline-flex items-center gap-1"
        >
          <DownloadIcon className="w-3.5 h-3.5" />
          {t('quarterly.exportCsv')}
        </button>
      </div>

      <div className="space-y-3">
        {quarters.map(q => {
          const isOpen = expanded === q.key
          const chartData = q.sprints.map(sp => ({ name: sp.name, completed: sp.completed }))
          return (
            <div key={q.key} className="card">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : q.key)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{q.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('quarterly.sprints', { count: q.sprints.length })}
                    </p>
                  </div>
                  <div className="w-24 h-10 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <Bar dataKey="completed" fill="#059669" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('quarterly.totalPlanned')}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{q.totalPlanned}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('quarterly.totalCompleted')}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{q.totalCompleted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('quarterly.avgVelocity')}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {q.velocityPercent !== null ? `${q.velocityPercent}%` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('quarterly.avgMood')}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {q.avgMood !== null ? MOOD_EMOJIS[Math.round(q.avgMood) - 1] ?? q.avgMood : '—'}
                    </p>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                  {q.sprints.map(sp => (
                    <div key={sp.id} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{sp.name}</span>
                      <span className="text-gray-400 dark:text-gray-500">{sp.completed} / {sp.planned} SP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

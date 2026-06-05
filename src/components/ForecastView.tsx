import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SprintData, ProjectConfig } from '../types'
import { ChartWrapper, NoData } from './VelocityChart'

interface Props {
  sprints: SprintData[]
  config: ProjectConfig
}

function finishDate(numSprints: number, sprintLengthWeeks: number): string {
  const ms = numSprints * sprintLengthWeeks * 7 * 24 * 60 * 60 * 1000
  const d = new Date(Date.now() + ms)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ForecastView({ sprints, config }: Props) {
  const { t } = useTranslation()
  const [remainingOverride, setRemainingOverride] = useState<string>('')

  const completed = sprints.filter(s => s.completed > 0)
  if (completed.length < 3) {
    return (
      <NoData
        label={t('forecast.noData')}
        title={t('forecast.title')}
        explainer={t('forecast.explainer')}
      />
    )
  }

  const last3 = completed.slice(-3).map(s => s.completed)
  const avg = last3.reduce((a, b) => a + b, 0) / last3.length
  const min = Math.min(...last3)
  const max = Math.max(...last3)

  const totalCompleted = sprints.reduce((a, s) => a + s.completed, 0)
  const derivedRemaining = Math.max(0, (config.targetScope ?? 0) - totalCompleted)
  const effectiveRemaining = remainingOverride !== '' ? Math.max(0, Number(remainingOverride)) : derivedRemaining

  const avgSprints = avg > 0 ? Math.ceil(effectiveRemaining / avg) : null
  const optimisticSprints = max > 0 ? Math.ceil(effectiveRemaining / max) : null
  const pessimisticSprints = min > 0 ? Math.ceil(effectiveRemaining / min) : null

  const scenarios = [
    {
      label: t('forecast.optimistic'),
      value: optimisticSprints,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900',
    },
    {
      label: t('forecast.average'),
      value: avgSprints,
      color: 'text-brand-600',
      bg: 'bg-brand-50 border-brand-200 dark:bg-brand-700/10 dark:border-brand-800',
    },
    {
      label: t('forecast.pessimistic'),
      value: pessimisticSprints,
      color: 'text-red-500',
      bg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900',
    },
  ]

  return (
    <ChartWrapper title={t('forecast.title')} explainer={t('forecast.explainer')}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800">
            <label className="text-gray-500 mb-1 block dark:text-gray-400">{t('forecast.remaining')}</label>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                min={0}
                value={remainingOverride !== '' ? remainingOverride : derivedRemaining}
                onChange={e => setRemainingOverride(e.target.value)}
                className="w-20 text-2xl font-bold bg-transparent text-gray-900 dark:text-gray-50 border-b border-dashed border-gray-300 dark:border-gray-600 focus:outline-none focus:border-brand-500"
              />
              <span className="text-sm text-gray-400 dark:text-gray-500">SP</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800">
            <p className="text-gray-500 mb-0.5 dark:text-gray-400">{t('forecast.velocityAvg')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{Math.round(avg * 10) / 10} SP</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 dark:text-gray-400">{t('forecast.sprintsNeeded')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {scenarios.map(s => (
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
                <p className="text-xs font-semibold text-gray-500 mb-1 dark:text-gray-400">{s.label}</p>
                <p className={`text-4xl font-bold ${s.color}`}>
                  {s.value !== null ? s.value : '∞'}
                </p>
                <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{t('forecast.sprints')}</p>
                {s.value !== null && s.value > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">
                    {t('forecast.finishBy', { date: finishDate(s.value, config.sprintLengthWeeks) })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600">
          {t('forecast.sampleLabel')}: {last3.join(', ')} SP
        </p>
      </div>
    </ChartWrapper>
  )
}

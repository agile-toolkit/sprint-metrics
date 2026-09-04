import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import type { SprintData, MotivatorSnapshot, ProjectConfig } from '../types'
import { computeHealthScore, buildMaxNormVel } from '../utils/healthScore'
import { useIsDarkMode } from '../utils/theme'
import { ChartAnnotationLabel } from './ChartAnnotationLabel'

export function ChartWrapper({
  title,
  explainer,
  children,
}: {
  title: string
  explainer?: string
  children: ReactNode
}) {
  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
        {explainer && <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{explainer}</p>}
      </div>
      {children}
    </div>
  )
}

export function NoData({
  title,
  explainer,
  label,
}: {
  title: string
  explainer: string
  label: string
}) {
  return (
    <ChartWrapper title={title} explainer={explainer}>
      <p className="text-center text-gray-400 py-8 text-sm dark:text-gray-600">{label}</p>
    </ChartWrapper>
  )
}

const MOOD_EMOJIS = ['😫', '😟', '😐', '🙂', '😄']
const NORM_KEY = '_normVel'
const HEALTH_KEY = '_health'

interface Props {
  sprints: SprintData[]
  motivatorSnapshot?: MotivatorSnapshot | null
  config: ProjectConfig
}

export default function VelocityChart({ sprints, motivatorSnapshot, config }: Props) {
  const { t } = useTranslation()
  const isDark = useIsDarkMode()

  const avgVelocity = sprints.length > 0
    ? Math.round(sprints.reduce((s, sp) => s + sp.completed, 0) / sprints.length)
    : 0

  const hasMood = sprints.some(sp => sp.mood !== undefined)
  const hasCapacity = sprints.some(sp => sp.teamSize !== undefined)

  const maxNV = buildMaxNormVel(sprints, config)
  const healthScores = sprints.map(sp => computeHealthScore(sp, maxNV, config))
  const hasEnoughHealth = healthScores.length >= 3

  const data = sprints.map((sp, i) => {
    let normVel: number | null = null
    if (sp.teamSize && sp.teamSize > 0) {
      const availDays = (sp.teamSize * config.sprintLengthWeeks * 5) - (sp.absenceDays ?? 0)
      if (availDays > 0) {
        normVel = Math.round((sp.completed / availDays) * 10) / 10
      }
    }
    return {
      name: sp.name,
      [t('dashboard.planned')]: sp.planned,
      [t('dashboard.completed')]: sp.completed,
      ...(hasMood ? { [t('data.moodLabel')]: sp.mood ?? null } : {}),
      ...(hasCapacity ? { [NORM_KEY]: normVel } : {}),
      ...(hasEnoughHealth ? { [HEALTH_KEY]: healthScores[i] } : {}),
    }
  })

  const hasNormData = hasCapacity && data.some(d => d[NORM_KEY] !== null && d[NORM_KEY] !== undefined)

  const rightAxesCount = (hasMood ? 1 : 0) + (hasNormData && !hasMood ? 1 : 0) + (hasEnoughHealth && !hasMood ? 1 : 0)
  const rightMargin = rightAxesCount > 0 ? 40 : 10

  const normVelLabel = t('data.normalizedVelocity')
  const healthLabel = t('data.healthScore')

  const tooltipFormatter = (value: number | string | (string | number)[], name: string): [string | number, string] => {
    if (name === t('data.moodLabel') && typeof value === 'number') {
      return [MOOD_EMOJIS[value - 1] ?? String(value), name]
    }
    if (name === NORM_KEY) {
      return [value !== null && value !== undefined ? `${value} SP/day` : '—', normVelLabel]
    }
    if (name === HEALTH_KEY) {
      return [value !== null && value !== undefined ? String(value) : '—', healthLabel]
    }
    return [value as string | number, name]
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">{t('dashboard.velocity_title')}</h2>
        {avgVelocity > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.avg_velocity')}: <strong className="text-brand-600">{avgVelocity} SP</strong>
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: rightMargin, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="sp" tick={{ fontSize: 11 }} />
          {hasMood && (
            <YAxis
              yAxisId="mood"
              orientation="right"
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v: number) => MOOD_EMOJIS[v - 1] ?? String(v)}
              tick={{ fontSize: 14 }}
              width={36}
            />
          )}
          {hasNormData && !hasMood && (
            <YAxis
              yAxisId="norm"
              orientation="right"
              tick={{ fontSize: 11 }}
              width={36}
              tickFormatter={(v: number) => String(v)}
              label={{ value: 'SP/d', angle: -90, position: 'insideRight', fontSize: 9, fill: '#6366f1' }}
            />
          )}
          {hasEnoughHealth && !hasMood && (
            <YAxis
              yAxisId="health"
              orientation="right"
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 10 }}
              width={hasNormData ? 0 : 36}
              tickFormatter={(v: number) => String(v)}
            />
          )}
          {hasEnoughHealth && hasMood && (
            <YAxis yAxisId="health" orientation="right" domain={[0, 10]} hide />
          )}
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={isDark ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' } : undefined}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) =>
              value === NORM_KEY ? normVelLabel : value === HEALTH_KEY ? healthLabel : value
            }
          />
          <Bar yAxisId="sp" dataKey={t('dashboard.planned')} fill="#d1fae5" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="sp" dataKey={t('dashboard.completed')} fill="#059669" radius={[4, 4, 0, 0]} />
          {avgVelocity > 0 && (
            <ReferenceLine yAxisId="sp" y={avgVelocity} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: 'avg', fontSize: 11, fill: '#f59e0b' }} />
          )}
          {motivatorSnapshot && sprints.length > 0 && motivatorSnapshot.topMotivators.length > 0 && (
            <ReferenceLine
              yAxisId="sp"
              x={sprints[sprints.length - 1].name}
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="4 2"
              label={(props: object) => (
                <ChartAnnotationLabel {...props} value={motivatorSnapshot.topMotivators[0]} fill="#f97316" icon="star" position="insideTopRight" />
              )}
            />
          )}
          {sprints.filter(sp => sp.milestone).map(sp => (
            <ReferenceLine
              key={`ms-${sp.id}`}
              yAxisId="sp"
              x={sp.name}
              stroke="#d97706"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={(props: object) => (
                <ChartAnnotationLabel {...props} value={sp.milestone ?? ''} fill="#d97706" icon="flag" position="insideTopLeft" />
              )}
            />
          ))}
          {hasMood && (
            <Line
              yAxisId="mood"
              dataKey={t('data.moodLabel')}
              type="monotone"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#8b5cf6' }}
              connectNulls={false}
            />
          )}
          {hasNormData && !hasMood && (
            <Line
              yAxisId="norm"
              dataKey={NORM_KEY}
              name={NORM_KEY}
              type="monotone"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={{ r: 3, fill: '#6366f1' }}
              connectNulls={false}
            />
          )}
          {hasNormData && hasMood && (
            <Line
              yAxisId="sp"
              dataKey={NORM_KEY}
              name={NORM_KEY}
              hide
              legendType="none"
            />
          )}
          {hasEnoughHealth && (
            <Line
              yAxisId="health"
              dataKey={HEALTH_KEY}
              name={HEALTH_KEY}
              type="monotone"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={{ r: 3, fill: '#9ca3af' }}
              connectNulls={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

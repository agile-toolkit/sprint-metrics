import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import type { SprintData, MotivatorSnapshot } from '../types'

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
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {explainer && <p className="text-sm text-gray-500 mt-1">{explainer}</p>}
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
      <p className="text-center text-gray-400 py-8 text-sm">{label}</p>
    </ChartWrapper>
  )
}

const MOOD_EMOJIS = ['😫', '😟', '😐', '🙂', '😄']

interface Props {
  sprints: SprintData[]
  motivatorSnapshot?: MotivatorSnapshot | null
}

export default function VelocityChart({ sprints, motivatorSnapshot }: Props) {
  const { t } = useTranslation()

  const avgVelocity = sprints.length > 0
    ? Math.round(sprints.reduce((s, sp) => s + sp.completed, 0) / sprints.length)
    : 0

  const hasMood = sprints.some(sp => sp.mood !== undefined)

  const data = sprints.map(sp => ({
    name: sp.name,
    [t('dashboard.planned')]: sp.planned,
    [t('dashboard.completed')]: sp.completed,
    ...(hasMood ? { [t('data.moodLabel')]: sp.mood ?? null } : {}),
  }))

  const moodTickFormatter = (value: number) =>
    MOOD_EMOJIS[value - 1] ?? String(value)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">{t('dashboard.velocity_title')}</h2>
        {avgVelocity > 0 && (
          <span className="text-sm text-gray-500">
            {t('dashboard.avg_velocity')}: <strong className="text-brand-600">{avgVelocity} SP</strong>
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: hasMood ? 40 : 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="sp" tick={{ fontSize: 11 }} />
          {hasMood && (
            <YAxis
              yAxisId="mood"
              orientation="right"
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={moodTickFormatter}
              tick={{ fontSize: 14 }}
              width={36}
            />
          )}
          <Tooltip
            formatter={(value, name) => {
              if (name === t('data.moodLabel') && typeof value === 'number') {
                return [MOOD_EMOJIS[value - 1] ?? value, name]
              }
              return [value, name]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
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
              label={{ value: `★ ${motivatorSnapshot.topMotivators[0]}`, fontSize: 10, fill: '#f97316', position: 'insideTopRight' }}
            />
          )}
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
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import type { SprintData } from '../types'

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

interface Props {
  sprints: SprintData[]
}

export default function VelocityChart({ sprints }: Props) {
  const { t } = useTranslation()

  const avgVelocity = sprints.length > 0
    ? Math.round(sprints.reduce((s, sp) => s + sp.completed, 0) / sprints.length)
    : 0

  const data = sprints.map(sp => ({
    name: sp.name,
    [t('dashboard.planned')]: sp.planned,
    [t('dashboard.completed')]: sp.completed,
  }))

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
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={t('dashboard.planned')} fill="#d1fae5" radius={[4,4,0,0]} />
          <Bar dataKey={t('dashboard.completed')} fill="#059669" radius={[4,4,0,0]} />
          {avgVelocity > 0 && (
            <ReferenceLine y={avgVelocity} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: 'avg', fontSize: 11, fill: '#f59e0b' }} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

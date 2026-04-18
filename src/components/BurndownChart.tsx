import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import type { SprintData, ProjectConfig } from '../types'

interface Props {
  sprints: SprintData[]
  config: ProjectConfig
}

export default function BurndownChart({ sprints, config }: Props) {
  const { t } = useTranslation()

  const totalDone = sprints.reduce((s, sp) => s + sp.completed, 0)
  const remaining = Math.max(0, config.targetScope - totalDone)
  const avgVelocity = sprints.length > 0
    ? sprints.reduce((s, sp) => s + sp.completed, 0) / sprints.length
    : 0
  const estimatedTotal = sprints.length + (avgVelocity > 0 ? Math.ceil(remaining / avgVelocity) : 0)

  // Build data: one point per sprint done, plus future projected points
  const data: { name: string; actual: number | null; ideal: number }[] = []

  // Start point
  data.push({ name: t('dashboard.burndown_start'), actual: config.targetScope, ideal: config.targetScope })

  let cumulativeDone = 0
  sprints.forEach((sp, i) => {
    cumulativeDone += sp.completed
    const actualRemaining = Math.max(0, config.targetScope - cumulativeDone)
    const idealRemaining = Math.max(0, config.targetScope - Math.round(config.targetScope * (i + 1) / estimatedTotal))
    data.push({ name: sp.name, actual: actualRemaining, ideal: idealRemaining })
  })

  // Projected future points (dashed, no actual)
  if (avgVelocity > 0 && remaining > 0) {
    let projRemaining = Math.max(0, config.targetScope - cumulativeDone)
    let sprintNum = sprints.length + 1
    while (projRemaining > 0 && sprintNum <= estimatedTotal + 1) {
      projRemaining = Math.max(0, projRemaining - avgVelocity)
      data.push({ name: `S${sprintNum}`, actual: null, ideal: Math.max(0, config.targetScope - Math.round(config.targetScope * sprintNum / estimatedTotal)) })
      sprintNum++
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">{t('dashboard.burndown_title')}</h2>
        {remaining > 0 && avgVelocity > 0 && (
          <span className="text-sm text-gray-500">
            {t('dashboard.remaining')}: <strong className="text-orange-600">{Math.max(0, config.targetScope - sprints.reduce((s, sp) => s + sp.completed, 0))} SP</strong>
          </span>
        )}
        {remaining <= 0 && sprints.length > 0 && (
          <span className="text-sm text-green-600 font-semibold">{t('dashboard.burndown_done')}</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(val) => val !== null ? `${val} SP` : '—'} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="ideal"
            name={t('dashboard.ideal')}
            stroke="#d1d5db"
            strokeDasharray="6 3"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name={t('dashboard.remaining_line')}
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

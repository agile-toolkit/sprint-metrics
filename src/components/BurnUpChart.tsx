import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import type { SprintData, ProjectConfig } from '../types'

interface Props {
  sprints: SprintData[]
  config: ProjectConfig
}

export default function BurnUpChart({ sprints, config }: Props) {
  const { t } = useTranslation()

  let cumulative = 0
  const data = sprints.map(sp => {
    cumulative += sp.completed
    return {
      name: sp.name,
      [t('dashboard.cumulative')]: cumulative,
    }
  })

  // Add forecast points
  const avgVelocity = sprints.length > 0
    ? sprints.reduce((s, sp) => s + sp.completed, 0) / sprints.length
    : 0

  if (avgVelocity > 0 && cumulative < config.targetScope) {
    let forecastCumulative = cumulative
    let sprintNum = sprints.length + 1
    while (forecastCumulative < config.targetScope && sprintNum <= sprints.length + 15) {
      forecastCumulative = Math.min(forecastCumulative + avgVelocity, config.targetScope)
      data.push({
        name: `Sprint ${sprintNum}*`,
        [t('dashboard.cumulative')]: Math.round(forecastCumulative),
      })
      sprintNum++
    }
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-4">{t('dashboard.burnup_title')}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, Math.max(config.targetScope * 1.05, cumulative * 1.1)]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            y={config.targetScope}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{ value: t('dashboard.target'), position: 'insideTopRight', fontSize: 11, fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey={t('dashboard.cumulative')}
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import type { SprintData } from '../types'
import { useIsDarkMode } from '../utils/theme'

interface Props {
  sprints: SprintData[]
}

export default function CFDChart({ sprints }: Props) {
  const { t } = useTranslation()
  const isDark = useIsDarkMode()

  const cfdSprints = sprints.filter(
    s => s.todo != null || s.inProgress != null || s.done != null,
  )

  if (cfdSprints.length === 0) {
    return (
      <div className="card text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
        {t('dashboard.cfd_nodata')}
      </div>
    )
  }

  const data = cfdSprints.map(s => ({
    name: s.name,
    [t('data.todo')]: s.todo ?? 0,
    [t('data.inProgress')]: s.inProgress ?? 0,
    [t('data.done')]: s.done ?? 0,
  }))

  const todoKey = t('data.todo')
  const inProgressKey = t('data.inProgress')
  const doneKey = t('data.done')

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">
        {t('dashboard.cfd_title')}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} stackOffset="none">
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
            label={{ value: t('dashboard.cfd_items'), angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          />
          <Tooltip
            contentStyle={isDark
              ? { fontSize: 12, borderRadius: 8, backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }
              : { fontSize: 12, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey={doneKey}
            stackId="1"
            stroke="#16a34a"
            fill="#16a34a"
            fillOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey={inProgressKey}
            stackId="1"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey={todoKey}
            stackId="1"
            stroke="#9ca3af"
            fill="#9ca3af"
            fillOpacity={0.4}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

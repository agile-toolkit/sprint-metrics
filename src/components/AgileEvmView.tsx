import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { SprintData, ProjectConfig } from '../types'
import { computeAgileEvm } from '../agileEvm'
import { useIsDarkMode } from '../utils/theme'
import { ChartWrapper, NoData } from './VelocityChart'

interface Props {
  sprints: SprintData[]
  config: ProjectConfig
  onUpdateConfig: (next: ProjectConfig) => void
}

function finishDate(numSprints: number, sprintLengthWeeks: number): string {
  const ms = numSprints * sprintLengthWeeks * 7 * 24 * 60 * 60 * 1000
  const d = new Date(Date.now() + ms)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function IndexStat({ label, value, sub, good }: { label: string; value: string; sub?: string; good: boolean | null }) {
  const color = good === null ? 'text-gray-900 dark:text-gray-50' : good ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
  return (
    <div className="card text-center py-4">
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1 dark:text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-600">{sub}</div>}
    </div>
  )
}

export default function AgileEvmView({ sprints, config, onUpdateConfig }: Props) {
  const { t } = useTranslation()
  const isDark = useIsDarkMode()
  const [plannedSprintsInput, setPlannedSprintsInput] = useState(String(config.plannedSprints ?? ''))

  const result = computeAgileEvm(sprints, config)

  const saveBaseline = () => {
    const plannedSprints = Number(plannedSprintsInput)
    onUpdateConfig({ ...config, plannedSprints: plannedSprints > 0 ? plannedSprints : undefined })
  }

  if (!config.plannedSprints) {
    return (
      <div className="space-y-6">
        <NoData title={t('evm.title')} explainer={t('evm.explainer')} label={t('evm.noBaseline')} />
        <div className="card max-w-md">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3 text-sm">{t('evm.setBaseline')}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('evm.plannedSprints')}</label>
              <input
                type="number"
                min={1}
                className="input"
                value={plannedSprintsInput}
                onChange={e => setPlannedSprintsInput(e.target.value)}
                placeholder={t('evm.plannedSprintsPlaceholder')}
              />
            </div>
            <button type="button" onClick={saveBaseline} className="btn-primary text-sm" disabled={!(Number(plannedSprintsInput) > 0)}>
              {t('evm.saveBaseline')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!result || sprints.length === 0) {
    return <NoData title={t('evm.title')} explainer={t('evm.explainer')} label={t('evm.noData')} />
  }

  const spiGood = result.spi !== null ? result.spi >= 1 : null
  const remainingSprints = result.estimatedTotalSprints !== null
    ? Math.max(0, Math.ceil(result.estimatedTotalSprints) - result.elapsedSprints)
    : null

  return (
    <div className="space-y-6">
      <ChartWrapper title={t('evm.title')} explainer={t('evm.explainer')}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={result.points} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={isDark ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' } : undefined} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="pv" name={t('evm.pv')} stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="ev" name={t('evm.ev')} stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 dark:text-gray-400">{t('evm.indicesTitle')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <IndexStat
            label={t('evm.spi')}
            value={result.spi !== null ? result.spi.toFixed(2) : '—'}
            sub={result.spi !== null ? (spiGood ? t('evm.spiAhead') : t('evm.spiBehind')) : undefined}
            good={spiGood}
          />
          <IndexStat
            label={t('evm.forecastFinish')}
            value={remainingSprints !== null ? finishDate(remainingSprints, config.sprintLengthWeeks) : '—'}
            sub={result.estimatedTotalSprints !== null
              ? t('evm.forecastSprintsOfPlanned', { total: Math.ceil(result.estimatedTotalSprints), planned: result.plannedSprints })
              : undefined}
            good={null}
          />
          <IndexStat
            label={t('evm.evOfBac')}
            value={`${result.ev} / ${result.bacPoints} SP`}
            sub={t('evm.pvLabel', { pv: Math.round(result.pv * 10) / 10 })}
            good={null}
          />
        </div>
      </div>

      <details className="card">
        <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">{t('evm.editBaseline')}</summary>
        <div className="space-y-3 mt-4 max-w-md">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('evm.plannedSprints')}</label>
            <input type="number" min={1} className="input" value={plannedSprintsInput} onChange={e => setPlannedSprintsInput(e.target.value)} />
          </div>
          <button type="button" onClick={saveBaseline} className="btn-secondary text-sm">{t('evm.saveBaseline')}</button>
        </div>
      </details>
    </div>
  )
}

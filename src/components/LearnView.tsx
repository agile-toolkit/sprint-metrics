import { useTranslation } from 'react-i18next'
import { ChartIcon, TrendUpIcon, TargetIcon, WarningIcon } from './icons'

const PITFALLS = ['p1', 'p2', 'p3', 'p4'] as const

export default function LearnView() {
  const { t } = useTranslation()
  const sections = [
    { key: 'velocity', Icon: ChartIcon },
    { key: 'burnup', Icon: TrendUpIcon },
    { key: 'forecast', Icon: TargetIcon },
  ] as const

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('learn.title')}</h1>
      {sections.map(s => (
        <div key={s.key} className="card">
          <div className="flex gap-3">
            <s.Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400" />
            <div>
              <h2 className="font-semibold text-gray-900 mb-2 dark:text-gray-50">{t(`learn.${s.key}_title`)}</h2>
              <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">{t(`learn.${s.key}_body`)}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="card bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900">
        <h2 className="font-semibold text-orange-900 mb-3 dark:text-orange-300">{t('learn.pitfalls_title')}</h2>
        <ul className="space-y-2">
          {PITFALLS.map(p => (
            <li key={p} className="flex gap-2 text-sm text-orange-800 dark:text-orange-300">
              <WarningIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {t(`learn.${p}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

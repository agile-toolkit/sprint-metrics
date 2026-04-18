import { useTranslation } from 'react-i18next';
import type { Project } from '../types';
import { ChartWrapper, NoData } from './VelocityChart';

interface Props { project: Project; }

export default function ForecastView({ project }: Props) {
  const { t } = useTranslation();

  const completed = project.sprints.filter(s => s.completed > 0);
  if (completed.length < 3) {
    return <NoData label={t('forecast.noData')} title={t('forecast.title')} explainer={t('forecast.explainer')} />;
  }

  const last3 = completed.slice(-3).map(s => s.completed);
  const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
  const min = Math.min(...last3);
  const max = Math.max(...last3);

  const totalCompleted = project.sprints.reduce((a, s) => a + s.completed, 0);
  const remaining = Math.max(0, (project.totalScope || totalCompleted + avg * 5) - totalCompleted);

  const avgSprints = avg > 0 ? Math.ceil(remaining / avg) : null;
  const optimisticSprints = max > 0 ? Math.ceil(remaining / max) : null;
  const pessimisticSprints = min > 0 ? Math.ceil(remaining / min) : null;

  const scenarios = [
    { label: t('forecast.optimistic'), value: optimisticSprints, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { label: t('forecast.average'), value: avgSprints, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200' },
    { label: t('forecast.pessimistic'), value: pessimisticSprints, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  ];

  return (
    <ChartWrapper title={t('forecast.title')} explainer={t('forecast.explainer')}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 mb-0.5">{t('forecast.remaining')}</p>
            <p className="text-2xl font-bold text-slate-800">{remaining} SP</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 mb-0.5">{t('forecast.velocityAvg')}</p>
            <p className="text-2xl font-bold text-slate-800">{Math.round(avg * 10) / 10} SP</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">{t('forecast.sprintsNeeded')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {scenarios.map(s => (
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
                <p className="text-xs font-semibold text-slate-500 mb-1">{s.label}</p>
                <p className={`text-4xl font-bold ${s.color}`}>
                  {s.value !== null ? s.value : '∞'}
                </p>
                <p className="text-xs text-slate-400 mt-1">{t('forecast.atCurrentPace')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          <p>Velocity sample (last 3 completed sprints): {last3.join(', ')} SP</p>
          <p>Min: {min} / Max: {max} / Avg: {Math.round(avg * 10) / 10}</p>
        </div>
      </div>
    </ChartWrapper>
  );
}

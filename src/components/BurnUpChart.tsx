import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Project } from '../types';
import { ChartWrapper, NoData } from './VelocityChart';

interface Props { project: Project; }

export default function BurnUpChart({ project }: Props) {
  const { t } = useTranslation();

  if (project.sprints.length < 2) {
    return <NoData label={t('burnup.noData')} title={t('burnup.title')} explainer={t('burnup.explainer')} />;
  }

  let cumulative = 0;
  const data = project.sprints.map(s => {
    cumulative += s.completed;
    return { name: s.name, completed: cumulative, scope: project.totalScope || cumulative + 10 };
  });

  return (
    <ChartWrapper title={t('burnup.title')} explainer={t('burnup.explainer')}>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="completed" name={t('burnup.completed')} stroke="#eab308" fill="#fef9c3" strokeWidth={2.5} />
          <Area type="monotone" dataKey="scope" name={t('burnup.scope')} stroke="#94a3b8" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
          {project.totalScope > 0 && (
            <ReferenceLine y={project.totalScope} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Target', fill: '#ef4444', fontSize: 11 }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

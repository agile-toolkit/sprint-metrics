import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import type { Project } from '../types';

interface Props { project: Project; }

export default function VelocityChart({ project }: Props) {
  const { t } = useTranslation();

  if (project.sprints.length < 2) {
    return <NoData label={t('velocity.noData')} title={t('velocity.title')} explainer={t('velocity.explainer')} />;
  }

  const data = project.sprints.map((s, i) => {
    const window = project.sprints.slice(Math.max(0, i - 2), i + 1);
    const avg = window.reduce((sum, w) => sum + w.completed, 0) / window.length;
    return { name: s.name, completed: s.completed, avg: Math.round(avg * 10) / 10 };
  });

  return (
    <ChartWrapper title={t('velocity.title')} explainer={t('velocity.explainer')}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" name={t('velocity.completed')} fill="#eab308" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="avg" name={t('velocity.avg')} stroke="#dc2626" strokeWidth={2} dot={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function ChartWrapper({ title, explainer, children }: { title: string; explainer: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-sm text-brand-800">{explainer}</div>
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">{children}</div>
    </div>
  );
}

export function NoData({ label, title, explainer }: { label: string; title: string; explainer: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-sm text-brand-800">{explainer}</div>
      <p className="text-slate-400 text-sm italic">{label}</p>
    </div>
  );
}

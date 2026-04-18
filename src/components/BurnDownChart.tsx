import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Project } from '../types';
import { ChartWrapper, NoData } from './VelocityChart';

interface Props { project: Project; }

export default function BurnDownChart({ project }: Props) {
  const { t } = useTranslation();
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (project.sprints.length === 0) {
    return <NoData label={t('burndown.noData')} title={t('burndown.title')} explainer={t('burndown.explainer')} />;
  }

  const sprint = project.sprints[selectedIdx];
  const days = 10;
  const data = Array.from({ length: days + 1 }, (_, d) => {
    const ideal = sprint.planned - (sprint.planned / days) * d;
    const actual = d === 0
      ? sprint.planned
      : d < days
        ? sprint.planned - (sprint.completed / days) * d
        : sprint.carriedOver > 0 ? sprint.carriedOver : sprint.planned - sprint.completed;
    return { day: d === 0 ? 'Start' : d === days ? 'End' : `D${d}`, ideal: Math.round(ideal), actual: Math.round(actual) };
  });

  return (
    <ChartWrapper title={t('burndown.title')} explainer={t('burndown.explainer')}>
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-600 mr-2">{t('burndown.selectSprint')}</label>
        <select
          value={selectedIdx}
          onChange={e => setSelectedIdx(Number(e.target.value))}
          className="border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {project.sprints.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ideal" name={t('burndown.ideal')} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="actual" name={t('burndown.actual')} stroke="#eab308" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

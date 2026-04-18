import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, Sprint } from '../types';

interface Props {
  project: Project;
  onChange: (p: Project) => void;
}

export default function SprintDataView({ project, onChange }: Props) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', planned: '', completed: '', carriedOver: '', startDate: '', endDate: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  function update(patch: Partial<Project>) {
    onChange({ ...project, ...patch, updatedAt: new Date().toISOString() });
  }

  function addSprint() {
    if (!form.name.trim()) return;
    const sprint: Sprint = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      planned: Number(form.planned) || 0,
      completed: Number(form.completed) || 0,
      carriedOver: Number(form.carriedOver) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
    };
    update({ sprints: [...project.sprints, sprint] });
    setForm({ name: '', planned: '', completed: '', carriedOver: '', startDate: '', endDate: '' });
    setAdding(false);
  }

  function deleteSprint(id: string) {
    update({ sprints: project.sprints.filter(s => s.id !== id) });
  }

  function exportCSV() {
    const rows = [
      ['name', 'planned', 'completed', 'carriedOver', 'startDate', 'endDate'],
      ...project.sprints.map(s => [s.name, s.planned, s.completed, s.carriedOver, s.startDate, s.endDate]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sprint-data.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = (ev.target?.result as string).split('\n').filter(Boolean);
      const sprints: Sprint[] = lines.slice(1).map(line => {
        const [name, planned, completed, carriedOver, startDate, endDate] = line.split(',');
        return { id: crypto.randomUUID(), name: name?.trim() ?? '', planned: Number(planned) || 0, completed: Number(completed) || 0, carriedOver: Number(carriedOver) || 0, startDate: startDate?.trim() ?? '', endDate: endDate?.trim() ?? '' };
      });
      update({ sprints: [...project.sprints, ...sprints] });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-800">{t('data.title')}</h2>

      {/* Project config */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('data.projectName')}</label>
          <input type="text" value={project.name} placeholder={t('data.projectNamePlaceholder')} onChange={e => update({ name: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('data.totalScope')}</label>
          <input type="number" value={project.totalScope || ''} min={0} onChange={e => update({ totalScope: Number(e.target.value) })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setAdding(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + {t('data.addSprint')}
        </button>
        <button onClick={() => fileRef.current?.click()} className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm transition-colors">
          {t('data.importCSV')}
        </button>
        {project.sprints.length > 0 && (
          <button onClick={exportCSV} className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm transition-colors">
            {t('data.exportCSV')}
          </button>
        )}
        <input ref={fileRef} type="file" accept=".csv" onChange={importCSV} className="hidden" />
      </div>
      <p className="text-xs text-slate-400">{t('data.csvFormat')}</p>

      {/* Add form */}
      {adding && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('data.sprintName')}</label>
              <input type="text" value={form.name} placeholder={t('data.sprintNamePlaceholder')} autoFocus onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            {(['planned', 'completed', 'carriedOver'] as const).map(field => (
              <div key={field}>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">{t(`data.${field}`)}</label>
                <input type="number" value={form[field]} min={0} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('data.startDate')}</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('data.endDate')}</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addSprint} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium">{t('data.add')}</button>
            <button onClick={() => setAdding(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-medium">{t('data.cancel')}</button>
          </div>
        </div>
      )}

      {/* Sprint table */}
      {project.sprints.length === 0 ? (
        <p className="text-slate-400 text-sm italic">{t('data.noSprints')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
            <thead>
              <tr className="bg-slate-50 text-left">
                {['sprintName', 'planned', 'completed', 'carriedOver', 'startDate', 'endDate'].map(col => (
                  <th key={col} className="px-3 py-2 font-semibold text-slate-600 border-b border-slate-200">
                    {t(`data.${col === 'sprintName' ? 'sprintName' : col}`)}
                  </th>
                ))}
                <th className="px-3 py-2 border-b border-slate-200" />
              </tr>
            </thead>
            <tbody>
              {project.sprints.map((sprint, idx) => (
                <tr key={sprint.id} className={idx % 2 === 0 ? '' : 'bg-slate-50/50'}>
                  <td className="px-3 py-2 border-b border-slate-100 font-medium">{sprint.name}</td>
                  <td className="px-3 py-2 border-b border-slate-100 text-slate-700">{sprint.planned}</td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    <span className={`font-semibold ${sprint.completed >= sprint.planned ? 'text-green-600' : 'text-amber-600'}`}>{sprint.completed}</span>
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100 text-slate-500">{sprint.carriedOver}</td>
                  <td className="px-3 py-2 border-b border-slate-100 text-slate-400 text-xs">{sprint.startDate}</td>
                  <td className="px-3 py-2 border-b border-slate-100 text-slate-400 text-xs">{sprint.endDate}</td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    <button onClick={() => deleteSprint(sprint.id)} className="text-slate-300 hover:text-red-400 transition-colors">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

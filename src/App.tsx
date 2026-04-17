import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, View } from './types';
import SprintDataView from './components/SprintDataView';
import VelocityChart from './components/VelocityChart';
import BurnDownChart from './components/BurnDownChart';
import BurnUpChart from './components/BurnUpChart';
import ForecastView from './components/ForecastView';

const STORAGE_KEY = 'sprint-metrics-project';

function load(): Project {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') ?? makeEmpty();
  } catch { return makeEmpty(); }
}

function makeEmpty(): Project {
  return {
    id: crypto.randomUUID(),
    name: '',
    totalScope: 0,
    sprints: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function App() {
  const { i18n } = useTranslation();
  const [view, setView] = useState<View>('data');
  const [project, setProject] = useState<Project>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  const navItems: { key: View; labelKey: string }[] = [
    { key: 'data', labelKey: 'nav.data' },
    { key: 'velocity', labelKey: 'nav.velocity' },
    { key: 'burndown', labelKey: 'nav.burndown' },
    { key: 'burnup', labelKey: 'nav.burnup' },
    { key: 'forecast', labelKey: 'nav.forecast' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">Sprint Metrics</span>
          <button
            onClick={() => i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru')}
            className="text-sm bg-brand-700 hover:bg-brand-500 px-3 py-1 rounded transition-colors"
          >
            {i18n.language.startsWith('ru') ? 'EN' : 'RU'}
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-1 flex gap-1 overflow-x-auto">
          {navItems.map(n => (
            <NavBtn key={n.key} active={view === n.key} labelKey={n.labelKey} onClick={() => setView(n.key)} />
          ))}
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {view === 'data' && <SprintDataView project={project} onChange={setProject} />}
        {view === 'velocity' && <VelocityChart project={project} />}
        {view === 'burndown' && <BurnDownChart project={project} />}
        {view === 'burnup' && <BurnUpChart project={project} />}
        {view === 'forecast' && <ForecastView project={project} />}
      </main>
    </div>
  );
}

function NavBtn({ active, labelKey, onClick }: { active: boolean; labelKey: string; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} className={`px-3 py-1 text-sm rounded-t transition-colors whitespace-nowrap ${active ? 'bg-white text-brand-700 font-semibold' : 'text-yellow-100 hover:text-white hover:bg-brand-500'}`}>
      {t(labelKey)}
    </button>
  );
}

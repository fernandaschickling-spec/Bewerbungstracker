import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Briefcase, Globe, Users, Plus, X, Edit2, Trash2,
  ExternalLink, Calendar, MapPin, Euro, Mail, Phone, Linkedin,
  CheckCircle2, FileText, TrendingUp, Building2, Target,
  ChevronRight, Search, Download, Save, Sparkles, Copy, User
} from 'lucide-react';

const STORAGE_KEY = 'bewerbungstracker_v3';
const TARGET_DATE = '2026-10-31';
const CLAUDE_AI_URL = 'https://claude.ai/new';

const DEFAULT_PLATFORMS = [
  { id: 'p1', name: 'StepStone', url: 'https://www.stepstone.de/jobs/ingenieur/in-karlsruhe', category: 'Allgemein', priority: 'hoch', notes: 'Beste Stellenanzahl für Ingenieure DE' },
  { id: 'p2', name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/search/?keywords=Ingenieur&location=Karlsruhe', category: 'Allgemein', priority: 'hoch', notes: 'Direktkontakt zu HR möglich' },
  { id: 'p3', name: 'XING Jobs', url: 'https://www.xing.com/jobs/search?keywords=Ingenieur&location=Karlsruhe', category: 'Allgemein', priority: 'hoch', notes: 'DACH-Fokus, Recruiter aktiv' },
  { id: 'p4', name: 'Indeed', url: 'https://de.indeed.com/jobs?q=Ingenieur&l=Karlsruhe', category: 'Allgemein', priority: 'hoch' },
  { id: 'p5', name: 'VDI Ingenieurkarriere', url: 'https://www.ingenieurkarriere.de/', category: 'Ingenieur', priority: 'hoch', notes: 'Offizielles VDI Portal' },
  { id: 'p6', name: 'Jobvector', url: 'https://www.jobvector.de/', category: 'Ingenieur', priority: 'hoch', notes: 'Tech & Naturwissenschaften' },
  { id: 'p7', name: 'Engineering Career', url: 'https://www.engineering-career.de/', category: 'Ingenieur', priority: 'mittel' },
  { id: 'p8', name: 'Make it in Germany', url: 'https://www.make-it-in-germany.com/de/jobs/jobboerse', category: 'International', priority: 'hoch', notes: 'Offiz. Portal für ausländische Fachkräfte' },
  { id: 'p9', name: 'EURES (EU Jobs)', url: 'https://eures.europa.eu/index_de', category: 'International', priority: 'mittel' },
  { id: 'p10', name: 'Arbeitsagentur', url: 'https://www.arbeitsagentur.de/jobsuche/suche?was=Ingenieur&wo=Karlsruhe', category: 'Behördlich', priority: 'mittel' },
  { id: 'p11', name: 'EnBW Karriere', url: 'https://www.enbw.com/unternehmen/karriere/', category: 'Direkt', priority: 'hoch', notes: 'Energieversorger Karlsruhe' },
  { id: 'p12', name: 'Bosch Karriere', url: 'https://www.bosch.com/de/karriere/', category: 'Direkt', priority: 'hoch' },
  { id: 'p13', name: 'Siemens', url: 'https://jobs.siemens.com/de_DE/jobs', category: 'Direkt', priority: 'hoch' },
  { id: 'p14', name: 'ZF Friedrichshafen', url: 'https://www.zf.com/karriere', category: 'Direkt', priority: 'hoch' },
  { id: 'p15', name: 'KIT (Forschung)', url: 'https://www.pse.kit.edu/karriere/', category: 'Direkt', priority: 'mittel', notes: 'Karlsruher Institut für Technologie' },
  { id: 'p16', name: 'SAP Karriere', url: 'https://jobs.sap.com/', category: 'Direkt', priority: 'hoch', notes: 'Walldorf, nahe Karlsruhe' },
  { id: 'p17', name: 'Vector Informatik', url: 'https://www.vector.com/de/de/karriere/', category: 'Direkt', priority: 'hoch', notes: 'Stuttgart/KA Region' },
  { id: 'p18', name: 'Honeypot (Tech)', url: 'https://www.honeypot.io/', category: 'Tech', priority: 'mittel', notes: 'Englischsprachig OK' },
  { id: 'p19', name: 'Glassdoor', url: 'https://www.glassdoor.de/Job/karlsruhe-ingenieur-jobs-SRCH_IL.0,9_IC2920500_KO10,19.htm', category: 'Allgemein', priority: 'mittel', notes: 'Mit Gehaltsdaten' },
  { id: 'p20', name: 'Kununu (Bewertungen)', url: 'https://www.kununu.com/', category: 'Recherche', priority: 'mittel', notes: 'Arbeitgeberbewertungen prüfen' },
];

const STATUS_CONFIG = {
  recherche:  { label: 'Recherche',   color: '#94A3B8', bg: '#F1F5F9' },
  beworben:   { label: 'Beworben',    color: '#3B82F6', bg: '#DBEAFE' },
  antwort:    { label: 'Antwort',     color: '#F59E0B', bg: '#FEF3C7' },
  interview:  { label: 'Interview',   color: '#8B5CF6', bg: '#EDE9FE' },
  angebot:    { label: 'Angebot',     color: '#10B981', bg: '#D1FAE5' },
  absage:     { label: 'Absage',      color: '#EF4444', bg: '#FEE2E2' },
  zusage:     { label: 'Zusage',      color: '#059669', bg: '#A7F3D0' },
};

const EMPTY_CV = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', xing: '', dateOfBirth: '', nationality: 'Brasilianisch', workPermit: 'Anerkannt als Ingenieur in Deutschland' },
  summary: '', experience: [], education: [],
  skills: { technical: [], soft: [] }, languages: [], certifications: [],
};

const initialData = {
  applications: [], platforms: DEFAULT_PLATFORMS, cv: EMPTY_CV,
  candidate: { age: 31, profession: 'Ingenieur', origin: 'Brasilien', location: 'Karlsruhe', targetDate: TARGET_DATE }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [loaded, setLoaded] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [cvCustomizeApp, setCvCustomizeApp] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingPlatformIds = new Set((parsed.platforms || []).map(p => p.id));
        const newPlatforms = DEFAULT_PLATFORMS.filter(p => !existingPlatformIds.has(p.id));
        setData({
          ...initialData, ...parsed,
          cv: { ...EMPTY_CV, ...(parsed.cv || {}) },
          platforms: [...(parsed.platforms || []), ...newPlatforms],
        });
      }
    } catch (e) { console.error('Load error', e); }
    setLoaded(true);
  }, []);

  const saveData = (newData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setSaveStatus('Gespeichert');
      setTimeout(() => setSaveStatus(''), 1500);
    } catch (e) { setSaveStatus('Fehler'); }
  };

  const updateCV = (cv) => saveData({ ...data, cv });

  const addApplication = (app) => {
    const newApp = { id: 'a' + Date.now(), ...app, contacts: app.contacts || [], customCV: null,
      activities: [{ date: new Date().toISOString().split('T')[0], type: 'erstellt', description: 'Bewerbung angelegt' }] };
    saveData({ ...data, applications: [...data.applications, newApp] });
  };

  const updateApplication = (id, updates) => {
    const apps = data.applications.map(a => a.id === id ? { ...a, ...updates } : a);
    saveData({ ...data, applications: apps });
  };

  const deleteApplication = (id) => {
    if (!confirm('Bewerbung wirklich löschen?')) return;
    saveData({ ...data, applications: data.applications.filter(a => a.id !== id) });
  };

  const addContact = (appId, contact) => {
    const newContact = { id: 'c' + Date.now(), ...contact };
    const apps = data.applications.map(a => a.id === appId ? { ...a, contacts: [...(a.contacts || []), newContact] } : a);
    saveData({ ...data, applications: apps });
  };

  const deleteContact = (appId, contactId) => {
    const apps = data.applications.map(a => a.id === appId ? { ...a, contacts: a.contacts.filter(c => c.id !== contactId) } : a);
    saveData({ ...data, applications: apps });
  };

  const togglePlatformSearched = (id) => {
    const platforms = data.platforms.map(p => p.id === id ? { ...p, isSearched: !p.isSearched, lastSearched: !p.isSearched ? new Date().toISOString().split('T')[0] : null } : p);
    saveData({ ...data, platforms });
  };

  const exportCSV = () => {
    const headers = ['Unternehmen', 'Position', 'Standort', 'Gehalt', 'Status', 'Beworben am', 'Frist', 'Quelle', 'URL', 'Kontakte', 'Angepasster CV', 'Notizen'];
    const rows = data.applications.map(a => [
      a.company || '', a.position || '', a.location || '', a.salary || '',
      STATUS_CONFIG[a.status]?.label || a.status, a.appliedDate || '', a.deadline || '',
      a.source || '', a.jobUrl || '',
      (a.contacts || []).map(c => `${c.name} (${c.role})`).join('; '),
      a.customCV ? 'Ja' : 'Nein', (a.notes || '').replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bewerbungen-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (confirm('Backup wirklich laden? Aktuelle Daten werden überschrieben.')) {
          saveData({ ...initialData, ...parsed, cv: { ...EMPTY_CV, ...(parsed.cv || {}) } });
        }
      } catch (err) { alert('Ungültige Backup-Datei'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const stats = {
    total: data.applications.length,
    aktiv: data.applications.filter(a => !['absage', 'zusage'].includes(a.status)).length,
    interviews: data.applications.filter(a => ['interview', 'angebot'].includes(a.status)).length,
    zusagen: data.applications.filter(a => a.status === 'zusage').length,
    plattformenDurchsucht: data.platforms.filter(p => p.isSearched).length,
  };

  const daysToTarget = Math.ceil((new Date(TARGET_DATE) - new Date()) / (1000 * 60 * 60 * 24));
  const filteredApps = data.applications.filter(a => {
    const matchesStatus = filterStatus === 'alle' || a.status === filterStatus;
    const matchesSearch = !searchTerm ||
      (a.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const cvFilled = data.cv?.personal?.name && (data.cv?.experience?.length > 0 || data.cv?.summary);

  const tabs = [
    { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
    { id: 'cv', label: 'Lebenslauf', icon: FileText },
    { id: 'platforms', label: 'Portale', icon: Globe },
    { id: 'applications', label: 'Bewerbungen', icon: Briefcase },
    { id: 'contacts', label: 'Kontakte', icon: Users },
  ];

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
      <div className="text-stone-500">Lade...</div>
    </div>;
  }

  return (
    <div className="min-h-screen pb-20 bg-[#FAF8F3]">
      <header className="border-b sticky top-0 z-20 bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight" style={{ color: '#1F3A2E' }}>Bewerbungs-Dossier</h1>
              <p className="text-xs text-stone-600 mt-0.5">{data.cv?.personal?.name || 'Kandidat'} · {data.candidate.profession} · {data.candidate.location}</p>
            </div>
            <div className="flex items-center gap-3">
              {saveStatus && <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}><CheckCircle2 className="w-3 h-3" />{saveStatus}</span>}
              <div className="text-right">
                <div className="font-mono-c text-xs text-stone-500 uppercase tracking-wider">Ziel</div>
                <div className="font-display text-base font-semibold" style={{ color: daysToTarget < 30 ? '#DC2626' : '#1F3A2E' }}>{daysToTarget > 0 ? `${daysToTarget} Tage` : 'Erreicht'}</div>
              </div>
            </div>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all"
              style={{ borderColor: active ? '#1F3A2E' : 'transparent', color: active ? '#1F3A2E' : '#78716C' }}>
              <Icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>;
          })}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <p className="font-mono-c text-xs uppercase tracking-widest text-stone-500 mb-1">Pipeline</p>
              <h2 className="font-display text-xl sm:text-2xl font-medium" style={{ color: '#1F3A2E' }}>Aktueller Stand</h2>
            </div>
            {!cvFilled && (
              <div className="p-4 rounded-lg border-2 border-dashed flex items-start gap-3" style={{ borderColor: '#F59E0B', backgroundColor: '#FEF3C7' }}>
                <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: '#92400E' }}>Lebenslauf noch nicht hinterlegt</div>
                  <div className="text-xs mt-1" style={{ color: '#92400E' }}>Ohne CV-Daten kann die Anpassung pro Stelle nicht erfolgen.</div>
                  <button onClick={() => setActiveTab('cv')} className="mt-2 text-xs px-3 py-1 rounded font-medium text-white" style={{ backgroundColor: '#92400E' }}>Zum Lebenslauf</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Bewerbungen" value={stats.total} icon={Briefcase} accent="#1F3A2E" />
              <StatCard label="Aktiv" value={stats.aktiv} icon={TrendingUp} accent="#3B82F6" />
              <StatCard label="Interviews" value={stats.interviews} icon={Target} accent="#8B5CF6" />
              <StatCard label="Zusagen" value={stats.zusagen} icon={CheckCircle2} accent="#059669" />
            </div>
            <section className="rounded-lg p-5 border bg-white" style={{ borderColor: '#E5E0D5' }}>
              <h3 className="font-display text-lg font-medium mb-4" style={{ color: '#1F3A2E' }}>Status-Verteilung</h3>
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = data.applications.filter(a => a.status === key).length;
                  const pct = stats.total > 0 ? (count / stats.total * 100) : 0;
                  return <div key={key} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-20 sm:w-24" style={{ color: cfg.color }}>{cfg.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F1E8' }}>
                      <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                    </div>
                    <span className="font-mono-c text-xs text-stone-600 w-8 text-right">{count}</span>
                  </div>;
                })}
              </div>
            </section>
            <section className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => { setEditingApp(null); setShowAppModal(true); }} className="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm" style={{ backgroundColor: '#1F3A2E', borderColor: '#1F3A2E', color: '#FAF8F3' }}>
                <div className="text-left">
                  <div className="font-display text-base font-medium">Neue Bewerbung</div>
                  <div className="text-xs opacity-80 mt-0.5">Stelle erfassen und tracken</div>
                </div>
                <Plus className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveTab('platforms')} className="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm bg-white" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>
                <div className="text-left">
                  <div className="font-display text-base font-medium">Portale durchsuchen</div>
                  <div className="text-xs text-stone-600 mt-0.5">{stats.plattformenDurchsucht} / {data.platforms.length}</div>
                </div>
                <Globe className="w-5 h-5" />
              </button>
            </section>

            <section className="rounded-lg p-5 border bg-white" style={{ borderColor: '#E5E0D5' }}>
              <h3 className="font-display text-lg font-medium mb-3" style={{ color: '#1F3A2E' }}>Datensicherung</h3>
              <p className="text-xs text-stone-600 mb-3">Daten liegen lokal im Browser. Regelmäßiges Backup empfohlen.</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={exportBackup} className="text-xs px-3 py-2 rounded border flex items-center gap-1" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>
                  <Download className="w-3 h-3" /> Backup speichern
                </button>
                <label className="text-xs px-3 py-2 rounded border flex items-center gap-1 cursor-pointer" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>
                  <Save className="w-3 h-3" /> Backup laden
                  <input type="file" accept="application/json" onChange={importBackup} className="hidden" />
                </label>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'cv' && <CVEditor cv={data.cv} onChange={updateCV} />}

        {activeTab === 'platforms' && (
          <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <p className="font-mono-c text-xs uppercase tracking-widest text-stone-500 mb-1">Quellen</p>
                <h2 className="font-display text-xl sm:text-2xl font-medium" style={{ color: '#1F3A2E' }}>Jobportale</h2>
              </div>
              <div className="font-mono-c text-xs text-stone-500">{stats.plattformenDurchsucht} / {data.platforms.length} durchsucht</div>
            </div>
            {['hoch', 'mittel'].map(prio => {
              const items = data.platforms.filter(p => (p.priority || 'mittel') === prio);
              if (items.length === 0) return null;
              return <section key={prio}>
                <h3 className="font-display text-base font-medium mb-3 flex items-center gap-2" style={{ color: '#1F3A2E' }}>Priorität {prio} <span className="font-mono-c text-xs text-stone-500">({items.length})</span></h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {items.map(platform => <PlatformCard key={platform.id} platform={platform} onToggle={() => togglePlatformSearched(platform.id)} />)}
                </div>
              </section>;
            })}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-5">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <p className="font-mono-c text-xs uppercase tracking-widest text-stone-500 mb-1">Pipeline</p>
                <h2 className="font-display text-xl sm:text-2xl font-medium" style={{ color: '#1F3A2E' }}>Bewerbungen</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={exportCSV} disabled={data.applications.length === 0} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all hover:shadow-sm disabled:opacity-40 bg-white" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}><Download className="w-4 h-4" /> CSV</button>
                <button onClick={() => { setEditingApp(null); setShowAppModal(true); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all hover:shadow-sm" style={{ backgroundColor: '#1F3A2E', color: '#FAF8F3' }}><Plus className="w-4 h-4" /> Neu</button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg border bg-white" style={{ borderColor: '#E5E0D5' }}>
                <Search className="w-4 h-4 text-stone-400" />
                <input type="text" placeholder="Suchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none bg-transparent text-sm" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none bg-white" style={{ borderColor: '#E5E0D5' }}>
                <option value="alle">Alle Status</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 rounded-lg border-2 border-dashed" style={{ borderColor: '#E5E0D5' }}>
                <Briefcase className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 text-sm">{data.applications.length === 0 ? 'Noch keine Bewerbung erfasst.' : 'Keine Treffer.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map(app => <ApplicationCard key={app.id} app={app}
                  expanded={expandedApp === app.id} onToggle={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                  onEdit={() => { setEditingApp(app); setShowAppModal(true); }} onDelete={() => deleteApplication(app.id)}
                  onStatusChange={(status) => updateApplication(app.id, { status, lastUpdate: new Date().toISOString().split('T')[0] })}
                  onAddContact={(contact) => addContact(app.id, contact)} onDeleteContact={(cid) => deleteContact(app.id, cid)}
                  onCustomizeCV={() => setCvCustomizeApp(app)} cvFilled={cvFilled} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-5">
            <div>
              <p className="font-mono-c text-xs uppercase tracking-widest text-stone-500 mb-1">Netzwerk</p>
              <h2 className="font-display text-xl sm:text-2xl font-medium" style={{ color: '#1F3A2E' }}>Ansprechpartner</h2>
            </div>
            {data.applications.flatMap(a => (a.contacts || [])).length === 0 ? (
              <div className="text-center py-12 rounded-lg border-2 border-dashed" style={{ borderColor: '#E5E0D5' }}>
                <Users className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 text-sm">Noch keine Kontakte</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.applications.flatMap(a => (a.contacts || []).map(c => (
                  <div key={a.id + c.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: '#E5E0D5' }}>
                    <div className="font-display text-base font-medium" style={{ color: '#1F3A2E' }}>{c.name}</div>
                    <div className="text-xs text-stone-500">{c.role || '—'}</div>
                    <div className="text-xs text-stone-600 mt-2 mb-3 flex items-center gap-1"><Building2 className="w-3 h-3" /> {a.company} · {a.position}</div>
                    <div className="flex flex-wrap gap-2">
                      {c.email && <a href={`mailto:${c.email}`} className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: '#F5F1E8', color: '#1F3A2E' }}><Mail className="w-3 h-3" />{c.email}</a>}
                      {c.phone && <a href={`tel:${c.phone}`} className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: '#F5F1E8', color: '#1F3A2E' }}><Phone className="w-3 h-3" />{c.phone}</a>}
                      {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: '#F5F1E8', color: '#1F3A2E' }}><Linkedin className="w-3 h-3" />LinkedIn</a>}
                    </div>
                  </div>
                )))}
              </div>
            )}
          </div>
        )}
      </main>

      {showAppModal && <ApplicationModal editingApp={editingApp}
        onClose={() => { setShowAppModal(false); setEditingApp(null); }}
        onSave={(app) => { if (editingApp) updateApplication(editingApp.id, app); else addApplication(app); setShowAppModal(false); setEditingApp(null); }} />}

      {cvCustomizeApp && <CVCustomizeModal app={cvCustomizeApp} cv={data.cv}
        onClose={() => setCvCustomizeApp(null)}
        onSave={(customCV) => { updateApplication(cvCustomizeApp.id, { customCV }); setCvCustomizeApp(null); }} />}
    </div>
  );
}

function CVEditor({ cv, onChange }) {
  const update = (path, value) => {
    const newCV = JSON.parse(JSON.stringify(cv));
    const keys = path.split('.');
    let obj = newCV;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    onChange(newCV);
  };
  const addExp = () => onChange({ ...cv, experience: [...(cv.experience || []), { id: 'e' + Date.now(), company: '', position: '', location: '', from: '', to: '', description: '' }] });
  const updateExp = (id, field, value) => onChange({ ...cv, experience: cv.experience.map(e => e.id === id ? { ...e, [field]: value } : e) });
  const delExp = (id) => onChange({ ...cv, experience: cv.experience.filter(e => e.id !== id) });
  const addEdu = () => onChange({ ...cv, education: [...(cv.education || []), { id: 'd' + Date.now(), institution: '', degree: '', location: '', from: '', to: '', description: '' }] });
  const updateEdu = (id, field, value) => onChange({ ...cv, education: cv.education.map(e => e.id === id ? { ...e, [field]: value } : e) });
  const delEdu = (id) => onChange({ ...cv, education: cv.education.filter(e => e.id !== id) });
  const addLang = () => onChange({ ...cv, languages: [...(cv.languages || []), { id: 'l' + Date.now(), name: '', level: '' }] });
  const updateLang = (id, field, value) => onChange({ ...cv, languages: cv.languages.map(l => l.id === id ? { ...l, [field]: value } : l) });
  const delLang = (id) => onChange({ ...cv, languages: cv.languages.filter(l => l.id !== id) });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono-c text-xs uppercase tracking-widest text-stone-500 mb-1">Profil</p>
        <h2 className="font-display text-xl sm:text-2xl font-medium" style={{ color: '#1F3A2E' }}>Lebenslauf</h2>
        <p className="text-sm text-stone-600 mt-1">Diese Daten werden für die Anpassung pro Bewerbung genutzt</p>
      </div>
      <CVSection title="Persönliche Daten" icon={User}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Vollständiger Name" value={cv.personal?.name} onChange={(v) => update('personal.name', v)} />
          <Field label="E-Mail" value={cv.personal?.email} onChange={(v) => update('personal.email', v)} />
          <Field label="Telefon" value={cv.personal?.phone} onChange={(v) => update('personal.phone', v)} />
          <Field label="Wohnort" value={cv.personal?.location} onChange={(v) => update('personal.location', v)} placeholder="z.B. Karlsruhe" />
          <Field label="LinkedIn URL" value={cv.personal?.linkedin} onChange={(v) => update('personal.linkedin', v)} />
          <Field label="XING URL" value={cv.personal?.xing} onChange={(v) => update('personal.xing', v)} />
          <Field label="Geburtsdatum" type="date" value={cv.personal?.dateOfBirth} onChange={(v) => update('personal.dateOfBirth', v)} />
          <Field label="Nationalität" value={cv.personal?.nationality} onChange={(v) => update('personal.nationality', v)} />
        </div>
        <div className="mt-3"><Field label="Arbeitserlaubnis / Status" value={cv.personal?.workPermit} onChange={(v) => update('personal.workPermit', v)} /></div>
      </CVSection>
      <CVSection title="Kurzprofil / Profile Statement">
        <textarea value={cv.summary || ''} onChange={(e) => onChange({ ...cv, summary: e.target.value })} rows={4}
          placeholder="3-4 Sätze: Wer bist du, was sind deine Stärken, was suchst du..."
          className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
      </CVSection>
      <CVSection title="Berufserfahrung" action={<button onClick={addExp} className="text-xs flex items-center gap-1" style={{ color: '#1F3A2E' }}><Plus className="w-3 h-3" />Hinzufügen</button>}>
        {(cv.experience || []).length === 0 && <p className="text-sm text-stone-400 italic">Noch keine Stationen erfasst</p>}
        <div className="space-y-3">
          {(cv.experience || []).map(exp => (
            <div key={exp.id} className="p-3 rounded border relative bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
              <button onClick={() => delExp(exp.id)} className="absolute top-2 right-2 p-1"><X className="w-3 h-3 text-stone-400" /></button>
              <div className="grid sm:grid-cols-2 gap-2 pr-6">
                <Field label="Position" value={exp.position} onChange={(v) => updateExp(exp.id, 'position', v)} />
                <Field label="Unternehmen" value={exp.company} onChange={(v) => updateExp(exp.id, 'company', v)} />
                <Field label="Ort" value={exp.location} onChange={(v) => updateExp(exp.id, 'location', v)} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Von" type="month" value={exp.from} onChange={(v) => updateExp(exp.id, 'from', v)} />
                  <Field label="Bis" type="month" value={exp.to} onChange={(v) => updateExp(exp.id, 'to', v)} />
                </div>
              </div>
              <div className="mt-2">
                <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Aufgaben & Erfolge</label>
                <textarea value={exp.description || ''} onChange={(e) => updateExp(exp.id, 'description', e.target.value)} rows={3}
                  placeholder="Konkrete Aufgaben, Projekte, messbare Ergebnisse..."
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
              </div>
            </div>
          ))}
        </div>
      </CVSection>
      <CVSection title="Ausbildung" action={<button onClick={addEdu} className="text-xs flex items-center gap-1" style={{ color: '#1F3A2E' }}><Plus className="w-3 h-3" />Hinzufügen</button>}>
        {(cv.education || []).length === 0 && <p className="text-sm text-stone-400 italic">Noch keine Ausbildung erfasst</p>}
        <div className="space-y-3">
          {(cv.education || []).map(edu => (
            <div key={edu.id} className="p-3 rounded border relative bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
              <button onClick={() => delEdu(edu.id)} className="absolute top-2 right-2 p-1"><X className="w-3 h-3 text-stone-400" /></button>
              <div className="grid sm:grid-cols-2 gap-2 pr-6">
                <Field label="Abschluss / Studiengang" value={edu.degree} onChange={(v) => updateEdu(edu.id, 'degree', v)} />
                <Field label="Hochschule" value={edu.institution} onChange={(v) => updateEdu(edu.id, 'institution', v)} />
                <Field label="Ort" value={edu.location} onChange={(v) => updateEdu(edu.id, 'location', v)} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Von" type="month" value={edu.from} onChange={(v) => updateEdu(edu.id, 'from', v)} />
                  <Field label="Bis" type="month" value={edu.to} onChange={(v) => updateEdu(edu.id, 'to', v)} />
                </div>
              </div>
              <div className="mt-2">
                <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Schwerpunkte / Note</label>
                <textarea value={edu.description || ''} onChange={(e) => updateEdu(edu.id, 'description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
              </div>
            </div>
          ))}
        </div>
      </CVSection>
      <CVSection title="Fachkenntnisse">
        <div className="space-y-3">
          <div>
            <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Technische Skills (kommagetrennt)</label>
            <textarea value={(cv.skills?.technical || []).join(', ')}
              onChange={(e) => onChange({ ...cv, skills: { ...cv.skills, technical: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
              rows={3} placeholder="z.B. AutoCAD, MATLAB, Python, SAP, SCADA..."
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
          </div>
          <div>
            <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Soft Skills (kommagetrennt)</label>
            <textarea value={(cv.skills?.soft || []).join(', ')}
              onChange={(e) => onChange({ ...cv, skills: { ...cv.skills, soft: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
              rows={2} placeholder="z.B. Projektleitung, interkulturelle Kompetenz..."
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
          </div>
        </div>
      </CVSection>
      <CVSection title="Sprachen" action={<button onClick={addLang} className="text-xs flex items-center gap-1" style={{ color: '#1F3A2E' }}><Plus className="w-3 h-3" />Hinzufügen</button>}>
        {(cv.languages || []).length === 0 && <p className="text-sm text-stone-400 italic">Noch keine Sprachen erfasst</p>}
        <div className="space-y-2">
          {(cv.languages || []).map(lang => (
            <div key={lang.id} className="flex items-center gap-2">
              <input value={lang.name} onChange={(e) => updateLang(lang.id, 'name', e.target.value)} placeholder="Sprache"
                className="flex-1 px-3 py-2 text-sm rounded-lg border outline-none bg-white" style={{ borderColor: '#E5E0D5' }} />
              <select value={lang.level} onChange={(e) => updateLang(lang.id, 'level', e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border outline-none bg-white" style={{ borderColor: '#E5E0D5' }}>
                <option value="">Niveau</option>
                <option>A1</option><option>A2</option><option>B1</option><option>B2</option>
                <option>C1</option><option>C2</option><option>Muttersprache</option>
              </select>
              <button onClick={() => delLang(lang.id)} className="p-2"><X className="w-4 h-4 text-stone-400" /></button>
            </div>
          ))}
        </div>
      </CVSection>
    </div>
  );
}

function CVSection({ title, icon: Icon, action, children }) {
  return (
    <section className="rounded-lg p-5 border bg-white" style={{ borderColor: '#E5E0D5' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg font-medium flex items-center gap-2" style={{ color: '#1F3A2E' }}>
          {Icon && <Icon className="w-4 h-4" />}{title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function CVCustomizeModal({ app, cv, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(app.customCV || '');
  const [copied, setCopied] = useState(false);

  const cvText = formatCVForPrompt(cv);
  const prompt = `Du bist ein Experte für Bewerbungen in Deutschland. Passe den folgenden Lebenslauf gezielt an die untenstehende Stellenausschreibung an.

WICHTIG:
- Antworte auf Deutsch
- Liefere einen vollständigen, formatierten CV-Text (Markdown), der direkt verwendet werden kann
- Hebe die Skills und Erfahrungen hervor, die zur Stelle passen
- Formuliere das Profil-Statement passend zur Position um
- Verändere KEINE Fakten - nur Gewichtung und Formulierung
- Strukturiere klar: Kurzprofil, Berufserfahrung mit relevanten Bullets, Ausbildung, Skills, Sprachen
- Identifiziere am Ende unter "ANPASSUNGSHINWEISE" 3-5 Punkte, die im Anschreiben besonders betont werden sollten

LEBENSLAUF:
${cvText}

STELLENAUSSCHREIBUNG (${app.company} - ${app.position}):
${jobDescription}

Erstelle jetzt den angepassten CV.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openClaude = () => {
    copyPrompt();
    window.open(CLAUDE_AI_URL, '_blank');
  };

  const cvReady = cv?.personal?.name && (cv?.experience?.length > 0 || cv?.summary);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: 'rgba(31, 58, 46, 0.4)' }}>
      <div className="w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-y-auto bg-[#FAF8F3]">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
          <div>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2" style={{ color: '#1F3A2E' }}><Sparkles className="w-5 h-5" /> CV anpassen</h3>
            <p className="text-xs text-stone-600 mt-0.5">{app.company} · {app.position}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100"><X className="w-5 h-5 text-stone-500" /></button>
        </div>

        {!cvReady ? (
          <div className="p-5">
            <div className="p-4 rounded-lg border-2 border-dashed text-sm" style={{ borderColor: '#F59E0B', backgroundColor: '#FEF3C7', color: '#92400E' }}>
              Bitte zuerst den Lebenslauf im CV-Tab ausfüllen, bevor die Anpassung möglich ist.
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              <StepIndicator num={1} label="Stelle" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
              <StepIndicator num={2} label="Prompt" active={step === 2} done={step > 2} onClick={() => jobDescription && setStep(2)} />
              <StepIndicator num={3} label="Ergebnis" active={step === 3} done={false} onClick={() => jobDescription && setStep(3)} />
            </div>

            {step === 1 && (
              <>
                <div>
                  <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Schritt 1: Stellenausschreibung einfügen</label>
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={10}
                    placeholder="Vollständige Stellenanzeige hier einfügen (Aufgaben, Anforderungen, Profil...)"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
                </div>
                <button onClick={() => setStep(2)} disabled={!jobDescription.trim()}
                  className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#1F3A2E', color: '#FAF8F3' }}>
                  Weiter zu Schritt 2 <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="p-4 rounded-lg border" style={{ borderColor: '#E5E0D5', backgroundColor: 'white' }}>
                  <h4 className="font-display text-base font-medium mb-2" style={{ color: '#1F3A2E' }}>Schritt 2: Prompt in Claude einfügen</h4>
                  <ol className="text-sm text-stone-700 space-y-1 list-decimal list-inside mb-4">
                    <li>Klicke auf <b>"Prompt kopieren & Claude öffnen"</b></li>
                    <li>Im neuen Tab: Prompt mit <span className="font-mono-c">Strg+V</span> einfügen und senden</li>
                    <li>Komme zurück und füge das Ergebnis in Schritt 3 ein</li>
                  </ol>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={openClaude}
                      className="flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm"
                      style={{ backgroundColor: '#1F3A2E', color: '#FAF8F3' }}>
                      <ExternalLink className="w-4 h-4" /> Prompt kopieren & Claude öffnen
                    </button>
                    <button onClick={copyPrompt}
                      className="px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm border bg-white"
                      style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>
                      <Copy className="w-4 h-4" /> {copied ? 'Kopiert!' : 'Nur kopieren'}
                    </button>
                  </div>
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer text-stone-600 hover:text-stone-800">Prompt-Vorschau anzeigen</summary>
                  <pre className="mt-2 p-3 rounded text-xs whitespace-pre-wrap overflow-x-auto bg-white border" style={{ borderColor: '#E5E0D5', maxHeight: '250px', overflowY: 'auto' }}>{prompt}</pre>
                </details>

                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>Zurück</button>
                  <button onClick={() => setStep(3)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#1F3A2E', color: '#FAF8F3' }}>
                    Weiter zu Schritt 3
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Schritt 3: Ergebnis von Claude hier einfügen</label>
                  <textarea value={result} onChange={(e) => setResult(e.target.value)} rows={20}
                    placeholder="Antwort von Claude hier einfügen..."
                    className="w-full px-3 py-2 text-xs rounded-lg border outline-none resize-y font-mono-c bg-white" style={{ borderColor: '#E5E0D5' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(2)} className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>Zurück</button>
                  <button onClick={() => onSave(result)} disabled={!result.trim()}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: '#1F3A2E', color: '#FAF8F3' }}>
                    <Save className="w-4 h-4" /> Bei Bewerbung speichern
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ num, label, active, done, onClick }) {
  return (
    <button onClick={onClick} className="flex-1 flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: active ? '#1F3A2E' : (done ? '#D1FAE5' : '#F5F1E8'), color: active ? '#FAF8F3' : (done ? '#059669' : '#78716C') }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: active ? '#FAF8F3' : 'rgba(0,0,0,0.1)', color: active ? '#1F3A2E' : 'inherit' }}>
        {done ? <CheckCircle2 className="w-3 h-3" /> : num}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function formatCVForPrompt(cv) {
  let s = '';
  const p = cv.personal || {};
  s += `Name: ${p.name || ''}\nE-Mail: ${p.email || ''}\nTelefon: ${p.phone || ''}\nWohnort: ${p.location || ''}\nNationalität: ${p.nationality || ''}\nStatus: ${p.workPermit || ''}\n\n`;
  if (cv.summary) s += `KURZPROFIL:\n${cv.summary}\n\n`;
  if (cv.experience?.length) {
    s += `BERUFSERFAHRUNG:\n`;
    cv.experience.forEach(e => { s += `- ${e.position} bei ${e.company}, ${e.location} (${e.from || '?'} - ${e.to || 'heute'})\n  ${e.description || ''}\n`; });
    s += '\n';
  }
  if (cv.education?.length) {
    s += `AUSBILDUNG:\n`;
    cv.education.forEach(e => { s += `- ${e.degree}, ${e.institution}, ${e.location} (${e.from || '?'} - ${e.to || '?'})\n  ${e.description || ''}\n`; });
    s += '\n';
  }
  if (cv.skills?.technical?.length) s += `TECHNISCHE SKILLS: ${cv.skills.technical.join(', ')}\n`;
  if (cv.skills?.soft?.length) s += `SOFT SKILLS: ${cv.skills.soft.join(', ')}\n`;
  if (cv.languages?.length) s += `SPRACHEN: ${cv.languages.map(l => `${l.name} (${l.level})`).join(', ')}\n`;
  return s;
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="p-4 rounded-lg border bg-white" style={{ borderColor: '#E5E0D5' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stone-500 uppercase tracking-wider font-mono-c">{label}</span>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="font-display text-3xl font-semibold" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.recherche;
  return <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function PlatformCard({ platform, onToggle }) {
  return (
    <div className={`p-4 rounded-lg border transition-all bg-white ${platform.isSearched ? 'opacity-60' : ''}`} style={{ borderColor: '#E5E0D5' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display text-base font-medium" style={{ color: '#1F3A2E' }}>{platform.name}</h4>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F5F1E8', color: '#78716C' }}>{platform.category}</span>
          </div>
          {platform.notes && <p className="text-xs text-stone-500 mt-1">{platform.notes}</p>}
          {platform.lastSearched && <p className="font-mono-c text-xs text-stone-400 mt-1">Zuletzt: {platform.lastSearched}</p>}
        </div>
        <button onClick={onToggle} className="flex-shrink-0">
          <div className="w-5 h-5 rounded border-2 flex items-center justify-center" style={{ borderColor: platform.isSearched ? '#059669' : '#D6D3D1', backgroundColor: platform.isSearched ? '#059669' : 'transparent' }}>
            {platform.isSearched && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
        </button>
      </div>
      <a href={platform.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium mt-2" style={{ color: '#1F3A2E' }}>
        Öffnen <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function ApplicationCard({ app, expanded, onToggle, onEdit, onDelete, onStatusChange, onAddContact, onDeleteContact, onCustomizeCV, cvFilled }) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', role: '', email: '', phone: '', linkedin: '', notes: '' });

  const submitContact = () => {
    if (!contactForm.name) return;
    onAddContact(contactForm);
    setContactForm({ name: '', role: '', email: '', phone: '', linkedin: '', notes: '' });
    setShowContactForm(false);
  };

  const daysToDeadline = app.deadline ? Math.ceil((new Date(app.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="rounded-lg border overflow-hidden bg-white" style={{ borderColor: '#E5E0D5' }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display text-lg font-semibold" style={{ color: '#1F3A2E' }}>{app.company}</h3>
              <StatusBadge status={app.status} />
              {app.customCV && <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}><Sparkles className="w-3 h-3" /> CV angepasst</span>}
            </div>
            <p className="text-sm text-stone-700 mb-2">{app.position}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
              {app.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>}
              {app.salary && <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{app.salary}</span>}
              {app.deadline && <span className="flex items-center gap-1" style={{ color: daysToDeadline !== null && daysToDeadline < 7 ? '#DC2626' : undefined }}><Calendar className="w-3 h-3" /> {app.deadline}{daysToDeadline !== null && ` (${daysToDeadline > 0 ? daysToDeadline + 'd' : 'abgelaufen'})`}</span>}
              {app.contacts?.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{app.contacts.length}</span>}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 rounded hover:bg-stone-100"><Edit2 className="w-4 h-4 text-stone-500" /></button>
            <button onClick={onDelete} className="p-2 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <select value={app.status} onChange={(e) => onStatusChange(e.target.value)} className="text-xs px-2 py-1 rounded border outline-none" style={{ borderColor: '#E5E0D5' }}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded border flex items-center gap-1" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>Stelle <ExternalLink className="w-3 h-3" /></a>}
          <button onClick={onCustomizeCV} disabled={!cvFilled}
            className="text-xs px-2 py-1 rounded flex items-center gap-1 disabled:opacity-40"
            style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }} title={!cvFilled ? 'Erst CV ausfüllen' : ''}>
            <Sparkles className="w-3 h-3" /> CV anpassen
          </button>
          <button onClick={onToggle} className="text-xs px-2 py-1 rounded flex items-center gap-1 ml-auto" style={{ color: '#1F3A2E' }}>
            {expanded ? 'Weniger' : 'Mehr'} <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: '#F5F1E8' }}>
          {app.notes && (
            <div className="pt-3">
              <h5 className="font-mono-c text-xs uppercase tracking-wider text-stone-500 mb-1">Notizen</h5>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{app.notes}</p>
            </div>
          )}
          {app.customCV && (
            <div className="pt-3">
              <h5 className="font-mono-c text-xs uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Angepasster CV</h5>
              <details className="text-xs">
                <summary className="cursor-pointer text-stone-600">Anzeigen</summary>
                <pre className="mt-2 p-3 rounded whitespace-pre-wrap text-xs overflow-x-auto bg-[#FAF8F3]">{app.customCV}</pre>
              </details>
            </div>
          )}

          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-mono-c text-xs uppercase tracking-wider text-stone-500">Ansprechpartner ({app.contacts?.length || 0})</h5>
              <button onClick={() => setShowContactForm(!showContactForm)} className="text-xs flex items-center gap-1" style={{ color: '#1F3A2E' }}><Plus className="w-3 h-3" /> Hinzufügen</button>
            </div>

            {(app.contacts || []).map(c => (
              <div key={c.id} className="p-3 rounded mb-2 border flex items-start justify-between gap-2 bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-stone-500">{c.role}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.email && <a href={`mailto:${c.email}`} className="text-xs flex items-center gap-1" style={{ color: '#1F3A2E' }}><Mail className="w-3 h-3" />{c.email}</a>}
                    {c.phone && <a href={`tel:${c.phone}`} className="text-xs flex items-center gap-1" style={{ color: '#1F3A2E' }}><Phone className="w-3 h-3" />{c.phone}</a>}
                    {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: '#1F3A2E' }}><Linkedin className="w-3 h-3" />LinkedIn</a>}
                  </div>
                  {c.notes && <p className="text-xs text-stone-600 mt-2">{c.notes}</p>}
                </div>
                <button onClick={() => onDeleteContact(c.id)} className="p-1"><X className="w-3 h-3 text-stone-400" /></button>
              </div>
            ))}

            {showContactForm && (
              <div className="p-3 rounded border mt-2 bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input placeholder="Name *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="px-2 py-1.5 text-sm rounded border outline-none bg-white" style={{ borderColor: '#E5E0D5' }} />
                  <input placeholder="Rolle (HR, Hiring Manager, ...)" value={contactForm.role} onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })} className="px-2 py-1.5 text-sm rounded border outline-none bg-white" style={{ borderColor: '#E5E0D5' }} />
                  <input placeholder="E-Mail" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="px-2 py-1.5 text-sm rounded border outline-none bg-white" style={{ borderColor: '#E5E0D5' }} />
                  <input placeholder="Telefon" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="px-2 py-1.5 text-sm rounded border outline-none bg-white" style={{ borderColor: '#E5E0D5' }} />
                  <input placeholder="LinkedIn URL" value={contactForm.linkedin} onChange={(e) => setContactForm({ ...contactForm, linkedin: e.target.value })} className="sm:col-span-2 px-2 py-1.5 text-sm rounded border outline-none bg-white" style={{ borderColor: '#E5E0D5' }} />
                  <textarea placeholder="Notizen" value={contactForm.notes} onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })} rows={2} className="sm:col-span-2 px-2 py-1.5 text-sm rounded border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={submitContact} className="text-xs px-3 py-1.5 rounded" style={{ backgroundColor: '#1F3A2E', color: '#FAF8F3' }}>Speichern</button>
                  <button onClick={() => setShowContactForm(false)} className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: '#E5E0D5' }}>Abbrechen</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationModal({ editingApp, onClose, onSave }) {
  const [form, setForm] = useState(editingApp || { company: '', position: '', location: '', jobUrl: '', salary: '', deadline: '', appliedDate: '', source: '', status: 'recherche', notes: '' });

  const submit = () => {
    if (!form.company || !form.position) { alert('Unternehmen und Position sind Pflicht'); return; }
    onSave({ ...form, lastUpdate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: 'rgba(31, 58, 46, 0.4)' }}>
      <div className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto bg-[#FAF8F3]">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
          <h3 className="font-display text-xl font-semibold" style={{ color: '#1F3A2E' }}>{editingApp ? 'Bewerbung bearbeiten' : 'Neue Bewerbung'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100"><X className="w-5 h-5 text-stone-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Unternehmen *" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="z.B. EnBW AG" />
            <Field label="Position *" value={form.position} onChange={(v) => setForm({ ...form, position: v })} placeholder="z.B. Projektingenieur" />
            <Field label="Standort" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="z.B. Karlsruhe" />
            <Field label="Gehalt" value={form.salary} onChange={(v) => setForm({ ...form, salary: v })} placeholder="z.B. 65k €" />
            <Field label="Beworben am" type="date" value={form.appliedDate} onChange={(v) => setForm({ ...form, appliedDate: v })} />
            <Field label="Frist" type="date" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} />
            <Field label="Quelle" value={form.source} onChange={(v) => setForm({ ...form, source: v })} placeholder="z.B. StepStone" />
            <div>
              <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white" style={{ borderColor: '#E5E0D5' }}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <Field label="Stellen-URL" value={form.jobUrl} onChange={(v) => setForm({ ...form, jobUrl: v })} placeholder="https://..." />
          <div>
            <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">Notizen</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Anforderungsprofil, Eindruck..." className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none bg-white" style={{ borderColor: '#E5E0D5' }} />
          </div>
        </div>
        <div className="sticky bottom-0 flex gap-2 p-5 border-t bg-[#FAF8F3]" style={{ borderColor: '#E5E0D5' }}>
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: '#E5E0D5', color: '#1F3A2E' }}>Abbrechen</button>
          <button onClick={submit} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: '#1F3A2E', color: '#FAF8F3' }}><Save className="w-4 h-4" /> Speichern</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="font-mono-c text-xs uppercase tracking-wider text-stone-600 block mb-1">{label}</label>
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-sm rounded-lg border outline-none bg-white" style={{ borderColor: '#E5E0D5' }} />
    </div>
  );
}

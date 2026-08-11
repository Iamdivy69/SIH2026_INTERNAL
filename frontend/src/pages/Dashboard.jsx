import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MasteryBar({ concept, mastery }) {
  const color =
    mastery >= 70 ? 'bg-[#22c55e] dark:bg-[#4ade80]' :
    mastery >= 40 ? 'bg-[#eab308] dark:bg-[#facc15]' :
    'bg-[#ef4444] dark:bg-[#f87171]';

  const textColor =
    mastery >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' :
    mastery >= 40 ? 'text-[#a16207] dark:text-[#facc15]' :
    'text-[#dc2626] dark:text-[#f87171]';

  const label =
    mastery >= 70 ? 'Strong' :
    mastery >= 40 ? 'Developing' :
    'Needs Attention';

  const chipBg =
    mastery >= 70 ? 'bg-[#e6f7ee] dark:bg-[#0a2e1a]' :
    mastery >= 40 ? 'bg-[#fef9e7] dark:bg-[#2e2408]' :
    'bg-[#fdeaea] dark:bg-[#2e0f0f]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-black dark:text-[#F3F4F6]">{concept}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 ${chipBg} ${textColor} font-medium`}>{label}</span>
          <span className={`font-bold tabular-nums ${textColor}`}>{mastery}%</span>
        </div>
      </div>
      <div className="mastery-bar-track">
        <div className={`h-full transition-all duration-700 ${color}`}
          style={{ width: `${mastery}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">{label}</p>
      <p className="text-[32px] font-bold tabular-nums text-[#004CE5]">{value}</p>
      {sub && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{sub}</p>}
    </div>
  );
}

const QuickLinkIcon = ({ type }) => {
  if (type === 'assessment') return (
    <svg className="w-6 h-6 text-[#004CE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (type === 'learning') return (
    <svg className="w-6 h-6 text-[#004CE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
  return (
    <svg className="w-6 h-6 text-[#004CE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
};

export default function Dashboard() {
  const { user, authHeader, API } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(`${API}/api/student/state`, { headers: authHeader() });
        const json = await res.json();
        if (!res.ok) { setError(json.message || 'Failed to load data.'); return; }
        setData(json);
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24 bg-white dark:bg-[#070B15]">
      <div className="w-8 h-8 border-2 border-[#004CE5] border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="card text-center py-12 space-y-3">
      <p className="text-[#dc2626] dark:text-[#f87171] font-medium">{error}</p>
      <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Make sure the backend is running and you have a valid MONGO_URI in .env</p>
    </div>
  );

  const { concepts, overallMastery, strong, weak } = data;
  const weakConcepts = weak.map(c => c.concept);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="dark:text-[#F3F4F6]">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-1 text-base text-[#64748B] dark:text-[#94A3B8]">
          Here&apos;s your adaptive learning snapshot
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Overall Mastery" value={`${overallMastery}%`} sub="across all concepts" />
        <StatCard label="Strong Areas"    value={strong.length}        sub="concepts >= 70%" />
        <StatCard label="Weak Areas"      value={weak.length}          sub="concepts < 40%" />
        <StatCard label="Total Concepts"  value={concepts.length}      sub="being tracked" />
      </div>

      {weakConcepts.length > 0 && (
        <div className="card border-l-4 border-l-[#ef4444] flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black dark:text-[#F3F4F6]">
              Weak areas flagged:{' '}
              <span className="text-[#dc2626] dark:text-[#f87171] font-semibold">{weakConcepts.join(', ')}</span>
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Start an adaptive assessment to improve these concepts
            </p>
          </div>
          <Link to="/assessment" className="btn-primary text-xs shrink-0">
            Start Assessment
          </Link>
        </div>
      )}

      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-[#F3F4F6]">Knowledge Profile</h2>
          <Link to="/knowledge" className="text-xs font-medium text-[#011A53] dark:text-[#8BB8FF] hover:underline">
            View full profile &rarr;
          </Link>
        </div>
        <div className="space-y-4">
          {concepts.map(c => (
            <MasteryBar key={c.concept} concept={c.concept} mastery={c.mastery} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/assessment',    label: 'Take Assessment',  sub: 'Adaptive 7-question test',   type: 'assessment' },
          { to: '/learning-path', label: 'Learning Path',    sub: 'Your personalized roadmap',  type: 'learning' },
          { to: '/ai-tutor',      label: 'Ask AI Tutor',     sub: 'Get grounded explanations',  type: 'tutor' },
        ].map(({ to, label, sub, type }) => (
          <Link key={to} to={to} className="card hover:border-[#004CE5] dark:hover:border-[#004CE5] transition-colors duration-200 block">
            <div className="mb-3">
              <QuickLinkIcon type={type} />
            </div>
            <p className="font-semibold text-sm text-black dark:text-[#F3F4F6]">{label}</p>
            <p className="text-xs mt-0.5 text-[#64748B] dark:text-[#94A3B8]">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

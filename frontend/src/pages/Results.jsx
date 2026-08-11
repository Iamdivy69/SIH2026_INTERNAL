import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function buildInsight(concepts, weak, strong) {
  if (!concepts.length) return '';

  const sorted = [...concepts].sort((a, b) => a.mastery - b.mastery);
  const weakest = sorted[0];

  if (weak.length >= 3) {
    return `${weak.map(c => `${c.concept} (${c.mastery}%)`).join(', ')} need focused practice — start another assessment to build momentum.`;
  }
  if (weak.length > 0) {
    return `Your weakest area is ${weakest.concept} at ${weakest.mastery}% — one focused session should move it past 40%.`;
  }
  if (strong.length === concepts.length) {
    return `Strong across all concepts. Keep pushing difficulty — try a hard-mode session on ${weakest.concept}.`;
  }
  return `Good progress overall. ${weakest.concept} (${weakest.mastery}%) is your priority — target it next.`;
}

function MasteryDisplay({ value }) {
  const color =
    value >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' :
    value >= 40 ? 'text-[#a16207] dark:text-[#facc15]' :
    'text-[#dc2626] dark:text-[#f87171]';

  return (
    <div className="text-center">
      <p className={`text-[64px] font-extrabold leading-none tabular-nums ${color}`}>{value}</p>
      <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">% mastery</p>
    </div>
  );
}

function BucketCard({ label, count, concepts }) {
  const configs = {
    'Strong': {
      borderClass: 'border-t-[#15803d] dark:border-t-[#4ade80]',
      textClass: 'text-[#15803d] dark:text-[#4ade80]',
      chipBgClass: 'bg-[#e6f7ee] dark:bg-[#0a2e1a] text-[#15803d] dark:text-[#4ade80]',
    },
    'Developing': {
      borderClass: 'border-t-[#a16207] dark:border-t-[#facc15]',
      textClass: 'text-[#a16207] dark:text-[#facc15]',
      chipBgClass: 'bg-[#fef9e7] dark:bg-[#2e2408] text-[#a16207] dark:text-[#facc15]',
    },
    'Needs Attention': {
      borderClass: 'border-t-[#dc2626] dark:border-t-[#f87171]',
      textClass: 'text-[#dc2626] dark:text-[#f87171]',
      chipBgClass: 'bg-[#fdeaea] dark:bg-[#2e0f0f] text-[#dc2626] dark:text-[#f87171]',
    },
  };

  const config = configs[label] || configs['Strong'];

  return (
    <div className={`card flex-1 space-y-3 border-t-3 ${config.borderClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-black dark:text-[#F3F4F6]">{label}</span>
        <span className={`text-2xl font-bold tabular-nums ${config.textClass}`}>{count}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {concepts.map(c => (
          <span key={c.concept} className={`text-xs px-2 py-0.5 font-medium ${config.chipBgClass}`}>
            {c.concept} {c.mastery}%
          </span>
        ))}
        {concepts.length === 0 && (
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">None yet</span>
        )}
      </div>
    </div>
  );
}

export default function Results() {
  const { authHeader, API } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/api/student/state`, { headers: authHeader() });
        const json = await res.json();
        if (!res.ok) { setError(json.message || 'Failed to load results.'); return; }
        setData(json);
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[#004CE5] border-t-transparent animate-spin" />
    </div>
  );
  if (error) return <div className="card text-center py-12 text-[#dc2626]">{error}</div>;

  const { concepts, overallMastery, strong, developing, weak } = data;
  const insight = buildInsight(concepts, weak, strong);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1>Assessment Complete</h1>
        <p className="text-base text-[#64748B] dark:text-[#94A3B8]">Here&apos;s how your knowledge profile updated</p>
      </div>

      <div className="card flex flex-col items-center gap-4 py-8">
        <MasteryDisplay value={overallMastery} />
        <p className="text-center text-sm font-medium max-w-md italic text-[#64748B] dark:text-[#94A3B8]">
          {insight}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <BucketCard
          label="Strong"
          count={strong.length}
          concepts={strong}
        />
        <BucketCard
          label="Developing"
          count={developing.length}
          concepts={developing}
        />
        <BucketCard
          label="Needs Attention"
          count={weak.length}
          concepts={weak}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/knowledge" className="btn-primary flex-1 text-center">
          View Knowledge Profile
        </Link>
        <Link to="/assessment" className="btn-secondary flex-1 text-center">
          Take Another Assessment
        </Link>
      </div>

      <p className="text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
        <Link to="/dashboard" className="text-[#011A53] dark:text-[#8BB8FF] hover:underline font-medium">
          &larr; Back to Dashboard
        </Link>
      </p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sparkline({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 bg-[#F8FAFF] dark:bg-[#0D1325] text-xs italic text-[#64748B] dark:text-[#94A3B8]">
        No assessment history yet — complete an assessment to view your progress trend
      </div>
    );
  }

  const width = 260;
  const height = 50;
  const padding = 6;

  const points = data.map((d, index) => {
    const x = padding + (index / (Math.max(1, data.length - 1))) * (width - 2 * padding);
    const y = height - padding - (d.mastery / 100) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = data[data.length - 1].mastery >= 70 ? '#22c55e' : data[data.length - 1].mastery >= 40 ? '#eab308' : '#ef4444';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
        <span>Mastery History ({data.length} entries)</span>
        <span>Latest: {data[data.length - 1].mastery}%</span>
      </div>
      <svg width={width} height={height} className="w-full overflow-visible">
        <line x1="0" y1="12" x2={width} y2="12" stroke="#E6F0FF" strokeDasharray="3 3" strokeWidth="1" />
        <line x1="0" y1="38" x2={width} y2="38" stroke="#E6F0FF" strokeDasharray="3 3" strokeWidth="1" />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.length > 0 && (() => {
          const lastIndex = data.length - 1;
          const lx = padding + (lastIndex / (Math.max(1, data.length - 1))) * (width - 2 * padding);
          const ly = height - padding - (data[lastIndex].mastery / 100) * (height - 2 * padding);
          return <circle cx={lx} cy={ly} r="4" fill={strokeColor} className="animate-pulse" />;
        })()}
      </svg>
    </div>
  );
}

function ConceptCard({ conceptData, isExpanded, onToggle }) {
  const { concept, mastery, history, accuracy, attemptCount, averageResponseTime, recentAttempts, trend } = conceptData;

  const textColorClass = mastery >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' : mastery >= 40 ? 'text-[#a16207] dark:text-[#facc15]' : 'text-[#dc2626] dark:text-[#f87171]';
  const label = mastery >= 70 ? 'Strong' : mastery >= 40 ? 'Developing' : 'Needs Attention';
  const chipBg = mastery >= 70 ? 'bg-[#e6f7ee] dark:bg-[#0a2e1a]' : mastery >= 40 ? 'bg-[#fef9e7] dark:bg-[#2e2408]' : 'bg-[#fdeaea] dark:bg-[#2e0f0f]';
  const barColor = mastery >= 70 ? 'bg-[#22c55e]' : mastery >= 40 ? 'bg-[#eab308]' : 'bg-[#ef4444]';

  const trendBadge =
    trend === 'improving' ? { text: 'Improving', textColor: 'text-[#15803d] dark:text-[#4ade80]', bg: 'bg-[#e6f7ee] dark:bg-[#0a2e1a]' } :
    trend === 'declining' ? { text: 'Declining', textColor: 'text-[#dc2626] dark:text-[#f87171]', bg: 'bg-[#fdeaea] dark:bg-[#2e0f0f]' } :
    { text: 'Stable', textColor: 'text-[#64748B] dark:text-[#94A3B8]', bg: 'bg-[#F8FAFF] dark:bg-[#0D1325]' };

  let insightText = '';
  if (attemptCount === 0) {
    insightText = `No questions attempted yet for ${concept}. Take an assessment session to establish a baseline.`;
  } else if (trend === 'improving') {
    insightText = `You've shown steady improvement on ${concept} across recent sessions (${accuracy}% accuracy). Keep practicing to push past ${mastery}%.`;
  } else if (trend === 'declining') {
    insightText = `Your recent score accuracy on ${concept} has dropped. Review core principles and focus on error explanations.`;
  } else if (averageResponseTime > 30) {
    insightText = `You're answering ${concept} questions correctly (${accuracy}%), but taking longer than average (${averageResponseTime}s). Practice will build speed.`;
  } else {
    insightText = `Performance on ${concept} is consistent at ${mastery}% mastery across ${attemptCount} attempts (${averageResponseTime}s avg response time).`;
  }

  return (
    <div className={`card space-y-4 transition-all duration-200 ${isExpanded ? 'border-[#004CE5] dark:border-[#004CE5]' : ''}`}>
      <div onClick={onToggle} className="flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-3">
          <span className="font-bold text-base text-black dark:text-[#F3F4F6]">{concept}</span>
          <span className={`text-xs px-2 py-0.5 font-medium ${chipBg} ${textColorClass}`}>
            {label}
          </span>
          <span className={`text-xs px-2 py-0.5 font-medium hidden sm:inline-block ${trendBadge.bg} ${trendBadge.textColor}`}>
            {trendBadge.text}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`font-bold text-lg tabular-nums ${textColorClass}`}>{mastery}%</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block uppercase font-medium">Mastery</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      <div className="mastery-bar-track">
        <div className={`h-full transition-all duration-700 ${barColor}`}
          style={{ width: `${mastery}%` }} />
      </div>

      {isExpanded && (
        <div className="pt-4 border-t border-[#E6F0FF] dark:border-t-[#1C2A4A] space-y-5">
          <Sparkline data={history} />

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 bg-[#F8FAFF] dark:bg-[#0D1325]">
              <span className="font-bold text-base block text-black dark:text-[#F3F4F6]">{accuracy}%</span>
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">Accuracy</span>
            </div>
            <div className="p-2.5 bg-[#F8FAFF] dark:bg-[#0D1325]">
              <span className="font-bold text-base block text-black dark:text-[#F3F4F6]">{attemptCount}</span>
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">Attempts</span>
            </div>
            <div className="p-2.5 bg-[#F8FAFF] dark:bg-[#0D1325]">
              <span className="font-bold text-base block text-black dark:text-[#F3F4F6]">{averageResponseTime}s</span>
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">Avg Time</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Recent Form (Last 5):</span>
            <div className="flex items-center gap-1.5">
              {recentAttempts && recentAttempts.length > 0 ? (
                recentAttempts.map((isOk, idx) => (
                  <span key={idx}
                    className={`w-6 h-6 flex items-center justify-center font-bold text-[10px] ${
                      isOk ? 'bg-[#e6f7ee] dark:bg-[#0a2e1a] text-[#15803d] dark:text-[#4ade80]' : 'bg-[#fdeaea] dark:bg-[#2e0f0f] text-[#dc2626] dark:text-[#f87171]'
                    }`}>
                    {isOk ? '\u2713' : '\u2717'}
                  </span>
                ))
              ) : (
                <span className="text-[#64748B] dark:text-[#94A3B8] italic text-[11px]">No attempts</span>
              )}
            </div>
          </div>

          <div className="p-3 border-l-4 border-l-[#011A53] bg-[#F8FAFF] dark:bg-[#0D1325] text-xs text-black dark:text-[#F3F4F6] leading-relaxed italic">
            {insightText}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Knowledge() {
  const { authHeader, API } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expandedConcept, setExpandedConcept] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/api/student/state`, { headers: authHeader() });
        const json = await res.json();
        if (!res.ok) { setError(json.message || 'Failed to load profile.'); return; }
        setData(json);
        const weak = json.concepts.find(c => c.mastery < 40);
        if (weak) setExpandedConcept(weak.concept);
        else if (json.concepts.length > 0) setExpandedConcept(json.concepts[0].concept);
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

  const mostImproved = [...concepts]
    .filter(c => c.history && c.history.length > 0)
    .sort((a, b) => {
      const aDelta = a.history[a.history.length - 1]?.delta || 0;
      const bDelta = b.history[b.history.length - 1]?.delta || 0;
      return bDelta - aDelta;
    })[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1>Knowledge Profile</h1>
          <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">
            Detailed breakdown, trends, and accuracy metrics per concept
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums"
            style={{
              color: overallMastery >= 70 ? '#15803d' : overallMastery >= 40 ? '#a16207' : '#dc2626',
            }}>
            {overallMastery}%
          </p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Overall Mastery</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <span className="chip chip-green">
          {strong.length} Strong
        </span>
        <span className="chip chip-yellow">
          {developing.length} Developing
        </span>
        <span className="chip chip-red">
          {weak.length} Needs Attention
        </span>
        {mostImproved && (
          <span className="chip chip-blue">
            Most Improved: {mostImproved.concept}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Concept Analysis & Trends</h2>
        {concepts.map(c => (
          <ConceptCard
            key={c.concept}
            conceptData={c}
            isExpanded={expandedConcept === c.concept}
            onToggle={() => setExpandedConcept(expandedConcept === c.concept ? null : c.concept)}
          />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Link to="/assessment" className="btn-primary flex-1 text-center">
          Take Assessment
        </Link>
        <Link to="/learning-path" className="btn-secondary flex-1 text-center">
          View Learning Roadmap
        </Link>
      </div>
    </div>
  );
}

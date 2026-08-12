import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MasteryDisplay({ value }) {
  const color =
    value >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' :
    value >= 40 ? 'text-[#a16207] dark:text-[#facc15]' :
    'text-[#dc2626] dark:text-[#f87171]';

  return (
    <div className="text-center">
      <p className={`text-5xl font-extrabold leading-none tabular-nums ${color}`}>{value}%</p>
      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Overall Institution Mastery</p>
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
    <div className={`card flex-1 space-y-3 border-t-4 ${config.borderClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-black dark:text-[#F3F4F6]">{label}</span>
        <span className={`text-xl font-extrabold tabular-nums ${config.textClass}`}>{count}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {concepts.map(c => (
          <span key={c.concept} className={`text-xs px-2 py-0.5 font-bold rounded ${config.chipBgClass}`}>
            {c.concept} {c.mastery}%
          </span>
        ))}
        {concepts.length === 0 && (
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">None</span>
        )}
      </div>
    </div>
  );
}

export default function Results() {
  const { authHeader, API } = useAuth();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const mode = location.state?.mode || 'adaptive';

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const url = sessionId
          ? `${API}/api/assessment/summary?sessionId=${encodeURIComponent(sessionId)}`
          : `${API}/api/assessment/summary`;
        const res = await fetch(url, { headers: authHeader() });
        const json = await res.json();
        if (!res.ok) { setError(json.message || 'Failed to load assessment summary.'); return; }
        setData(json);
      } catch {
        setError('Cannot connect to backend server.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [API, authHeader, sessionId]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[#004CE5] border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto my-12 card text-center space-y-4">
      <p className="text-sm text-[#dc2626] font-bold">{error}</p>
      <Link to="/dashboard" className="btn-primary inline-block text-xs py-2 px-4">Return to Dashboard</Link>
    </div>
  );

  const { totalAnswered, correctCount, accuracyPct, questionBreakdown = [], studentState = {} } = data || {};
  const { overallMastery = 0, strong = [], developing = [], weak = [] } = studentState;

  const modeLabel =
    mode === 'diagnostic' ? 'Diagnostic Assessment' :
    mode === 'targeted' ? 'Targeted Practice' :
    'Adaptive Proctored Assessment';

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="chip chip-blue font-bold text-xs">{modeLabel}</span>
        <h1 className="text-2xl font-extrabold text-black dark:text-[#F3F4F6]">Assessment Performance Summary</h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Review your answers, correctness breakdown, and updated mastery ratings below
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex flex-col items-center justify-center py-6 text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Score Accuracy</span>
          <span className="text-4xl font-extrabold tabular-nums text-[#004CE5] dark:text-[#38bdf8]">
            {correctCount} / {totalAnswered}
          </span>
          <span className="text-xs font-bold text-[#15803d] dark:text-[#4ade80]">{accuracyPct}% Correct</span>
        </div>

        <div className="card flex flex-col items-center justify-center py-6 text-center space-y-1">
          <MasteryDisplay value={overallMastery} />
        </div>

        <div className="card flex flex-col items-center justify-center py-6 text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Proctoring Status</span>
          <span className="text-2xl font-extrabold text-[#15803d] dark:text-[#4ade80]">
            Passed ✓
          </span>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Session Validated</span>
        </div>
      </div>

      {/* Detailed Question Answers Breakdown */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between border-b border-[#E6F0FF] dark:border-[#1C2A4A] pb-3">
          <h2 className="text-base font-extrabold text-black dark:text-[#F3F4F6]">
            Detailed Question Breakdown ({questionBreakdown.length} Item{questionBreakdown.length !== 1 ? 's' : ''})
          </h2>
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            {correctCount} Correct • {totalAnswered - correctCount} Incorrect
          </span>
        </div>

        <div className="space-y-6">
          {questionBreakdown.map((item, idx) => {
            const isCorrect = item.isCorrect;
            const diffLabel = item.difficulty === 1 ? 'Easy' : item.difficulty === 2 ? 'Medium' : 'Hard';

            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border space-y-4 ${
                  isCorrect
                    ? 'border-[#22c55e]/30 bg-[#f4fcf7] dark:bg-[#071f12]'
                    : 'border-[#ef4444]/30 bg-[#fff5f5] dark:bg-[#250a0a]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6F0FF] dark:border-[#1C2A4A] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-black dark:text-[#F3F4F6]">
                      Question {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded ${
                        isCorrect
                          ? 'bg-[#e6f7ee] dark:bg-[#0a2e1a] text-[#15803d] dark:text-[#4ade80]'
                          : 'bg-[#fdeaea] dark:bg-[#2e0f0f] text-[#dc2626] dark:text-[#f87171]'
                      }`}
                    >
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    <span className="chip chip-blue">{item.concept}</span>
                    <span>D{item.difficulty} ({diffLabel})</span>
                  </div>
                </div>

                <p className="text-sm font-bold text-black dark:text-[#F3F4F6]">{item.text}</p>

                {item.options && item.options.length > 0 && (
                  <div className="space-y-1.5">
                    {item.options.map((opt, optIdx) => {
                      const isUserSelected = optIdx === item.selectedAnswer;
                      const isRightAnswer  = optIdx === item.correctAnswer;

                      let optBorderClass = 'border-[#E6F0FF] dark:border-[#1C2A4A]';
                      let optBgClass = 'bg-white dark:bg-[#070B15]';
                      let optTextClass = 'text-black dark:text-[#F3F4F6]';

                      if (isRightAnswer) {
                        optBorderClass = 'border-[#22c55e]';
                        optBgClass = 'bg-[#e6f7ee] dark:bg-[#0a2e1a]';
                        optTextClass = 'text-[#15803d] dark:text-[#4ade80] font-bold';
                      } else if (isUserSelected && !isCorrect) {
                        optBorderClass = 'border-[#ef4444]';
                        optBgClass = 'bg-[#fdeaea] dark:bg-[#2e0f0f]';
                        optTextClass = 'text-[#dc2626] dark:text-[#f87171] font-bold';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border ${optBorderClass} ${optBgClass} ${optTextClass} flex items-center justify-between`}
                        >
                          <div>
                            <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][optIdx]}.</span>
                            {opt}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {isUserSelected && <span className="italic font-medium">(Your Answer)</span>}
                            {isRightAnswer && <span className="font-bold">✓ Correct Option</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {item.explanation && (
                  <div className="text-xs p-3.5 rounded-lg bg-white dark:bg-[#070B15] border border-[#E6F0FF] dark:border-[#1C2A4A] text-black dark:text-[#F3F4F6]">
                    <span className="font-bold text-[#004CE5] dark:text-[#38bdf8]">AI Explanation: </span>
                    {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Updated Knowledge Profile Buckets */}
      <div className="card space-y-4">
        <h2 className="text-base font-extrabold text-black dark:text-[#F3F4F6]">Updated Knowledge State</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <BucketCard label="Strong" count={strong.length} concepts={strong} />
          <BucketCard label="Developing" count={developing.length} concepts={developing} />
          <BucketCard label="Needs Attention" count={weak.length} concepts={weak} />
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link to="/dashboard" className="btn-primary flex-1 text-center py-3.5 text-sm font-bold">
          Return to Dashboard &rarr;
        </Link>
        <Link to="/knowledge" className="btn-secondary flex-1 text-center py-3.5 text-sm font-bold">
          View Knowledge Profile
        </Link>
        <Link to="/assessment" className="btn-secondary flex-1 text-center py-3.5 text-sm font-bold">
          Take Another Assessment
        </Link>
      </div>
    </div>
  );
}

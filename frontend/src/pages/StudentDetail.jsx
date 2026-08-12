import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ConceptAccordion({ concept }) {
  const [open, setOpen] = useState(false);
  const m = concept.mastery;
  const color = m >= 70 ? 'bg-[#22c55e]' : m >= 40 ? 'bg-[#eab308]' : 'bg-[#ef4444]';
  const textColor = m >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' : m >= 40 ? 'text-[#a16207] dark:text-[#facc15]' : 'text-[#dc2626] dark:text-[#f87171]';

  return (
    <div className="border border-[#E6F0FF] dark:border-[#1C2A4A] rounded-xl overflow-hidden bg-white dark:bg-[#0D1325]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-[#F8FAFF] dark:hover:bg-[#151D33] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-base text-black dark:text-[#F3F4F6]">{concept.concept}</span>
          <span className={`text-xs font-bold tabular-nums ${textColor}`}>
            {m}% Mastery
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {concept.attemptCount} attempts • {concept.accuracy}% acc
          </span>
          <span className="text-sm font-bold">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="p-4 border-t border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FAFF] dark:bg-[#070B15] space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Attempts</span>
              <p className="font-bold text-sm text-black dark:text-[#F3F4F6]">{concept.attemptCount}</p>
            </div>
            <div>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Accuracy</span>
              <p className="font-bold text-sm text-black dark:text-[#F3F4F6]">{concept.accuracy}%</p>
            </div>
            <div>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Avg Time</span>
              <p className="font-bold text-sm text-black dark:text-[#F3F4F6]">{concept.averageResponseTime}s</p>
            </div>
            <div>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Recent Results</span>
              <div className="flex gap-1 mt-1">
                {concept.recentAttempts.map((corr, idx) => (
                  <span key={idx} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[9px] ${corr ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'}`}>
                    {corr ? '✓' : '✕'}
                  </span>
                ))}
                {concept.recentAttempts.length === 0 && <span className="text-[#64748B]">None</span>}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="h-2 w-full bg-[#E6F0FF] dark:bg-[#1C2A4A] rounded-full overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${m}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader, API } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/students/${id}`, { headers: authHeader() });
        const resData = await res.json();
        if (!res.ok) { setError(resData.message || 'Student not found.'); return; }
        setData(resData);
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API]);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 justify-center">
        <div className="w-6 h-6 border-2 border-[#004CE5] border-t-transparent animate-spin" />
        <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Loading student details...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/admin/students')} className="text-sm text-[#004CE5] font-bold hover:underline">
          ← Back to Student Roster
        </button>
        <div className="card text-center py-12">
          <p className="text-[#dc2626] font-bold">{error || 'Student not found.'}</p>
        </div>
      </div>
    );
  }

  const { profile, concepts, assessmentHistory, violationLog } = data;
  const overallMastery = concepts.length > 0
    ? Math.round(concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/students')} className="text-sm text-[#004CE5] font-bold hover:underline">
          ← Back to Student Roster
        </button>
        <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Last Active: {formatDate(profile.lastActiveAt)}
        </span>
      </div>

      {/* Profile Identity Card */}
      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#E6F0FF] dark:border-[#1C2A4A]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-black dark:text-[#F3F4F6]">{profile.name}</h1>
            {profile.hasCompletedDiagnostic ? (
              <span className="chip chip-green text-xs">Diagnostic Completed</span>
            ) : (
              <span className="chip chip-yellow text-xs">Pending Diagnostic</span>
            )}
          </div>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{profile.email}</p>
        </div>

        <div className="flex items-center gap-4 bg-[#F8FAFF] dark:bg-[#0D1325] px-5 py-3 rounded-2xl border border-[#E6F0FF] dark:border-[#1C2A4A]">
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Overall Mastery</span>
            <div className="text-2xl font-extrabold text-black dark:text-[#F3F4F6]">{overallMastery}%</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#004CE5] flex items-center justify-center font-bold text-xs">
            {overallMastery}%
          </div>
        </div>
      </div>

      {/* Concept Breakdown Accordions */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-black dark:text-[#F3F4F6]">Knowledge Profile Breakdown</h2>
        <div className="space-y-3">
          {concepts.map((c) => (
            <ConceptAccordion key={c.concept} concept={c} />
          ))}
        </div>
      </section>

      {/* Assessment History */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-black dark:text-[#F3F4F6]">Assessment Session History</h2>
        {assessmentHistory.length === 0 ? (
          <div className="card text-center py-8 text-sm text-[#64748B] dark:text-[#94A3B8]">
            No assessment sessions recorded for this student yet.
          </div>
        ) : (
          <div className="card p-0 overflow-hidden border border-[#E6F0FF] dark:border-[#1C2A4A]">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FAFF] dark:bg-[#0D1325] text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  <th className="p-3">Session ID</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Concept</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Violations</th>
                  <th className="p-3">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6F0FF] dark:divide-[#1C2A4A]">
                {assessmentHistory.map((s) => (
                  <tr key={s.sessionId} className={s.status === 'terminated' ? 'bg-[#fff5f5] dark:bg-[#2c1212]' : ''}>
                    <td className="p-3 font-mono text-xs font-bold">{s.sessionId.slice(0, 10)}...</td>
                    <td className="p-3 capitalize">{s.mode}</td>
                    <td className="p-3 font-medium">{s.concept || 'Diagnostic'}</td>
                    <td className="p-3">
                      {s.status === 'completed' ? (
                        <span className="chip chip-green">Completed</span>
                      ) : s.status === 'terminated' ? (
                        <span className="chip chip-red font-bold">Terminated ({s.terminationReason || 'Proctoring Violation'})</span>
                      ) : (
                        <span className="chip chip-yellow">In Progress</span>
                      )}
                    </td>
                    <td className="p-3 font-bold tabular-nums">{s.violationCount}</td>
                    <td className="p-3 text-xs text-[#64748B] dark:text-[#94A3B8]">{formatDate(s.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Proctoring Violation Log */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black dark:text-[#F3F4F6]">Proctoring Violation Activity Stream</h2>
          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">{violationLog.length} Total Events Logged</span>
        </div>

        {violationLog.length === 0 ? (
          <div className="card text-center py-8 text-sm text-[#64748B] dark:text-[#94A3B8]">
            ✓ Clean proctoring record — no violations logged across any session.
          </div>
        ) : (
          <div className="card space-y-3">
            {violationLog.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FAFF] dark:bg-[#070B15]">
                <div className="flex items-center gap-3">
                  <span className="chip chip-red text-xs font-bold uppercase">{v.type}</span>
                  <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">Session {v.sessionId.slice(0, 8)}</span>
                </div>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">{formatDate(v.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

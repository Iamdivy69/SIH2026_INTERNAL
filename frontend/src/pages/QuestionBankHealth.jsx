import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function QuestionBankHealth() {
  const { authHeader, API } = useAuth();

  const [health, setHealth]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/questions/health`, { headers: authHeader() });
        const data = await res.json();
        if (!res.ok) { setError(data.message || 'Failed to load question bank health.'); return; }
        setHealth(data.health);
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 justify-center">
        <div className="w-6 h-6 border-2 border-[#004CE5] border-t-transparent animate-spin" />
        <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Analyzing question bank health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-[#dc2626] font-bold">{error}</p>
      </div>
    );
  }

  const grandTotal = health.reduce((sum, h) => sum + h.total, 0);
  const totalUnserved = health.reduce((sum, h) => sum + h.neverServed, 0);
  const avgBankExposure = health.length > 0
    ? (health.reduce((sum, h) => sum + h.exposure.avg, 0) / health.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-black dark:text-[#F3F4F6]">Question Bank Health</h1>
        <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">
          Aggregated inventory distribution, difficulty balance, exposure metrics, and unserved question counts across all 8 canonical concepts
        </p>
      </div>

      {/* Headline Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 space-y-2 border border-[#E6F0FF] dark:border-[#1C2A4A]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Total Questions</span>
          <div className="text-3xl font-extrabold text-black dark:text-[#F3F4F6]">{grandTotal}</div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Across 8 core concepts</p>
        </div>

        <div className="card p-5 space-y-2 border border-[#E6F0FF] dark:border-[#1C2A4A]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Avg Question Exposure</span>
          <div className="text-3xl font-extrabold text-black dark:text-[#F3F4F6]">{avgBankExposure}</div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Times served per item</p>
        </div>

        <div className="card p-5 space-y-2 border border-[#E6F0FF] dark:border-[#1C2A4A]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Never Served Items</span>
          <div className="text-3xl font-extrabold text-black dark:text-[#F3F4F6]">{totalUnserved}</div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Fresh unexposed items in reserve</p>
        </div>
      </div>

      {/* Health Matrix Table */}
      <div className="card p-0 overflow-hidden border border-[#E6F0FF] dark:border-[#1C2A4A]">
        <div className="p-4 border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FAFF] dark:bg-[#0D1325]">
          <h2 className="font-bold text-sm text-black dark:text-[#F3F4F6]">Concept Inventory & Difficulty Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FAFF] dark:bg-[#0D1325] text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                <th className="p-4">Concept</th>
                <th className="p-4">Total Bank Size</th>
                <th className="p-4">Difficulty Split (E / M / H)</th>
                <th className="p-4">Exposure Range</th>
                <th className="p-4">Avg Exposure</th>
                <th className="p-4">Never Served</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6F0FF] dark:divide-[#1C2A4A]">
              {health.map((h) => (
                <tr key={h.concept} className="hover:bg-[#F8FAFF] dark:hover:bg-[#151D33] transition-colors">
                  <td className="p-4 font-bold text-black dark:text-[#F3F4F6]">{h.concept}</td>
                  <td className="p-4 font-extrabold tabular-nums">{h.total}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold tabular-nums">
                      <span className="text-[#15803d] dark:text-[#4ade80]">{h.byDifficulty.easy} Easy</span>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">•</span>
                      <span className="text-[#a16207] dark:text-[#facc15]">{h.byDifficulty.medium} Med</span>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">•</span>
                      <span className="text-[#dc2626] dark:text-[#f87171]">{h.byDifficulty.hard} Hard</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono tabular-nums text-[#64748B] dark:text-[#94A3B8]">
                    {h.exposure.min} min – {h.exposure.max} max
                  </td>
                  <td className="p-4 font-bold tabular-nums text-black dark:text-[#F3F4F6]">
                    {h.exposure.avg}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${h.neverServed > 0 ? 'bg-[#e6f0ff] dark:bg-[#1c2a4a] text-[#004CE5]' : 'bg-gray-100 text-gray-500'}`}>
                      {h.neverServed} questions
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

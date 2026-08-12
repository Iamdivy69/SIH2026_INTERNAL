import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ClipboardList, TrendingUp, Database, ShieldAlert } from 'lucide-react';

function KpiCard({ title, value, subtitle, icon: Icon, highlight }) {
  return (
    <div className="card space-y-2 p-5 border border-[#E6F0FF] dark:border-[#1C2A4A] relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">{title}</span>
        <div className={`p-2 rounded-xl ${highlight ? 'bg-[#fee2e2] dark:bg-[#3b1212] text-[#dc2626] dark:text-[#f87171]' : 'bg-[#f0f5ff] dark:bg-[#152038] text-[#004CE5] dark:text-[#38bdf8]'}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-black dark:text-[#F3F4F6] tracking-tight">
        {value}
      </div>
      {subtitle && (
        <p className={`text-xs ${highlight ? 'text-[#dc2626] dark:text-[#f87171] font-semibold' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function GapBar({ concept, avgMastery, studentCount, weakStudents }) {
  const color = avgMastery >= 70 ? 'bg-[#22c55e]' : avgMastery >= 40 ? 'bg-[#eab308]' : 'bg-[#ef4444]';
  const textColor = avgMastery >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' : avgMastery >= 40 ? 'text-[#a16207] dark:text-[#facc15]' : 'text-[#dc2626] dark:text-[#f87171]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-black dark:text-[#F3F4F6]">{concept}</span>
          {weakStudents > 0 && (
            <span className="text-xs px-1.5 py-0.5 font-medium chip chip-red">
              {weakStudents} below 40%
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <span>{studentCount} students</span>
          <span className={`font-bold tabular-nums w-10 text-right ${textColor}`}>{avgMastery.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mastery-bar-track">
        <div className={`h-full transition-all duration-700 ${color}`}
          style={{ width: `${avgMastery}%` }} />
      </div>
    </div>
  );
}

export default function Admin() {
  const { authHeader, API } = useAuth();

  const [overview, setOverview]         = useState(null);
  const [ovLoading, setOvLoading]       = useState(true);
  const [ovError, setOvError]           = useState('');

  const [gaps, setGaps]                 = useState([]);
  const [gapsLoading, setGapsLoading]   = useState(true);
  const [gapsError, setGapsError]       = useState('');

  useEffect(() => {
    // Fetch KPI Overview
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/overview`, { headers: authHeader() });
        const data = await res.json();
        if (!res.ok) { setOvError(data.message || 'Failed to load overview.'); return; }
        setOverview(data);
      } catch {
        setOvError('Cannot connect to server.');
      } finally {
        setOvLoading(false);
      }
    })();

    // Fetch Knowledge Gaps
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/gaps`, { headers: authHeader() });
        const data = await res.json();
        if (!res.ok) { setGapsError(data.message || 'Failed to load gaps.'); return; }
        setGaps(data.gaps);
      } catch {
        setGapsError('Cannot connect to server.');
      } finally {
        setGapsLoading(false);
      }
    })();
  }, [API]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-black dark:text-[#F3F4F6]">Admin Overview</h1>
        <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">
          Institutional health metrics and aggregated knowledge gap analysis
        </p>
      </div>

      {/* KPI Cards Row */}
      <section>
        {ovLoading && (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="w-6 h-6 border-2 border-[#004CE5] border-t-transparent animate-spin" />
            <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Loading overview metrics...</span>
          </div>
        )}
        {ovError && <p className="text-[#dc2626] dark:text-[#f87171] text-sm">{ovError}</p>}

        {!ovLoading && overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              title="Total Students"
              value={overview.totalStudents}
              subtitle="Registered active learners"
              icon={Users}
            />
            <KpiCard
              title="Assessments"
              value={overview.totalAssessments}
              subtitle="Completed tests"
              icon={ClipboardList}
            />
            <KpiCard
              title="Avg Institution Mastery"
              value={`${overview.avgInstitutionMastery}%`}
              subtitle="Across all concepts"
              icon={TrendingUp}
            />
            <KpiCard
              title="Question Bank"
              value={overview.questionBankSize}
              subtitle="Total questions available"
              icon={Database}
            />
            <KpiCard
              title="Weekly Violations"
              value={overview.violationsThisWeek}
              subtitle={overview.violationsThisWeek > 0 ? "Requires review" : "Clean record (7 days)"}
              icon={ShieldAlert}
              highlight={overview.violationsThisWeek > 0}
            />
          </div>
        )}
      </section>

      {/* Knowledge Gap Rankings */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-black dark:text-[#F3F4F6]">Knowledge Gap Rankings</h2>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Average mastery per concept across all students — sorted weakest first (real-time aggregation)
          </p>
        </div>

        {gapsLoading && (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="w-6 h-6 border-2 border-[#004CE5] border-t-transparent animate-spin" />
            <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aggregating gaps...</span>
          </div>
        )}
        {gapsError && <p className="text-[#dc2626] dark:text-[#f87171] text-sm">{gapsError}</p>}

        {!gapsLoading && gaps.length > 0 && (
          <div className="card space-y-5">
            {gaps.map(g => (
              <GapBar key={g.concept} {...g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

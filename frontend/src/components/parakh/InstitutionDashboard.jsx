import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Users, Target, AlertTriangle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const PROFICIENCY_TREND = [
  { cycle: "Cycle 1", score: 42 },
  { cycle: "Cycle 2", score: 48 },
  { cycle: "Cycle 3", score: 55 },
  { cycle: "Cycle 4", score: 61 },
  { cycle: "Cycle 5", score: 66 },
  { cycle: "Cycle 6", score: 72 },
];

const TOPIC_WEAKNESS = [
  { topic: "Data Structures", weakness: 32 },
  { topic: "Operating Systems", weakness: 21 },
  { topic: "DBMS", weakness: 18 },
  { topic: "Computer Networks", weakness: 27 },
  { topic: "Algorithms", weakness: 38 },
  { topic: "Discrete Math", weakness: 14 },
];

const KPIS = [
  {
    icon: Users,
    label: "Active Students",
    value: "48,920",
    delta: "+12.4% MoM",
  },
  {
    icon: Target,
    label: "Avg. Proficiency θ",
    value: "+0.74σ",
    delta: "+0.18 vs last cycle",
  },
  {
    icon: TrendingUp,
    label: "Question Bank Health",
    value: "94%",
    delta: "Exposure balanced",
  },
  {
    icon: AlertTriangle,
    label: "At-Risk Cohorts",
    value: "1,204",
    delta: "Flagged for remediation",
  },
];

const USER_ROLES = ["Institutions", "Faculty", "AICTE Analysts"];

export function InstitutionDashboard() {
  return (
    <section
      id="analytics"
      className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FBFF] dark:bg-[#090E1D] text-left transition-colors duration-200"
    >
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Institution Dashboard"
          title="From Individual Scores To Institutional Intelligence"
          subtitle="Aggregated, role-aware analytics turn every adaptive response into actionable insight — for institutions, faculty, and AICTE analysts."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* KPI row */}
          <div className="grid gap-px overflow-hidden border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#1C2A4A] sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
            {KPIS.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Reveal key={kpi.label} delay={idx * 0.05}>
                  <div className="bg-white dark:bg-[#0F1525] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center bg-[#E6F0FF] dark:bg-[#0F1D3D] text-[#004CE5]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#4A5568] dark:text-[#94A3B8]">
                        {kpi.label}
                      </span>
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight text-[#011A53] dark:text-[#8BB8FF]">
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-[#4A5568] dark:text-[#94A3B8]">{kpi.delta}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Proficiency trend */}
          <Reveal className="lg:col-span-7">
            <div className="h-full border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                    Student Proficiency Trend
                  </h3>
                  <p className="text-xs text-[#4A5568] dark:text-[#94A3B8]">
                    Mean θ across last 6 assessment cycles
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#0F1D3D] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#011A53] dark:text-[#8BB8FF]">
                  <span className="h-1.5 w-1.5 bg-[#004CE5]" />
                  Adaptive
                </span>
              </div>
              <div className="mt-5 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={PROFICIENCY_TREND}
                    margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                  >
                    <defs>
                      <linearGradient id="parakhArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#004CE5" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#004CE5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1C2A4A"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="cycle"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      domain={[30, 80]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#011A53",
                        border: "1px solid #1C2A4A",
                        borderRadius: 0,
                        color: "#fff",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#B0C4FF" }}
                      cursor={{ stroke: "#004CE5", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#004CE5"
                      strokeWidth={2.5}
                      fill="url(#parakhArea)"
                      dot={{ r: 3, fill: "#004CE5", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          {/* Topic weakness */}
          <Reveal className="lg:col-span-5" delay={0.08}>
            <div className="h-full border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                    Topic Weakness Map
                  </h3>
                  <p className="text-xs text-[#4A5568] dark:text-[#94A3B8]">
                    % of students scoring below proficiency band
                  </p>
                </div>
              </div>
              <div className="mt-5 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={TOPIC_WEAKNESS}
                    layout="vertical"
                    margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1C2A4A"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                      domain={[0, 50]}
                    />
                    <YAxis
                      type="category"
                      dataKey="topic"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#8BB8FF", fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#011A53",
                        border: "1px solid #1C2A4A",
                        borderRadius: 0,
                        color: "#fff",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#B0C4FF" }}
                      cursor={{ fill: "#0F1D3D" }}
                    />
                    <Bar
                      dataKey="weakness"
                      fill="#004CE5"
                      radius={0}
                      barSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          {/* Roles strip */}
          <Reveal className="lg:col-span-12" delay={0.1}>
            <div className="border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-base font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                    Role-aware views for every stakeholder
                  </h3>
                  <p className="text-xs text-[#4A5568] dark:text-[#94A3B8]">
                    Each role sees a tailored, permission-scoped slice of the same
                    underlying assessment intelligence.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {USER_ROLES.map((role, idx) => (
                    <motion.span
                      key={role}
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, duration: 0.35 }}
                      className="inline-flex items-center gap-2 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF]/60 dark:bg-[#0F1D3D] px-3 py-1.5 text-xs font-semibold text-[#011A53] dark:text-[#8BB8FF]"
                    >
                      <span className="h-1.5 w-1.5 bg-[#004CE5]" />
                      {role}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

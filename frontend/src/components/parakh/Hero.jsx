import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Brain,
  ListChecks,
  FileBarChart2,
  ChevronDown,
} from "lucide-react";
import { Reveal } from "./Reveal";

const FLOW_STEPS = [
  { label: "Student Login", icon: ShieldCheck },
  { label: "Baseline Assessment", icon: ListChecks },
  { label: "AI Adaptive Engine", icon: Brain },
  { label: "Dynamic Question Selection", icon: LayoutGrid },
  { label: "Personalized Score Report", icon: FileBarChart2 },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#070B15] text-left transition-colors duration-200"
    >
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70 dark:opacity-20" />
      {/* Soft accent blob */}
      <div className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#E6F0FF] dark:bg-[#004CE5]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-40 h-[320px] w-[320px] rounded-full bg-[#E6F0FF]/70 dark:bg-[#004CE5]/10 blur-3xl" />

      <div className="container-x relative px-6 pb-16 pt-14 md:px-10 md:pb-24 md:pt-20 lg:px-16 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left column */}
          <div className="lg:col-span-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF]/70 dark:bg-[#0F1D3D] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#011A53] dark:text-[#8BB8FF]">
                <span className="h-1.5 w-1.5 bg-[#004CE5]" />
                AICTE · PARAKH National Assessment Initiative
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-black dark:text-[#F3F4F6] md:text-5xl lg:text-[56px]">
                The Future of Assessment is{" "}
                <span className="text-[#004CE5]">Adaptive</span>. Measure Ability.
                Personalize Learning. Improve Outcomes.
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4A5568] dark:text-[#94A3B8] md:text-lg">
                PARAKH AI Adaptive Learning System transforms traditional MCQ
                assessments into intelligent testing experiences that dynamically
                adjust difficulty based on student performance, response patterns,
                and proficiency levels — built for the scale of Indian technical
                education.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-[#004CE5] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1A66FF]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#0F1D3D] px-5 py-3 text-sm font-semibold text-[#011A53] dark:text-[#8BB8FF] transition-colors hover:bg-[#D6E4FF] dark:hover:bg-[#15244D]"
                >
                  <FileText className="h-4 w-4" />
                  Sign In
                </Link>
                <a
                  href="#adaptive-engine"
                  className="inline-flex items-center justify-center gap-2 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] px-5 py-3 text-sm font-semibold text-[#011A53] dark:text-[#CBD5E1] transition-colors hover:border-[#004CE5] hover:text-[#004CE5]"
                >
                  <PlayCircle className="h-4 w-4" />
                  View Architecture
                </a>
              </div>
            </Reveal>

            {/* Stat strip */}
            <Reveal delay={0.2}>
              <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-[#E6F0FF] dark:border-[#1C2A4A] pt-8 md:grid-cols-4">
                {[
                  { label: "AICTE Institutions", value: "7,500+" },
                  { label: "Students Assessed", value: "1.2M+" },
                  { label: "Question Bank", value: "85K+" },
                  { label: "Adaptive Accuracy", value: "94%" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs font-medium uppercase tracking-wider text-[#4A5568] dark:text-[#94A3B8]">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold tracking-tight text-[#011A53] dark:text-[#8BB8FF] md:text-3xl">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Right column — adaptive flow visual */}
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <div className="relative border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] p-6 md:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#4A5568] dark:text-[#94A3B8]">
                    Adaptive Assessment Flow
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#0F1D3D] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#011A53] dark:text-[#8BB8FF]">
                    <span className="h-1.5 w-1.5 animate-pulse bg-[#004CE5]" />
                    Live
                  </span>
                </div>

                <ol className="relative space-y-3">
                  {FLOW_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isLast = idx === FLOW_STEPS.length - 1;
                    return (
                      <motion.li
                        key={step.label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                        className="relative flex items-start gap-3"
                      >
                        <div className="flex h-10 w-10 flex-none items-center justify-center border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#0F1D3D] text-[#004CE5]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-1 items-center justify-between pb-3">
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                              {step.label}
                            </p>
                            <p className="text-xs text-[#4A5568] dark:text-[#94A3B8]">
                              Step {idx + 1} of {FLOW_STEPS.length}
                            </p>
                          </div>
                          {!isLast && (
                            <span className="text-[#004CE5]">
                              <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                            </span>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>

                <div className="mt-6 border-t border-[#E6F0FF] dark:border-[#1C2A4A] pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4A5568] dark:text-[#94A3B8]">Estimated ability θ</span>
                    <span className="font-semibold text-[#011A53] dark:text-[#8BB8FF]">
                      +0.74 σ
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-[#E6F0FF] dark:bg-[#1C2A4A]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "74%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className="h-full bg-[#004CE5]"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

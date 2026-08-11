import { motion } from "framer-motion";
import {
  MousePointerClick,
  Gauge,
  SlidersHorizontal,
  Database,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    icon: MousePointerClick,
    label: "Student Response",
    detail: "Captured with timestamp, dwell time, and change history.",
  },
  {
    icon: Gauge,
    label: "Ability Estimation",
    detail: "IRT 3PL model updates latent θ after each response.",
  },
  {
    icon: SlidersHorizontal,
    label: "Difficulty Matching",
    detail: "Target difficulty derived from Fisher information curve.",
  },
  {
    icon: Database,
    label: "Question Bank / AI Selection",
    detail: "Next-best item chosen by maximum information + exposure control.",
  },
  {
    icon: Sparkles,
    label: "Next Best Question",
    detail: "Delivered under 250ms via edge-cached item pool.",
  },
  {
    icon: Award,
    label: "Final Proficiency Score",
    detail: "Calibrated θ mapped to a 9-band proficiency scale.",
  },
];

const SIGNALS = [
  { label: "Correctness", value: "Binary + partial" },
  { label: "Response time", value: "ms precision" },
  { label: "Difficulty level", value: "b-parameter" },
  { label: "Previous exposure", value: "Item usage count" },
  { label: "Ability estimate", value: "θ ± SE" },
];

export function AdaptiveEngine() {
  return (
    <section
      id="adaptive-engine"
      className="relative overflow-hidden border-b border-[#E6F0FF] bg-[#011A53] text-white text-left"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#004CE5]/40 blur-3xl" />

      <div className="container-x relative py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#B0C4FF]">
              <span className="h-1.5 w-1.5 bg-[#004CE5]" />
              Adaptive Engine
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl lg:text-[44px]">
              Every Question Learns From The Previous Answer
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#B0C4FF] md:text-lg">
              The adaptive engine turns each response into a measurable signal —
              then selects the next item that will most reduce uncertainty about
              the student&apos;s true ability.
            </p>
          </Reveal>
        </div>

        {/* Workflow */}
        <div className="mt-14 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.45 }}
                className="relative"
              >
                <div className="h-full border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-[#004CE5] hover:bg-white/[0.07] text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#004CE5]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Icon className="h-5 w-5 text-[#B0C4FF]" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">
                    {step.label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#B0C4FF]">
                    {step.detail}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-[#004CE5] lg:block">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Signals considered */}
        <Reveal delay={0.1}>
          <div className="mt-12 border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="mb-5 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
              <h3 className="text-base font-semibold text-white">
                Signals considered for each next-item decision
              </h3>
              <span className="text-xs font-medium uppercase tracking-wider text-[#B0C4FF]">
                Updated after every response
              </span>
            </div>
            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
              {SIGNALS.map((sig) => (
                <div key={sig.label} className="bg-[#011A53] p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#B0C4FF]">
                    {sig.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {sig.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

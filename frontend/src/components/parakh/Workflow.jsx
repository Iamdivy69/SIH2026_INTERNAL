import { motion } from "framer-motion";
import { ShieldCheck, ListChecks, Brain, Award, RefreshCw } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Student Authentication",
    description: "Institution-linked login with SSO and identity verification.",
  },
  {
    icon: ListChecks,
    title: "Baseline Assessment",
    description: "An initial MCQ set estimates the student's starting ability.",
  },
  {
    icon: Brain,
    title: "Adaptive Testing",
    description: "AI engine selects the next-best question in real time.",
  },
  {
    icon: Award,
    title: "Scoring & Reporting",
    description: "Proficiency insights, band, and topic-level feedback generated.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Improvement",
    description: "Responses feed back into the item bank to refine calibration.",
  },
];

export function Workflow() {
  return (
    <section className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FBFF] dark:bg-[#090E1D] transition-colors duration-200">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 text-left">
        <SectionHeading
          eyebrow="How It Works"
          title="From Login To Calibrated Proficiency — In Five Steps"
          subtitle="A clear, auditable path from the first login to a defensible proficiency score, with continuous feedback into the question bank."
        />

        <div className="relative mt-12">
          {/* connector line on desktop */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-[#E6F0FF] dark:bg-[#1C2A4A] lg:block" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.45 }}
                  className="relative text-left"
                >
                  <div className="h-full border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] p-6">
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center bg-[#004CE5] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#004CE5] dark:text-[#8BB8FF]">
                      Step {idx + 1}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4A5568] dark:text-[#94A3B8]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

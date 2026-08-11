import { motion } from "framer-motion";
import {
  BookOpen,
  Cpu,
  Sliders,
  ClipboardCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const PIPELINE = [
  {
    icon: BookOpen,
    label: "Curriculum",
    detail: "Topic trees and learning outcomes ingested from AICTE syllabus.",
  },
  {
    icon: Cpu,
    label: "AI Generation",
    detail: "LLM produces stem, options, distractors, and metadata.",
  },
  {
    icon: Sliders,
    label: "Difficulty Calibration",
    detail: "Items field-tested and calibrated onto the IRT b-scale.",
  },
  {
    icon: ClipboardCheck,
    label: "Expert Review",
    detail: "Faculty reviewers validate accuracy, bias, and clarity.",
  },
  {
    icon: Layers,
    label: "Live Question Pool",
    detail: "Approved items enter the rotation with exposure limits.",
  },
];

const FEATURES = [
  {
    title: "Topic & Difficulty Control",
    description:
      "Generation parameters lock topic, sub-topic, target b-parameter, and cognitive level (recall / apply / analyse).",
  },
  {
    title: "Distractor Engineering",
    description:
      "Plausible distractors are generated from real student misconceptions, then ranked by predicted discrimination.",
  },
  {
    title: "Bias & Safety Filtering",
    description:
      "Every generated item passes through bias, language, and answer-key safety checks before review.",
  },
  {
    title: "Continuous Pool Refresh",
    description:
      "The live pool is continuously enriched with new items, while low-performing items are retired automatically.",
  },
];

export function AIQuestionGeneration() {
  return (
    <section id="ai-generation" className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#070B15] transition-colors duration-200">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 text-left">
        <SectionHeading
          eyebrow="AI Question Generation"
          title="Never Run Out Of Quality Questions"
          subtitle="An LLM-powered pipeline continuously produces calibrated items — eliminating the repetition, exposure, and stagnation problems of static question banks."
        />

        {/* Pipeline */}
        <Reveal>
          <div className="mt-12 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FBFF] dark:bg-[#090E1D] p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-5">
              {PIPELINE.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    className="relative text-left"
                  >
                    <div className="flex h-full flex-col bg-white dark:bg-[#0F1525] p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center bg-[#004CE5] text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-[#4A5568] dark:text-[#94A3B8]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                        {step.label}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#4A5568] dark:text-[#94A3B8]">
                        {step.detail}
                      </p>
                    </div>
                    {idx < PIPELINE.length - 1 && (
                      <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[#004CE5] md:block">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Feature grid */}
        <div className="mt-8 grid gap-px overflow-hidden border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#1C2A4A] md:grid-cols-2">
          {FEATURES.map((feat, idx) => (
            <Reveal key={feat.title} delay={idx * 0.06}>
              <div className="h-full bg-white dark:bg-[#0F1525] p-6 md:p-8">
                <h3 className="flex items-center gap-2 text-base font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                  <span className="h-1.5 w-1.5 bg-[#004CE5]" />
                  {feat.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4A5568] dark:text-[#94A3B8]">
                  {feat.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

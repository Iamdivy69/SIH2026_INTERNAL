import { Check, X } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const TRADITIONAL_POINTS = [
  "Fixed difficulty regardless of student ability",
  "Same question set delivered to every candidate",
  "High question repetition and exposure risk",
  "Coarse ability measurement, weak discrimination",
  "No insight into response patterns or timing",
];

const ADAPTIVE_POINTS = [
  "Dynamic difficulty adjustment after every response",
  "Personalized question selection per learner",
  "AI-generated items with calibrated difficulty",
  "Accurate proficiency estimation via IRT models",
  "Response-time and exposure analytics built in",
];

export function ProblemSection() {
  return (
    <section className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FBFF] dark:bg-[#090E1D] transition-colors duration-200">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 text-left">
        <SectionHeading
          eyebrow="The Problem"
          title="Traditional Assessments Cannot Understand Every Student"
          subtitle="Static MCQ papers measure what was asked, not what a student knows. PARAKH closes the gap between testing memory and measuring ability."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Traditional */}
          <Reveal>
            <div className="h-full border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] p-6 md:p-8">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#4A5568] dark:text-[#94A3B8]">
                  Conventional Approach
                </span>
                <span className="inline-flex items-center gap-1 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F5F7FA] dark:bg-[#1C2A4A] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#94A3B8]">
                  Legacy
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                Traditional MCQ Testing
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A5568] dark:text-[#94A3B8]">
                A single static paper is delivered to every learner. Difficulty is
                frozen at design time, regardless of who is sitting the test.
              </p>
              <ul className="mt-6 space-y-3">
                {TRADITIONAL_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm text-[#011A53] dark:text-[#CBD5E1]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-[#F5F7FA] dark:bg-[#1C2A4A] text-[#4A5568] dark:text-[#94A3B8]">
                      <X className="h-3 w-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Adaptive */}
          <Reveal delay={0.08}>
            <div className="relative h-full border border-[#004CE5] bg-[#011A53] dark:bg-[#0A132C] p-6 text-white md:p-8">
              <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-[#004CE5]/30 blur-3xl"
                aria-hidden
              />
              <div className="relative mb-5 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#B0C4FF] dark:text-[#8BB8FF]">
                  PARAKH Approach
                </span>
                <span className="inline-flex items-center gap-1 border border-[#004CE5] bg-[#004CE5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Adaptive
                </span>
              </div>
              <h3 className="relative text-xl font-semibold text-white">
                PARAKH Adaptive Assessment
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-[#B0C4FF] dark:text-[#8BB8FF]">
                Each response updates a live ability estimate. The next item is
                selected to maximise information about that specific learner.
              </p>
              <ul className="relative mt-6 space-y-3">
                {ADAPTIVE_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm text-white"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-[#004CE5] text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

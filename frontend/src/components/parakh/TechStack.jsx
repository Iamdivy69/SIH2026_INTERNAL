import {
  Code2,
  Server,
  Sparkles,
  Database,
  Radio,
  Cloud,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const STACK = [
  {
    icon: Code2,
    layer: "Frontend",
    tech: ["React", "TypeScript", "Tailwind CSS"],
    description:
      "Component-driven, accessible, server-rendered UI with optimistic interactions.",
  },
  {
    icon: Server,
    layer: "Backend",
    tech: ["Node.js", "Express", "Mongoose"],
    description:
      "Async API layer for item delivery, scoring, and adaptive selection at scale.",
  },
  {
    icon: Sparkles,
    layer: "AI Layer",
    tech: ["LLM Question Generation", "IRT Engine", "Calibration Service"],
    description:
      "Generates, calibrates, and validates items — and runs ability estimation per response.",
  },
  {
    icon: Database,
    layer: "Database",
    tech: ["MongoDB", "Mongoose ORM"],
    description:
      "Relational-like document store for items, responses, sessions, and psychometric metadata.",
  },
  {
    icon: Radio,
    layer: "Real-Time",
    tech: ["Web Sockets", "Proctoring Logs"],
    description:
      "In-memory layer for low-latency next-item delivery and live proctoring signals.",
  },
  {
    icon: Cloud,
    layer: "Infrastructure",
    tech: ["Docker", "Cloud CDN"],
    description:
      "Containerised deployment with autoscaling and edge-cached item delivery.",
  },
];

export function TechStack() {
  return (
    <section className="border-b border-[#E6F0FF] bg-white">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 text-left">
        <SectionHeading
          eyebrow="Technology Stack"
          title="A Modern, Open, Scalable Stack"
          subtitle="Built on a proven enterprise stack — chosen for reliability, auditability, and the ability to operate at AICTE national scale."
        />

        <div className="mt-12 grid gap-px overflow-hidden border border-[#E6F0FF] bg-[#E6F0FF] md:grid-cols-2 lg:grid-cols-3 text-left">
          {STACK.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.layer} delay={idx * 0.05}>
                <div className="h-full bg-white p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#011A53] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#4A5568]">
                      Layer {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#011A53]">
                    {s.layer}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">
                    {s.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.tech.map((t) => (
                      <li
                        key={t}
                        className="border border-[#E6F0FF] bg-[#E6F0FF]/60 px-2.5 py-1 text-xs font-medium text-[#011A53]"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

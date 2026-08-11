import { GraduationCap, Cpu, Sparkles, LineChart } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const MODULES = [
  {
    icon: GraduationCap,
    title: "Student Assessment Portal",
    description:
      "The learner-facing interface for pre-assessment, adaptive tests, personalised feedback, and downloadable performance reports.",
    items: ["Pre-assessment", "Adaptive tests", "Personalized feedback", "Performance reports"],
  },
  {
    icon: Cpu,
    title: "Adaptive Testing Engine",
    description:
      "The core decision layer that estimates ability and matches question difficulty in real time, using IRT-based selection.",
    items: ["Ability estimation", "Difficulty matching", "Real-time selection"],
  },
  {
    icon: Sparkles,
    title: "AI Question Generation",
    description:
      "LLM-powered generation of fresh items with topic, difficulty, and distractor control, routed through an expert validation workflow.",
    items: ["LLM-powered generation", "Topic & difficulty control", "Expert validation workflow"],
  },
  {
    icon: LineChart,
    title: "Analytics Dashboard",
    description:
      "Multi-tier analytics surface student proficiency trends, institution-level reports, and national insights for AICTE.",
    items: ["Student analytics", "Institution reports", "National insights"],
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="border-b border-[#E6F0FF] bg-white">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 text-left">
        <SectionHeading
          eyebrow="The Platform"
          title="One Intelligent Platform For Adaptive Assessment"
          subtitle="Four tightly-integrated modules move each learner from a baseline estimate to a calibrated, auditable proficiency score."
        />

        <div className="mt-12 grid gap-px overflow-hidden border border-[#E6F0FF] bg-[#E6F0FF] md:grid-cols-2">
          {MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Reveal key={mod.title} delay={idx * 0.06}>
                <div className="group h-full bg-white p-6 transition-colors hover:bg-[#F8FBFF] md:p-8">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 flex-none items-center justify-center bg-[#011A53] text-white transition-colors group-hover:bg-[#004CE5]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-left">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#004CE5]">
                          Module {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mt-1 text-xl font-semibold text-[#011A53] text-left">
                        {mod.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4A5568] text-left">
                        {mod.description}
                      </p>
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {mod.items.map((item) => (
                          <li
                            key={item}
                            className="border border-[#E6F0FF] bg-[#E6F0FF]/60 px-2.5 py-1 text-xs font-medium text-[#011A53]"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

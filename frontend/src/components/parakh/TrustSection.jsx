import { Brain, BarChart3, Network, Lock } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const TRUST_CARDS = [
  {
    icon: Brain,
    title: "AI Adaptive Testing",
    description:
      "Real-time difficulty adjustment using student ability estimation. Every response reshapes the next question to keep the learner in their zone of proximal development.",
  },
  {
    icon: BarChart3,
    title: "Psychometric Intelligence",
    description:
      "Powered by Item Response Theory (IRT) models that translate raw responses into a calibrated proficiency score across multiple ability dimensions.",
  },
  {
    icon: Network,
    title: "National Scale Ready",
    description:
      "Architected for thousands of concurrent learners across AICTE-approved institutions, with horizontal scaling, queue-backed scoring, and CDN-delivered items.",
  },
  {
    icon: Lock,
    title: "Secure Assessment",
    description:
      "End-to-end proctoring, item exposure control, full audit trails, and role-based access ensure assessment integrity at every step of the delivery pipeline.",
  },
];

export function TrustSection() {
  return (
    <section className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#070B15] transition-colors duration-200">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 text-left">
        <SectionHeading
          eyebrow="Why PARAKH"
          title="Built for Scalable, Reliable Assessment"
          subtitle="A national assessment infrastructure combining psychometric rigour with modern AI engineering — designed for the trust bar of government-scale education."
        />

        <div className="mt-12 grid gap-px overflow-hidden border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#1C2A4A] md:grid-cols-2 lg:grid-cols-4">
          {TRUST_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={idx * 0.05}>
                <div className="group h-full bg-white dark:bg-[#0F1525] p-6 transition-colors hover:bg-[#F8FBFF] dark:hover:bg-[#121A2E] md:p-8">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#E6F0FF] dark:bg-[#0F1D3D] text-[#004CE5] transition-colors group-hover:bg-[#004CE5] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#011A53] dark:text-[#F3F4F6]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568] dark:text-[#94A3B8]">
                    {card.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

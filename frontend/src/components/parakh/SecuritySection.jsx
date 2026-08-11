import { KeyRound, Eye, ScrollText, Users2 } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const CARDS = [
  {
    icon: KeyRound,
    title: "Question Security",
    description:
      "Item exposure control, rotation, and an encrypted item pool ensure no candidate sees the same item too often — protecting bank integrity at national scale.",
  },
  {
    icon: Eye,
    title: "Proctoring",
    description:
      "Browser lockdown, webcam monitoring, and tab-switch detection provide multi-layered remote proctoring suitable for high-stakes summative assessment.",
  },
  {
    icon: ScrollText,
    title: "Auditability",
    description:
      "Every adaptive decision — item selection, ability update, score finalisation — is logged into an immutable, exportable audit trail.",
  },
  {
    icon: Users2,
    title: "Role-Based Access",
    description:
      "Granular RBAC across Admin, Faculty, Reviewers, and Analysts — with scoped views, scoped exports, and full action logging per role.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="border-b border-[#E6F0FF] bg-white">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16 text-left">
        <SectionHeading
          eyebrow="Security & Integrity"
          title="Assessment Integrity At Every Level"
          subtitle="A layered trust model — from item security through proctoring to auditability — designed to meet the integrity bar of national-level assessment."
        />

        <div className="mt-12 grid gap-px overflow-hidden border border-[#E6F0FF] bg-[#E6F0FF] md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={idx * 0.05}>
                <div className="group h-full bg-white p-6 md:p-8">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#011A53] text-white transition-colors group-hover:bg-[#004CE5]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#011A53]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">
                    {card.description}
                  </p>
                  <div className="mt-5 h-px w-full bg-[#E6F0FF]" />
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-[#4A5568]">
                    Layer {String(idx + 1).padStart(2, "0")} · Always on
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

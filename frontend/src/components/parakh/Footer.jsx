import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const FOOTER_NAV = [
  {
    title: "Platform",
    links: [
      { label: "Adaptive Engine", href: "#adaptive-engine" },
      { label: "AI Question Generation", href: "#ai-generation" },
      { label: "Analytics", href: "#analytics" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Technology",
    links: [
      { label: "Architecture", href: "#adaptive-engine" },
      { label: "Tech Stack", href: "#" },
      { label: "Psychometric Models", href: "#" },
      { label: "Integrations", href: "#" },
    ],
  },
  {
    title: "Security",
    links: [
      { label: "Item Security", href: "#security" },
      { label: "Proctoring", href: "#security" },
      { label: "Audit Trails", href: "#security" },
      { label: "Role-Based Access", href: "#security" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Solution Brief", href: "#brochure" },
      { label: "Documentation", href: "#" },
      { label: "Case Studies", href: "#" },
      { label: "AICTE PARAKH", href: "#" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Request Demo", href: "#demo" },
      { label: "Support", href: "#" },
      { label: "Partner With Us", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      id="institutions"
      className="mt-auto bg-[#011A53] dark:bg-[#070B15] border-t border-transparent dark:border-[#1C2A4A] text-white text-left transition-colors duration-200"
    >
      <div className="container-x px-6 py-14 md:px-10 md:py-16 lg:px-16 mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <img src="/favicon.svg" alt="PARAKH AI Logo" className="w-8 h-8 rounded-lg shadow-sm" />
              <div className="flex flex-col leading-none">
                <span className="text-base font-extrabold tracking-tight text-white">
                  PARAKH <span className="text-[#8BB8FF]">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B0C4FF] dark:text-[#8BB8FF]">
                  AI ADAPTIVE ASSESSMENT
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#B0C4FF] dark:text-[#94A3B8]">
              An AICTE-backed national assessment intelligence platform powering
              the future of engineering education — measuring ability, not memory.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-[#B0C4FF] dark:text-[#CBD5E1]">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#004CE5]" />
                parakh@aicte-india.org
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#004CE5]" />
                +91 11 2958 1000
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#004CE5]" />
                AICTE, Nelson Mandela Marg, Vasant Kunj, New Delhi 110 070
              </li>
            </ul>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
            {FOOTER_NAV.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-[#B0C4FF] dark:text-[#94A3B8] transition-colors hover:text-white dark:hover:text-[#8BB8FF]"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 dark:border-[#1C2A4A] pt-6 md:flex-row md:items-center">
          <p className="text-xs text-[#B0C4FF] dark:text-[#94A3B8]">
            © {new Date().getFullYear()} PARAKH · AICTE. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#B0C4FF] dark:text-[#94A3B8]">
            <a href="#" className="hover:text-white dark:hover:text-[#8BB8FF]">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white dark:hover:text-[#8BB8FF]">
              Terms of Use
            </a>
            <a href="#" className="hover:text-white dark:hover:text-[#8BB8FF]">
              Accessibility
            </a>
            <a href="#" className="hover:text-white dark:hover:text-[#8BB8FF]">
              Data Protection
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

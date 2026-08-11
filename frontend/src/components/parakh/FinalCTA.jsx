import { Link } from "react-router-dom";
import { ArrowRight, FileText, Mail } from "lucide-react";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section
      id="demo"
      className="relative overflow-hidden border-b border-[#E6F0FF] bg-white text-left"
    >
      <div className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#E6F0FF] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full bg-[#E6F0FF]/70 blur-3xl" />

      <div className="container-x relative py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="relative border border-[#E6F0FF] bg-[#F8FBFF] p-8 md:p-14">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <span className="inline-flex items-center gap-2 border border-[#E6F0FF] bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#011A53]">
                  <span className="h-1.5 w-1.5 bg-[#004CE5]" />
                  Get Started
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-tight text-black md:text-4xl lg:text-[44px]">
                  Transform Assessment From Testing Memory To{" "}
                  <span className="text-[#004CE5]">Measuring Ability</span>.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4A5568] md:text-lg">
                  Bring adaptive, AI-powered assessment to your institution.
                  Request a personalised demo, download the solution brief, or
                  talk to the PARAKH team about pilot deployments.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={0.1}>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-between gap-2 bg-[#004CE5] px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#003FBC]"
                  >
                    Request Demo / Try Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-between gap-2 border border-[#E6F0FF] bg-white px-5 py-4 text-sm font-semibold text-[#011A53] transition-colors hover:bg-[#E6F0FF]"
                  >
                    Sign In
                    <FileText className="h-4 w-4" />
                  </Link>
                  <a
                    href="mailto:parakh@aicte-india.org"
                    className="inline-flex items-center justify-between gap-2 border border-[#E6F0FF] bg-white px-5 py-4 text-sm font-semibold text-[#011A53] transition-colors hover:bg-[#E6F0FF]"
                  >
                    Contact Our Team
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

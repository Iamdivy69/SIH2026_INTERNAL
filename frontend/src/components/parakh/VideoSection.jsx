import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Reveal } from "./Reveal";

const HIGHLIGHTS = [
  "Product walkthrough — see the adaptive engine in action",
  "Student assessment journey — from login to score report",
  "AI engine explanation — how next-best-question selection works",
];

export function VideoSection() {
  return (
    <section className="border-b border-[#E6F0FF] bg-[#011A53] text-white text-left">
      <div className="container-x py-16 md:py-24 mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#B0C4FF]">
                <span className="h-1.5 w-1.5 bg-[#004CE5]" />
                Watch
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl lg:text-[44px]">
                Building The Next Generation Of Learning Assessment
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#B0C4FF] md:text-lg">
                A guided walkthrough of the PARAKH platform — covering the
                adaptive engine, the student journey, and the AI question
                generation pipeline behind national-scale assessment.
              </p>
            </Reveal>
            <ul className="mt-8 space-y-3">
              {HIGHLIGHTS.map((h, idx) => (
                <Reveal key={h} delay={0.15 + idx * 0.05}>
                  <li className="flex items-start gap-3 text-sm text-white">
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-[#004CE5] text-white">
                      <PlayCircle className="h-3 w-3" />
                    </span>
                    {h}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Video placeholder */}
          <Reveal delay={0.1}>
            <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-white/[0.04]">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                aria-label="Play PARAKH platform walkthrough video"
              >
                <span className="flex h-16 w-16 items-center justify-center bg-[#004CE5] text-white shadow-lg">
                  <PlayCircle className="h-8 w-8" />
                </span>
              </motion.button>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  PARAKH Platform · 04:18
                </span>
                <span className="border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#B0C4FF]">
                  HD Walkthrough
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

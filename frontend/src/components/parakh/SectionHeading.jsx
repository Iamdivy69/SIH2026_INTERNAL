import { Reveal } from "./Reveal";
import { cn } from "../../lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF]/60 dark:bg-[#0F1D3D] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#011A53] dark:text-[#8BB8FF]">
            <span className="h-1.5 w-1.5 bg-[#004CE5]" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight text-black dark:text-[#F3F4F6] md:text-4xl lg:text-[44px]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "max-w-2xl text-base leading-relaxed text-[#4A5568] dark:text-[#94A3B8] md:text-lg",
              align === "center" ? "mx-auto" : ""
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

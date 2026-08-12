import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck, LogIn, Sun, Moon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { label: "Platform", href: "#platform" },
  { label: "Adaptive Engine", href: "#adaptive-engine" },
  { label: "AI Question Generation", href: "#ai-generation" },
  { label: "Analytics", href: "#analytics" },
  { label: "Security", href: "#security" },
  { label: "Institutions", href: "#institutions" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-[#E6F0FF] dark:border-[#1C2A4A] bg-white/95 dark:bg-[#0F1525]/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-[#0F1525]/85"
          : "border-transparent bg-white dark:bg-[#070B15]"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between px-6 md:px-10 lg:px-16 mx-auto max-w-7xl">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="PARAKH AI Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <div className="flex flex-col leading-none text-left">
            <span className="text-base font-extrabold tracking-tight text-black dark:text-[#F3F4F6]">
              PARAKH <span className="text-[#004CE5]">AI</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">
              AI ADAPTIVE ASSESSMENT
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#011A53] dark:text-[#CBD5E1] transition-colors hover:text-[#004CE5] dark:hover:text-[#8BB8FF]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#004CE5] dark:hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-[#004CE5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A66FF]"
            >
              <ShieldCheck className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#0F1D3D] px-4 py-2.5 text-sm font-semibold text-[#011A53] dark:text-[#8BB8FF] transition-colors hover:bg-[#D6E4FF] dark:hover:bg-[#15244D]"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-[#004CE5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A66FF]"
              >
                <ShieldCheck className="h-4 w-4" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 text-[#64748B] dark:text-[#94A3B8]"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] text-[#011A53] dark:text-[#F3F4F6] cursor-pointer"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[#E6F0FF] dark:border-[#1C2A4A] bg-white dark:bg-[#0F1525] lg:hidden"
          >
            <div className="container-x flex flex-col gap-1 px-6 py-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-[#F5F7FA] dark:border-[#1C2A4A]/50 py-3 text-sm font-medium text-[#011A53] dark:text-[#CBD5E1] hover:text-[#004CE5] dark:hover:text-[#8BB8FF]"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-2 bg-[#004CE5] px-4 py-3 text-sm font-semibold text-white"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center gap-2 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#0F1D3D] px-4 py-3 text-sm font-semibold text-[#011A53] dark:text-[#8BB8FF]"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center gap-2 bg-[#004CE5] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

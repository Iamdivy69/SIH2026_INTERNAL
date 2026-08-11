import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck, LogIn } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

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
          ? "border-[#E6F0FF] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
          : "border-transparent bg-white"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between px-6 md:px-10 lg:px-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center bg-[#004CE5]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-white"
              aria-hidden="true"
            >
              <path
                d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
                fill="currentColor"
                opacity="0.9"
              />
            </svg>
          </div>
          <div className="flex flex-col leading-none text-left">
            <span className="text-base font-semibold tracking-tight text-black">
              PARAKH
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4A5568]">
              AI Adaptive Assessment
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#011A53] transition-colors hover:text-[#004CE5]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-[#004CE5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003FBC]"
            >
              <ShieldCheck className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-[#E6F0FF] bg-[#E6F0FF] px-4 py-2.5 text-sm font-semibold text-[#011A53] transition-colors hover:bg-[#D6E4FF]"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-[#004CE5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003FBC]"
              >
                <ShieldCheck className="h-4 w-4" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#E6F0FF] bg-white text-[#011A53] lg:hidden cursor-pointer"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[#E6F0FF] bg-white lg:hidden"
          >
            <div className="container-x flex flex-col gap-1 px-6 py-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-[#F5F7FA] py-3 text-sm font-medium text-[#011A53] hover:text-[#004CE5]"
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
                      className="inline-flex items-center justify-center gap-2 border border-[#E6F0FF] bg-[#E6F0FF] px-4 py-3 text-sm font-semibold text-[#011A53]"
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

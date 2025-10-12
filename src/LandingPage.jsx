import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage({ onOpen }) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Spotlight effect - only in dark mode */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 dark:opacity-100 opacity-0"
        fill="white"
      />

      {/* Dotted grid background */}
      <div
        className="absolute inset-0 dark:opacity-100 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(128, 128, 128, 0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 30%, rgba(var(--background-rgb, 0, 0, 0), 0.6) 100%)",
        }}
      ></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="font-bold text-2xl text-foreground tracking-tighter">
          INVOICE<span className="font-light">GEN</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/TirthDhandhukia30/invoicegen"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>Star</span>
          </a>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 tracking-tighter leading-[0.95]">
            Easy Invoicing,
            <br />
            <span className="text-foreground/70">Zero Stress</span>
          </h1>
          <p className="text-base md:text-lg text-foreground/50 mb-10 max-w-xl mx-auto font-light tracking-wide">
            Smart invoice generator that takes care of your business finances.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-foreground/40 bg-transparent text-foreground px-8 py-3 rounded-full hover:bg-foreground/10 hover:border-foreground/60 hover:text-foreground font-medium text-base tracking-wide"
            onClick={onOpen}
          >
            <span>Create Invoice</span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>

        {/* Subtle bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-foreground/[0.02] to-transparent rounded-t-[50%]"></div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-8">
        <div className="flex items-center justify-center text-xs text-foreground/40">
          <span>Made with ♥ by</span>
          <a
            href="https://tirthdhandhukia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-foreground/60 hover:text-foreground transition-colors"
          >
            Tirth Dhandhukia
          </a>
        </div>
      </footer>
    </div>
  );
}

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
        <ThemeToggle />
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
    </div>
  );
}

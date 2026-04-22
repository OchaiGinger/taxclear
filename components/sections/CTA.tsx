"use client";

import React from "react";
import { CalculatorDialog } from "@/components/CalculatorDialog";
import { Button } from "@/components/ui/button";

export const CTA = () => {
  return (
    <section className="relative py-[20vh] bg-brand-black flex flex-col items-center justify-center text-center px-6 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center, var(--tw-gradient-stops))] from-brand-green/40 via-transparent to-transparent" />
      <div className="z-10 max-w-4xl">
        <p className="reveal-text section-label mb-8">Get Started Free</p>
        <h2 className="reveal-text text-5xl md:text-8xl font-headline font-bold leading-[0.9] tracking-tighter uppercase mb-12">
          No Surprises. <br /> No{" "}
          <span className="font-serif italic text-brand-green">Penalties</span>.
        </h2>
        <div className="reveal-text">
          <CalculatorDialog>
            <Button className="h-20 px-12 rounded-none bg-brand-green text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest transition-all text-lg">
              Check My Tax Now — Free
            </Button>
          </CalculatorDialog>
        </div>
      </div>
    </section>
  );
};

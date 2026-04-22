"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Strategy } from "@/components/sections/Strategy";
import { TaxBrackets } from "@/components/sections/TaxBrackets";
import { Security } from "@/components/sections/Security";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Team } from "@/components/sections/Team";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  return (
    <div className="relative w-full">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Strategy />
        <TaxBrackets />
        <Security />
        <Team />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

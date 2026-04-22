"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CalculatorDialog } from "@/components/CalculatorDialog";
import Image from "next/image";

export const Navbar = () => {
  const navItems = [
    { num: "01", label: "HOME", href: "#" },
    { num: "02", label: "HOW IT WORKS", href: "#strategy" },
    { num: "03", label: "TAX BRACKETS", href: "#brackets" },
    { num: "04", label: "SECURITY", href: "#security" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-20 flex items-center justify-between px-[6%] backdrop-blur-md border-b border-white/5 bg-brand-black/40">
      {/* Logo */}
      <div className="flex items-center gap-1">
        <div className="w-12 h-12 relative">
          <Image
            src="/images/logo.png"
            alt="Fiscora Logo"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-xl font-headline font-bold tracking-tighter uppercase italic text-white">
          Fiscora
        </span>
      </div>

      {/* Navigation */}
      <div className="hidden md:flex items-center gap-10">
        {navItems.map((item) => (
          <a
            key={item.num}
            href={item.href}
            className="group flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.15em] text-white/40 hover:text-white transition-colors"
          >
            <span className="text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
              {item.num}
            </span>
            <span className="uppercase">{item.label}</span>
          </a>
        ))}
      </div>

      {/* CTA Button */}
      <CalculatorDialog>
        <Button
          className="rounded-none border-brand-green/30 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all uppercase font-bold tracking-wider text-[0.75rem] h-10 px-6 text-brand-green"
          variant="outline"
        >
          Check My Tax →
        </Button>
      </CalculatorDialog>
    </nav>
  );
};

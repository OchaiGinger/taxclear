"use client";

import React from "react";
import { CalculatorDialog } from "@/components/CalculatorDialog";
import { X, Mail, ArrowUpRight, ShieldCheck, Globe } from "lucide-react";

import { FaLinkedin, FaGithub } from "react-icons/fa";
import Image from "next/image";
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Tax Calculator", href: "#", isCalculator: true },
      { label: "Relief Guidance", href: "#strategy" },
      { label: "FIRS Brackets", href: "#brackets" },
      { label: "Security Standards", href: "#security" },
    ],
    resources: [
      {
        label: "2024 Finance Act",
        href: "https://www.firs.gov.ng/",
        external: true,
      },
      {
        label: "PITA Guidelines",
        href: "https://www.firs.gov.ng/",
        external: true,
      },
      { label: "Tax FAQs", href: "#" },
      {
        label: "LIRS Portal",
        href: "https://www.fiscora.net/",
        external: true,
      },
    ],
    company: [
      { label: "About Fiscora", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Contact Support", href: "mailto:info@fiscora.net" },
    ],
  };

  return (
    <footer className="bg-brand-black border-t border-white/5 pt-24 pb-12 px-[8%] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-125  h-125 bg-brand-green/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mb-48" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-8">
            <div className="flex items-center gap-2">
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
            <p className="text-white/40 text-[0.8rem] leading-relaxed max-w-xs">
              Nigeria&apos;s most advanced tax clarity engine. Built for the
              modern professional to navigate the 2024 Finance Act with
              precision, privacy, and institutional-grade security.
            </p>
            <div className="flex gap-3">
              {[X, FaLinkedin, FaGithub, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-green hover:border-brand-green transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Tools */}
          <div className="space-y-8">
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-brand-green">
              Tools & Analysis
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  {link.isCalculator ? (
                    <CalculatorDialog>
                      <button className="text-[0.75rem] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2 group">
                        {link.label}{" "}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </CalculatorDialog>
                  ) : (
                    <a
                      href={link.href}
                      className="text-[0.75rem] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-8">
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-brand-green">
              Tax Intelligence
            </h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : ""}
                    className="text-[0.75rem] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    {link.label}{" "}
                    {link.external && (
                      <ArrowUpRight className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-all" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-8">
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-brand-green">
              Stay Compliant
            </h4>
            <div className="p-6 bg-white/5 border border-white/10 rounded-none space-y-5">
              <p className="text-[0.7rem] text-white/50 leading-relaxed">
                Receive quarterly digests on tax law amendments and critical
                filing reminders.
              </p>
              <div className="flex items-center border-b border-white/20 focus-within:border-brand-green transition-colors">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="bg-transparent text-[0.7rem] py-3 w-full focus:outline-none placeholder:text-white/20 uppercase tracking-[0.2em] font-bold"
                />
                <button className="p-2 text-brand-green hover:text-white transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                Fiscora © {currentYear} · Benue, Nigeria
              </p>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <ShieldCheck className="w-3 h-3 text-brand-green" />
                <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/40">
                  FIRS Compliant
                </span>
              </div>
            </div>
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/10 max-w-2xl mx-auto md:mx-0 leading-loose">
              Educational advisory platform. Calculations are estimates based on
              the 2024 Finance Act and Personal Income Tax Act (PITA)
              provisions. Not a substitute for certified tax consultation.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2">
            <span className="text-[0.6rem] font-bold text-white/20 uppercase tracking-[0.3em]">
              Network Integrity
            </span>
            <div className="flex items-center gap-3 text-[0.65rem] font-bold text-brand-green uppercase tracking-widest bg-brand-green/5 px-4 py-2 border border-brand-green/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              All Systems Operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

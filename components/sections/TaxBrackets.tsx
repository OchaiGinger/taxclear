"use client";

import React, { useLayoutEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const TaxBrackets = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const taxBands = [
    { income: "First ₦300,000", rate: "7%", tax: "₦21,000", status: "Base" },
    { income: "Next ₦300,000", rate: "11%", tax: "₦33,000", status: "Lower" },
    { income: "Next ₦500,000", rate: "15%", tax: "₦75,000", status: "Middle" },
    {
      income: "Next ₦500,000",
      rate: "19%",
      tax: "₦95,000",
      status: "Upper Middle",
    },
    { income: "Next ₦1,600,000", rate: "21%", tax: "₦336,000", status: "High" },
    {
      income: "Above ₦3,200,000",
      rate: "24%",
      tax: "Variable",
      status: "Top Marginal",
    },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".brackets-table",
        start: "top 80%",
        onEnter: () =>
          gsap.to(".table-row-reveal", {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
          }),
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="brackets"
      ref={rootRef}
      className="py-[15vh] px-[8%] bg-brand-dark"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <p className="section-label mb-6">Tax Brackets</p>
            <h2 className="text-4xl md:text-6xl font-headline font-bold uppercase leading-tight tracking-tight">
              Current{" "}
              <span className="font-serif italic text-brand-green">
                FIRS PAYE
              </span>{" "}
              Bands 2024–2025
            </h2>
          </div>
          <div className="p-6 bg-white/5 border border-brand-green/20 flex items-start gap-4 max-w-sm">
            <AlertTriangle className="w-5 h-5 text-brand-green shrink-0 mt-1" />
            <p className="text-[0.65rem] uppercase font-bold tracking-widest text-white/60 leading-relaxed">
              <span className="text-brand-green block mb-1">
                2024 Finance Act Update
              </span>
              Minimum threshold reviewed. Top marginal rate 24% for income above
              ₦3.2M.
            </p>
          </div>
        </div>

        <div className="brackets-table w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/30 text-[0.7rem] font-bold uppercase tracking-[0.2em]">
                <th className="text-left py-8">Annual Taxable Income</th>
                <th className="text-left py-8">Rate</th>
                <th className="text-left py-8">Tax on Band</th>
                <th className="text-right py-8">Status</th>
              </tr>
            </thead>
            <tbody>
              {taxBands.map((band, i) => (
                <tr
                  key={i}
                  className="table-row-reveal border-b border-white/5 group hover:bg-white/5 transition-colors opacity-0 translate-y-5"
                >
                  <td className="py-8 font-headline font-bold text-xl uppercase tracking-tighter">
                    {band.income}
                  </td>
                  <td className="py-8 text-brand-green font-headline font-bold text-xl">
                    {band.rate}
                  </td>
                  <td className="py-8 text-white/60 font-medium">{band.tax}</td>
                  <td className="py-8 text-right">
                    <span className="inline-block px-3 py-1 border border-white/10 text-[0.6rem] font-bold uppercase tracking-widest text-white/40">
                      {band.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

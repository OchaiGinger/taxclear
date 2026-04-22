"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */

const bars = [
  { label: "Without Reliefs", pct: "+42%", value: 42 },
  { label: "Industry Average", pct: "+31%", value: 31 },
  { label: "With Fiscora", pct: "+18%", value: 18 },
];

const layers = [
  {
    num: "Layer 1",
    title: "Identify",
    desc: "Enter BVN / Account No. / Manual Income. Secure, read-only access to verify your annual inflow.",
    items: [
      "Privacy-First Lookup",
      "NIBSS Read-Only Access",
      "Zero Data Stored",
    ],
  },
  {
    num: "Layer 2",
    title: "Compute",
    desc: "AI applies Personal Income Tax Act (PITA) brackets in real-time under the latest 2024 Finance Act updates.",
    items: [
      "2024 Finance Act Bands",
      "Effective Rate Calculation",
      "Monthly PAYE Breakdown",
    ],
  },
  {
    num: "Layer 3",
    title: "Comply",
    desc: "Receive actionable guidance on tax relief allowances to legally optimize your effective tax rate.",
    items: [
      "NHF 2.5% Deduction",
      "Pension 8% Relief",
      "Life Assurance Allowances",
    ],
  },
];

/* ─────────────────────────────────────────
   PERFORMANCE BAR
───────────────────────────────────────── */

function PerformanceBar({
  label,
  pct,
  value,
  isBest,
  progress,
}: {
  label: string;
  pct: string;
  value: number;
  isBest: boolean;
  progress: number;
}) {
  const maxBarValue = 42;
  const width = `${(value / maxBarValue) * progress * 100}%`;

  return (
    <div
      className="flex items-stretch h-18 last:border-b-0"
      style={{ borderBottom: "1px solid #bbf7d0" }}
    >
      {/* growing bar */}
      <div
        className="relative overflow-hidden flex items-center"
        style={{ width, minWidth: 0, transition: "none" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: isBest
              ? "linear-gradient(to right, #14532d, #166534, #16a34a)"
              : "#166534",
          }}
        />
        <span
          className="relative z-10 pl-5 font-black tracking-tight text-white text-2xl select-none whitespace-nowrap"
          style={{
            opacity: progress > 0.5 ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        >
          {pct}
        </span>
      </div>

      {/* label */}
      <div
        className="flex items-center px-5 shrink-0"
        style={{
          borderLeft: isBest ? "1px solid #86efac" : "1px solid #bbf7d0",
        }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: isBest ? "#166534" : "#4b7a5e" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PERFORMANCE SECTION
───────────────────────────────────────── */

function Performance() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && progress === 0) {
          startRef.current = null;
          const animate = (ts: number) => {
            if (!startRef.current) startRef.current = ts;
            const t = Math.min((ts - startRef.current) / 1600, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setProgress(eased);
            if (t < 1) rafRef.current = requestAnimationFrame(animate);
          };
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const wh = window.innerHeight;
      const raw = (wh - rect.top) / (wh + rect.height);
      setProgress((prev) => Math.max(prev, Math.min(Math.max(raw, 0), 1)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className="mb-20">
      {/* label row */}
      <div
        className="flex items-center justify-between px-0 py-4 mb-0"
        style={{ borderBottom: "1px solid #bbf7d0" }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-green-700">
          Effective Tax Rate Comparison
        </span>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#4b7a5e" }}
        >
          Source: FIRS &amp; Fiscora Analysis, 2026
        </span>
      </div>

      {/* bars */}
      <div style={{ border: "1px solid #bbf7d0", borderTop: "none" }}>
        {bars.map((b) => (
          <PerformanceBar
            key={b.label}
            {...b}
            isBest={b.label === "With Fiscora"}
            progress={progress}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STRATEGY EXPORT
───────────────────────────────────────── */

export const Strategy = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cells =
        sectionRef.current?.querySelectorAll<HTMLElement>(".strategy-cell");
      if (!cells?.length) return;

      gsap.set(cells, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () =>
          gsap.to(cells, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: { amount: 0.4, from: "start" },
          }),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="strategy"
      className="py-[12vh] px-[8%]"
      style={{ backgroundColor: "#f0fdf4" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Section header ── */}
        <div className="mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-green-600 mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-tight">
            Three layers.
            <br />
            <span className="text-green-700">Zero guesswork.</span>
          </h2>
        </div>

        {/* ── Performance bars ── */}
        <Performance />

        {/* ── 3-col strategy grid ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ border: "1px solid #bbf7d0" }}
        >
          {layers.map((layer, i) => {
            const isLastCol = (i + 1) % 3 === 0;
            const isLastRow = i >= layers.length - 3;

            return (
              <div
                key={layer.title}
                className="strategy-cell group relative flex flex-col gap-6 p-10 cursor-default"
                style={{
                  borderRight: isLastCol ? "none" : "1px solid #bbf7d0",
                  borderBottom: isLastRow ? "none" : "1px solid #bbf7d0",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background =
                    "#dcfce7")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background =
                    "transparent")
                }
              >
                {/* layer number */}
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-green-600">
                  {layer.num}
                </p>

                {/* title */}
                <h3 className="text-[1.35rem] font-black uppercase leading-tight tracking-tight text-gray-900">
                  {layer.title}
                </h3>

                {/* green rule — mirrors Security icon placement */}
                <div
                  className="w-8 h-0.5 transition-all duration-500 group-hover:w-16"
                  style={{ backgroundColor: "#166534" }}
                />

                {/* description */}
                <p className="text-gray-500 text-[13.5px] leading-relaxed">
                  {layer.desc}
                </p>

                {/* items */}
                <ul className="space-y-3 mt-auto">
                  {layer.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-700"
                    >
                      <Plus
                        className="w-3 h-3 shrink-0"
                        style={{ color: "#166534" }}
                        strokeWidth={3}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

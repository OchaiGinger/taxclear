"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const NAV_OFFSET = 72;
const VH_PER_LAYER = 120;

const layers = [
  {
    id: 0,
    tab: "LAYER 1: AWARENESS",
    title: ["HIDDEN", "BRACKETS.", "REAL", "PENALTIES."],
    description:
      "Most Nigerians have no idea which tax bracket they fall into. The 2024 Finance Act raised the top PAYE band to 24%, yet millions remain dangerously unaware.",
    features: [
      {
        title: "The Knowledge Gap",
        body: "Most workers cannot accurately state their effective tax rate, leaving them exposed to FIRS audits and compounding fines.",
      },
      {
        title: "Compounding Risk",
        body: "FIRS penalties of up to 10% on unpaid tax plus 15% interest per annum accumulate silently for every uninformed taxpayer.",
      },
    ],
    Visual: () => (
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[480px]"
      >
        <rect
          x="40"
          y="40"
          width="240"
          height="240"
          rx="24"
          fill="#111"
          stroke="#1f1f1f"
          strokeWidth="1"
        />
        <rect x="80" y="90" width="160" height="14" rx="4" fill="#222" />
        <rect x="80" y="116" width="110" height="10" rx="3" fill="#1a1a1a" />
        <rect x="80" y="152" width="160" height="8" rx="2" fill="#052e16" />
        <rect x="80" y="168" width="120" height="8" rx="2" fill="#14532d" />
        <rect x="80" y="184" width="80" height="8" rx="2" fill="#166534" />
        <rect x="80" y="200" width="40" height="8" rx="2" fill="#16a34a" />
        <circle cx="220" cy="230" r="30" fill="#22c55e" />
        <text
          x="220"
          y="235"
          textAnchor="middle"
          fill="#000"
          fontSize="18"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          !
        </text>
        <rect x="80" y="245" width="100" height="10" rx="3" fill="#222" />
      </svg>
    ),
  },
  {
    id: 1,
    tab: "LAYER 2: COMPLIANCE",
    title: ["SELF-ASSESSMENT", "IS NOW", "MANDATORY."],
    description:
      "The National Tax Policy 2024 revision mandates voluntary self-assessment for all self-employed Nigerians — with zero grace period for ignorance of the law.",
    features: [
      {
        title: "Self-Employed at Risk",
        body: "Freelancers, contractors, and business owners must now file accurate self-assessments or face escalating FIRS enforcement actions.",
      },
      {
        title: "Complex Filing Maze",
        body: "Multiple tax instruments — PAYE, VAT, WHT, and CIT — create a compliance labyrinth that most Nigerians cannot navigate alone.",
      },
    ],
    Visual: () => (
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[480px]"
      >
        <rect
          x="40"
          y="40"
          width="240"
          height="240"
          rx="24"
          fill="#111"
          stroke="#1f1f1f"
          strokeWidth="1"
        />
        <rect
          x="70"
          y="75"
          width="80"
          height="80"
          rx="8"
          fill="#052e16"
          stroke="#14532d"
          strokeWidth="1"
        />
        <text
          x="110"
          y="122"
          textAnchor="middle"
          fill="#22c55e"
          fontSize="28"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          %
        </text>
        <rect
          x="170"
          y="75"
          width="80"
          height="80"
          rx="8"
          fill="#052e16"
          stroke="#14532d"
          strokeWidth="1"
        />
        <text
          x="210"
          y="122"
          textAnchor="middle"
          fill="#22c55e"
          fontSize="24"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          ₦
        </text>
        <rect
          x="70"
          y="170"
          width="80"
          height="80"
          rx="8"
          fill="#052e16"
          stroke="#14532d"
          strokeWidth="1"
        />
        <text
          x="110"
          y="217"
          textAnchor="middle"
          fill="#22c55e"
          fontSize="22"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          VAT
        </text>
        <rect x="170" y="170" width="80" height="80" rx="8" fill="#22c55e" />
        <text
          x="210"
          y="217"
          textAnchor="middle"
          fill="#000"
          fontSize="22"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          WHT
        </text>
        <line
          x1="150"
          y1="115"
          x2="170"
          y2="115"
          stroke="#14532d"
          strokeWidth="1.5"
        />
        <line
          x1="110"
          y1="155"
          x2="110"
          y2="170"
          stroke="#14532d"
          strokeWidth="1.5"
        />
        <line
          x1="210"
          y1="155"
          x2="210"
          y2="170"
          stroke="#14532d"
          strokeWidth="1.5"
        />
        <line
          x1="150"
          y1="210"
          x2="170"
          y2="210"
          stroke="#14532d"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: 2,
    tab: "LAYER 3: CLARITY",
    title: ["KNOW YOUR", "TAX.", "OWN YOUR", "FUTURE."],
    description:
      "TaxClear gives every Nigerian instant visibility into their tax obligations, filing status, and penalty risks — in plain language, in real time.",
    features: [
      {
        title: "Real-Time Calculation",
        body: "Instantly compute your PAYE bracket, effective tax rate, and VAT exposure based on your actual income and allowable deductions.",
      },
      {
        title: "Compliance Dashboard",
        body: "Track filing deadlines, payment history, and penalty risks in one place — purpose-built for the Nigerian tax system.",
      },
    ],
    Visual: () => (
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[480px]"
      >
        <rect
          x="40"
          y="40"
          width="240"
          height="240"
          rx="24"
          fill="#111"
          stroke="#1f1f1f"
          strokeWidth="1"
        />
        <rect
          x="70"
          y="70"
          width="180"
          height="50"
          rx="8"
          fill="#052e16"
          stroke="#14532d"
          strokeWidth="1"
        />
        <text
          x="100"
          y="90"
          fill="#4ade80"
          fontSize="11"
          fontFamily="sans-serif"
        >
          Effective Tax Rate
        </text>
        <text
          x="100"
          y="108"
          fill="#22c55e"
          fontSize="18"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          17.4%
        </text>
        <rect
          x="70"
          y="132"
          width="84"
          height="42"
          rx="6"
          fill="#052e16"
          stroke="#14532d"
          strokeWidth="1"
        />
        <text
          x="112"
          y="148"
          textAnchor="middle"
          fill="#4ade80"
          fontSize="9"
          fontFamily="sans-serif"
        >
          PAYE Bracket
        </text>
        <text
          x="112"
          y="165"
          textAnchor="middle"
          fill="#22c55e"
          fontSize="13"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Tier 3
        </text>
        <rect
          x="166"
          y="132"
          width="84"
          height="42"
          rx="6"
          fill="#052e16"
          stroke="#14532d"
          strokeWidth="1"
        />
        <text
          x="208"
          y="148"
          textAnchor="middle"
          fill="#4ade80"
          fontSize="9"
          fontFamily="sans-serif"
        >
          Filing Status
        </text>
        <text
          x="208"
          y="165"
          textAnchor="middle"
          fill="#22c55e"
          fontSize="11"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          On Track
        </text>
        <rect x="70" y="186" width="180" height="10" rx="3" fill="#1a1a1a" />
        <rect x="70" y="186" width="130" height="10" rx="3" fill="#22c55e" />
        <text x="70" y="214" fill="#444" fontSize="9" fontFamily="sans-serif">
          Next filing: 31 Mar 2026
        </text>
        <rect x="70" y="224" width="180" height="26" rx="6" fill="#22c55e" />
        <text
          x="160"
          y="241"
          textAnchor="middle"
          fill="#000"
          fontSize="11"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          VIEW MY TAX SUMMARY
        </text>
      </svg>
    ),
  },
];

export const Problem = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [tabProgress, setTabProgress] = useState([0, 0, 0]);

  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const animateContentIn = () => {
    const targets = [
      ...(titleRef.current?.querySelectorAll(".title-word") ?? []),
      descRef.current,
      ...(featRef.current?.querySelectorAll(".feat-item") ?? []),
      visualRef.current,
    ].filter(Boolean) as Element[];

    gsap.fromTo(
      targets,
      { opacity: 0, y: 36, filter: "blur(14px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "filter",
      },
    );
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words =
        heroRef.current?.querySelectorAll<HTMLElement>(".hero-word");
      if (!words?.length) return;
      gsap.set(words, { opacity: 0, y: 28, filter: "blur(18px)" });
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top 75%",
        onEnter: () =>
          gsap.to(words, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.09,
            clearProps: "filter",
          }),
        onLeaveBack: () =>
          gsap.set(words, { opacity: 0, y: 28, filter: "blur(18px)" }),
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const total = layers.length;
      ScrollTrigger.create({
        trigger: pinnedRef.current,
        start: `top ${NAV_OFFSET}px`,
        end: `+=${total * VH_PER_LAYER}vh`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate(self) {
          const raw = self.progress * total;
          const newIdx = Math.min(total - 1, Math.floor(raw));
          const segPct = (raw - newIdx) * 100;
          setTabProgress(
            layers.map((_, i) =>
              i < newIdx ? 100 : i === newIdx ? Math.round(segPct) : 0,
            ),
          );
          setActiveIdx((prev) => (prev !== newIdx ? newIdx : prev));
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    animateContentIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const active = layers[activeIdx];
  const { Visual } = active;

  return (
    <section ref={rootRef} className="bg-black">
      {/* ════ HERO ════ */}
      <div
        ref={heroRef}
        className="min-h-screen flex flex-col justify-center px-[8%] py-[10vh]"
      >
        <div className="max-w-[1280px] mx-auto w-full">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-green-500 mb-10">
            Controlled
          </p>
          <h2 className="text-[clamp(3rem,9vw,8rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            {["THREE", "LAYERS."].map((w) => (
              <span key={w} className="hero-word inline-block mr-[0.22em]">
                {w}
              </span>
            ))}
          </h2>
          <h2 className="text-[clamp(3rem,9vw,8rem)] font-black uppercase leading-[0.95] tracking-tight mt-1">
            <span className="hero-word inline-block mr-[0.22em] text-white">
              ONE
            </span>
            <span className="hero-word inline-block text-green-400">
              BLINDSPOT.
            </span>
          </h2>
          <p className="mt-10 text-white/35 text-lg leading-relaxed max-w-[500px]">
            Our diagnostic approach exposes your hidden tax risk across every
            layer of Nigeria's tax system.
          </p>
        </div>
      </div>

      {/* ════ PINNED PANEL ════ */}
      <div
        ref={pinnedRef}
        className="flex flex-col bg-black"
        style={{ height: "100vh" }}
      >
        {/* Tab bar */}
        <div className="shrink-0 border-t border-b border-white/10 px-[8%]">
          <div className="max-w-[1280px] mx-auto flex divide-x divide-white/10">
            {layers.map((layer, i) => {
              const pct = tabProgress[i];
              const hasStarted = pct > 0;
              return (
                <button
                  key={layer.id}
                  className="relative flex-1 flex items-center justify-between px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] cursor-default overflow-hidden"
                >
                  <span
                    className="absolute inset-0 bg-green-500 pointer-events-none"
                    style={{ width: `${pct}%` }}
                  />
                  <span
                    className="relative z-10 transition-colors duration-100"
                    style={{
                      color: hasStarted ? "#000" : "rgba(255,255,255,0.22)",
                    }}
                  >
                    {layer.tab}
                  </span>
                  <ArrowRight
                    className="relative z-10 w-3.5 h-3.5 shrink-0 transition-colors duration-100"
                    style={{
                      color: hasStarted ? "#000" : "rgba(255,255,255,0.12)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center px-[8%] py-6">
          <div className="max-w-[1280px] mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              {/* ↓ Headline: was clamp(2.4rem,4.5vw,4rem) → now clamp(1.6rem,3vw,2.6rem) */}
              <div ref={titleRef} className="mb-4">
                {active.title.map((word) => (
                  <span
                    key={word}
                    className="title-word block font-black uppercase tracking-tight text-white"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.6rem)",
                      lineHeight: 1.05,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>

              {/* ↓ Description: was text-[15px] → now text-[13px] */}
              <p
                ref={descRef}
                className="text-white/40 leading-relaxed mb-5"
                style={{ fontSize: "13px" }}
              >
                {active.description}
              </p>

              <div ref={featRef} className="space-y-4">
                {active.features.map((feat) => (
                  <div key={feat.title} className="feat-item flex gap-4">
                    {/* ↓ Icon circle: was w-9 h-9 → now w-7 h-7 */}
                    <div className="mt-[2px] w-7 h-7 rounded-full border border-white/10 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                    <div>
                      {/* ↓ Feature title: was text-[15px] → now text-[13px] */}
                      <h4
                        className="font-bold text-white mb-1"
                        style={{ fontSize: "13px" }}
                      >
                        {feat.title}
                      </h4>
                      {/* ↓ Feature body: was text-sm (14px) → now text-[12px] */}
                      <p
                        className="text-white/40 leading-relaxed"
                        style={{ fontSize: "12px" }}
                      >
                        {feat.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: visual */}
            <div ref={visualRef} className="flex items-center justify-center">
              <Visual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

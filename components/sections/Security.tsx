"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const items = [
  {
    title: "END-TO-END\nENCRYPTION",
    desc: "256-bit AES encryption as standard. We process data using read-only NIBSS protocols. Your BVN is never stored on our servers.",
    Icon: () => (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
      >
        <rect
          x="20"
          y="34"
          width="40"
          height="30"
          rx="4"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <path
          d="M28 34v-8a12 12 0 0124 0v8"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="49" r="4" stroke="#166534" strokeWidth="1.2" />
        <line
          x1="40"
          y1="53"
          x2="40"
          y2="58"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "FIRS & CBN\nCOMPLIANT",
    desc: "Operates strictly under NTP 2024 and CBN Open Banking guidelines. FCCPC registered and verified for financial advisory services.",
    Icon: () => (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
      >
        <circle cx="40" cy="40" r="22" stroke="#166534" strokeWidth="1.2" />
        <path
          d="M28 40a56 56 0 0024 0M28 40a56 56 0 000-10M28 40a56 56 0 000 10M52 40a56 56 0 01-24 0M52 40a56 56 0 000-10M52 40a56 56 0 010 10"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <line
          x1="40"
          y1="18"
          x2="40"
          y2="62"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <line
          x1="18"
          y1="40"
          x2="62"
          y2="40"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <circle
          cx="54"
          cy="26"
          r="8"
          fill="#f0fdf4"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <path
          d="M50.5 26l2.5 2.5 4-4"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "ZERO DATA\nRETENTION",
    desc: "All computations happen in-memory. Once you close your session, all data is purged instantly. No user database, no persistent identity.",
    Icon: () => (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
      >
        <rect
          x="22"
          y="22"
          width="36"
          height="36"
          rx="3"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <rect
          x="28"
          y="28"
          width="10"
          height="10"
          rx="1"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <rect
          x="42"
          y="28"
          width="10"
          height="10"
          rx="1"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <rect
          x="28"
          y="42"
          width="10"
          height="10"
          rx="1"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <rect
          x="42"
          y="42"
          width="10"
          height="10"
          rx="1"
          fill="#166534"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <path
          d="M48 48l-6-6M42 48l6-6"
          stroke="#f0fdf4"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "REAL-TIME\nMONITORING",
    desc: "Live tax liability tracking as income changes. Instant alerts when approaching bracket thresholds or filing deadlines under the NTP framework.",
    Icon: () => (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
      >
        <rect
          x="18"
          y="26"
          width="44"
          height="30"
          rx="3"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <polyline
          points="26,46 32,38 38,42 46,32 54,36"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="54" cy="36" r="2.5" fill="#166534" />
        <line
          x1="30"
          y1="60"
          x2="50"
          y2="60"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="56"
          x2="40"
          y2="60"
          stroke="#166534"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    title: "OPEN BANKING\nINTEGRATION",
    desc: "Connects to CBN-licensed open banking APIs with OAuth 2.0. Read-only access with revocable consent. No credentials ever leave your device.",
    Icon: () => (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
      >
        <rect
          x="14"
          y="30"
          width="22"
          height="24"
          rx="3"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <rect
          x="44"
          y="26"
          width="22"
          height="28"
          rx="3"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <path
          d="M36 42h8"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M41 38l4 4-4 4"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="25" cy="40" r="3" stroke="#166534" strokeWidth="1.2" />
        <circle cx="55" cy="40" r="3" stroke="#166534" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    title: "AUDIT-READY\nREPORTS",
    desc: "Generates FIRS-compliant tax computation sheets and self-assessment forms. Exportable as PDF. Accepted as supporting documentation for FIRS queries.",
    Icon: () => (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
      >
        <rect
          x="22"
          y="16"
          width="28"
          height="36"
          rx="2"
          stroke="#166534"
          strokeWidth="1.2"
        />
        <path d="M22 28h28" stroke="#166534" strokeWidth="1.2" />
        <line
          x1="28"
          y1="34"
          x2="44"
          y2="34"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="28"
          y1="39"
          x2="40"
          y2="39"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="28"
          y1="44"
          x2="36"
          y2="44"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M34 52l4 10 4-4 4 6"
          stroke="#166534"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="52" r="2" fill="#166534" />
      </svg>
    ),
  },
];

export const Security = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered grid reveal — each cell fades + slides up
      const cells =
        sectionRef.current?.querySelectorAll<HTMLElement>(".grid-cell");
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
            stagger: {
              amount: 0.5,
              grid: [2, 3],
              from: "start",
            },
          }),
      });

      // Icon subtle float on hover — delegated via JS for performance
      cells.forEach((cell) => {
        const icon = cell.querySelector<HTMLElement>(".cell-icon");
        if (!icon) return;
        cell.addEventListener("mouseenter", () =>
          gsap.to(icon, { y: -6, duration: 0.35, ease: "power2.out" }),
        );
        cell.addEventListener("mouseleave", () =>
          gsap.to(icon, { y: 0, duration: 0.45, ease: "power2.inOut" }),
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="security"
      // Very light green background — matches the near-white tint in the reference image
      style={{ backgroundColor: "#f0fdf4" }}
      className="py-[12vh] px-[8%]"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Section header ── */}
        <div className="mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-green-600 mb-4">
            Institutional Grade
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-tight">
            Built on trust.
            <br />
            <span className="text-green-600">Verified by design.</span>
          </h2>
        </div>

        {/* ── 3 × 2 bordered grid ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{
            border: "1px solid #bbf7d0",
          }}
        >
          {items.map((item, i) => {
            const { Icon } = item;
            const isLastRow = i >= 3;
            const isLastCol = (i + 1) % 3 === 0;
            return (
              <div
                key={item.title}
                className="grid-cell group relative flex flex-col gap-8 p-10 cursor-default"
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
                {/* Icon */}
                <div className="cell-icon">
                  <Icon />
                </div>

                {/* Title */}
                <h3 className="text-[1.35rem] font-black uppercase leading-tight tracking-tight text-gray-900 whitespace-pre-line">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-[13.5px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

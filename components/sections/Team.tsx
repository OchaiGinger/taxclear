"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const members = [
  {
    name: "Ogo Rex",
    role: "Chief Executive Officer",
    initials: "OR",
    image: "/images/team/ogo_rex.jpeg",
    bio: "Visionary leader driving Nigeria's next generation of compliant, intelligent tax infrastructure.",
  },
  {
    name: "Lawal Charity",
    role: "Operations Manager",
    initials: "LC",
    image: "/images/team/lawal_charity.jpeg",
    bio: "Orchestrates seamless day-to-day operations ensuring every user interaction meets institutional standards.",
  },
  {
    name: "Akpan Rawlings",
    role: "Head of Engineering", // ← update role as needed
    initials: "AR",
    image: "/images/team/akpan_rawlings.jpeg",
    bio: "Architects the secure, real-time infrastructure powering every computation on the platform.",
  },
];

const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="4"
      stroke="#4ade80"
      strokeWidth="1.4"
    />
    <path
      d="M7 10v7M7 7v.5"
      stroke="#4ade80"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M11 17v-3.5c0-1.5 1-2.5 2.5-2.5S16 12 16 13.5V17M11 10v7"
      stroke="#4ade80"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TEXTURE_BG = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%2322c55e' fill-opacity='0.08'/%3E%3C/svg%3E")`;

export const Team = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const header =
        sectionRef.current?.querySelector<HTMLElement>(".team-header");
      const cards =
        sectionRef.current?.querySelectorAll<HTMLElement>(".team-card");
      const line =
        sectionRef.current?.querySelector<HTMLElement>(".header-line");

      if (!cards?.length) return;

      if (line) gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(cards, { opacity: 0, y: 48 });
      if (header) gsap.set(header, { opacity: 0, y: 24 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 72%",
        onEnter: () => {
          const tl = gsap.timeline();
          if (header)
            tl.to(header, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
            });
          if (line)
            tl.to(
              line,
              { scaleX: 1, duration: 0.6, ease: "power3.out" },
              "-=0.3",
            );
          tl.to(
            cards,
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power3.out",
              stagger: { amount: 0.4, from: "start" },
            },
            "-=0.2",
          );
        },
      });

      cards.forEach((card) => {
        const photo = card.querySelector<HTMLElement>(".team-photo-wrap");
        const nameLine = card.querySelector<HTMLElement>(".team-name-line");
        if (!photo || !nameLine) return;

        card.addEventListener("mouseenter", () => {
          gsap.to(photo, { scale: 1.05, duration: 0.38, ease: "power2.out" });
          gsap.to(nameLine, {
            width: "100%",
            duration: 0.4,
            ease: "power2.out",
          });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(photo, { scale: 1, duration: 0.42, ease: "power2.inOut" });
          gsap.to(nameLine, {
            width: "32px",
            duration: 0.38,
            ease: "power2.inOut",
          });
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="team"
      style={{
        backgroundColor: "#0c1f0f",
        backgroundImage: TEXTURE_BG,
        backgroundSize: "28px 28px",
      }}
      className="py-[12vh] px-[8%] relative overflow-hidden"
    >
      {/* Radial glow — top center */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(34,197,94,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── Section header ── */}
        <div className="team-header mb-16">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.28em] mb-4"
            style={{ color: "#4ade80" }}
          >
            The People Behind It
          </p>
          <h2
            className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6"
            style={{ color: "#f0fdf4" }}
          >
            Led by experts.
            <br />
            <span style={{ color: "#4ade80" }}>Driven by purpose.</span>
          </h2>
          <div
            className="header-line"
            style={{
              height: "1.5px",
              width: "64px",
              backgroundColor: "#4ade80",
            }}
          />
        </div>

        {/* ── 3-column grid — gap acts as border ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ background: "rgba(74,222,128,0.15)" }}
        >
          {members.map((member) => (
            <div
              key={member.name}
              className="team-card relative flex flex-col p-10 cursor-default overflow-hidden"
              style={{
                background: "#0f2812",
                transition: "background 0.35s ease",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "#122e14")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "#0f2812")
              }
            >
              {/* Corner bracket — top left */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "40px",
                  height: "40px",
                  borderTop: "1.5px solid rgba(74,222,128,0.3)",
                  borderLeft: "1.5px solid rgba(74,222,128,0.3)",
                  pointerEvents: "none",
                }}
              />

              {/* Photo */}
              <div
                className="team-photo-wrap mb-8"
                style={{
                  width: "86px",
                  height: "86px",
                  borderRadius: "4px",
                  border: "1.5px solid rgba(74,222,128,0.25)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.style.cssText +=
                        ";display:flex;align-items:center;justify-content:center;background:rgba(74,222,128,0.08)";
                      target.style.display = "none";
                      const span = document.createElement("span");
                      span.textContent = member.initials;
                      span.style.cssText =
                        "font-size:1.4rem;font-weight:900;color:#4ade80;letter-spacing:0.06em;";
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>

              {/* Name */}
              <h3
                className="text-[1.25rem] font-black uppercase tracking-tight leading-tight"
                style={{ color: "#f0fdf4" }}
              >
                {member.name}
              </h3>

              {/* Animated underline */}
              <div
                className="team-name-line"
                style={{
                  height: "1.5px",
                  width: "32px",
                  backgroundColor: "#4ade80",
                  marginTop: "8px",
                  marginBottom: "14px",
                  transition: "width 0.38s ease",
                }}
              />

              {/* Role */}
              <p
                className="text-[10.5px] font-bold uppercase tracking-[0.24em] mb-6"
                style={{ color: "#86efac" }}
              >
                {member.role}
              </p>

              {/* Bio */}
              <p
                className="text-[13.5px] leading-relaxed flex-1"
                style={{ color: "rgba(240,253,244,0.52)" }}
              >
                {member.bio}
              </p>

              {/* Connect */}
              <div
                className="mt-8 pt-6"
                style={{ borderTop: "1px solid rgba(74,222,128,0.15)" }}
              >
                <a
                  href="#"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#4ade80",
                    textDecoration: "none",
                    opacity: 1,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.opacity =
                      "0.65")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
                  }
                >
                  <LinkedInIcon />
                  Connect
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

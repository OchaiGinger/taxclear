"use client";

import React, { useLayoutEffect, useRef } from "react";
import { CalculatorDialog } from "@/components/CalculatorDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import gsap from "gsap";
import Autoplay from "embla-carousel-autoplay";

export const Hero = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        clipPath: "inset(100% 0 0 0)",
        duration: 1.1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2,
      });

      gsap.from(".hero-fade", {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.12,
        delay: 0.8,
        ease: "power3.out",
      });

      gsap.from(".deco-sq", {
        opacity: 0,
        scale: 0,
        duration: 0.45,
        stagger: 0.07,
        delay: 0.35,
        ease: "back.out(2)",
        transformOrigin: "center center",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-brand-black pt-20"
    >
      {/* ── Background Slider & Three.js ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-brand-black/80 via-brand-black/40 to-brand-black z-10" />
        {/* <ThreeHero /> */}

        <Carousel
          plugins={[plugin.current]}
          className="w-full h-full"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent className="h-full ml-0">
            {/* Video Slide */}
            <CarouselItem className="relative h-screen w-full pl-0 bg-brand-dark flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-50"
                >
                  <source
                    src="https://assets.mixkit.co/videos/preview/mixkit-financial-charts-and-data-on-a-monitor-screen-34533-large.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>
            </CarouselItem>

            {/* Image Slides */}
            {PlaceHolderImages.map(
              (img: {
                id: string;
                imageUrl: string;
                description: string;
                imageHint: string;
              }) => (
                <CarouselItem
                  key={img.id}
                  className="relative h-screen w-full pl-0"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.description}
                    fill
                    className="object-cover opacity-50"
                    priority
                    data-ai-hint={img.imageHint}
                  />
                </CarouselItem>
              ),
            )}
          </CarouselContent>
        </Carousel>
      </div>

      {/* ── Floating decorative squares ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
      >
        <div
          className="deco-sq absolute w-3 h-3"
          style={{ background: "#0E713E", top: "21%", left: "5.5%" }}
        />
        <div
          className="deco-sq absolute w-5 h-5"
          style={{ background: "#0E713E", top: "50%", left: "27%" }}
        />
        <div
          className="deco-sq absolute w-2 h-2 rounded-full"
          style={{ background: "#0E713E", top: "13%", left: "52%" }}
        />
        <div
          className="deco-sq absolute w-6 h-6"
          style={{ background: "#0E713E", top: "22%", right: "5.5%" }}
        />
      </div>

      {/* ── Centered Content ── */}
      <div className="relative z-30 flex flex-col items-center text-center px-6 max-w-6xl mx-auto">
        <p className="hero-fade section-label mb-6">FIRS Compliant Analysis</p>
        <h1 className="w-full mb-10" style={{ lineHeight: 0.9 }}>
          <div className="hero-line overflow-hidden">
            <span className="block font-black uppercase tracking-[-0.03em] text-white text-[clamp(2.5rem,8vw,6rem)]">
              Master Your
            </span>
          </div>
          <div className="hero-line overflow-hidden">
            <span className="block font-black uppercase tracking-[-0.03em] text-white text-[clamp(2.5rem,8vw,6rem)]">
              Tax{" "}
              <span className="font-serif italic text-brand-green">
                Liability
              </span>
            </span>
          </div>
          <div className="hero-line overflow-hidden">
            <span className="block font-black uppercase tracking-[-0.03em] text-white text-[clamp(2.5rem,8vw,6rem)]">
              In Real-Time.
            </span>
          </div>
        </h1>

        <div className="hero-fade max-w-2xl mb-12">
          <p className="text-white/60 text-lg md:text-xl uppercase font-medium tracking-tight">
            The definitive Nigerian tax clarity tool for the 2024 Finance Act.
            Secure, anonymous, and institutional grade.
          </p>
        </div>

        <div className="hero-fade">
          <CalculatorDialog>
            <button className="group flex items-center gap-6 h-16 pl-10 pr-4 font-black uppercase tracking-[0.14em] text-[0.8rem] transition-all duration-300 bg-brand-green text-white hover:bg-white hover:text-black border border-brand-green">
              Check My Tax — Free
              <span className="flex items-center gap-2">
                <span className="opacity-40 text-[0.5rem] group-hover:opacity-100 transition-opacity">
                  ●
                </span>
                <span className="w-10 h-10 flex items-center justify-center text-sm border border-white/20 group-hover:border-black/20">
                  ↗
                </span>
              </span>
            </button>
          </CalculatorDialog>
        </div>
      </div>

      {/* ── Stats strip at bottom ── */}
      <div className="hero-fade absolute bottom-0 left-0 w-full z-30 bg-brand-black/80 backdrop-blur-md border-t border-white/5">
        <div className="grid grid-cols-3">
          {[
            { val: "50K+", lbl: "Nigerians Helped" },
            { val: "3s", lbl: "Avg. Calculation Time" },
            { val: "100%", lbl: "FIRS Compliant" },
          ].map(({ val, lbl }, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-8 gap-1 border-r border-white/5 last:border-r-0"
            >
              <span className="text-[1.8rem] md:text-[2.2rem] font-black tracking-[-0.04em] leading-none text-brand-green">
                {val}
              </span>
              <span className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-white/30">
                {lbl}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

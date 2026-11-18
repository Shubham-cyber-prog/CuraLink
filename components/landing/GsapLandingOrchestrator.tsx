"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP + ScrollTrigger Landing Page Choreography Engine:
 * - Scrubbed top reading progress bar
 * - Smooth 3D perspective scroll-scrub on the Hero WebRTC stage
 * - Scroll-triggered cinematic reveals across every landing section
 * - Subtle scrubbed parallax on floating cards
 */
export function GsapLandingOrchestrator({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Scrubbed Top Scroll Progress Bar
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.25,
          },
        });
      }

      // 2. Hero WebRTC Stage 3D Perspective Scroll-Scrub
      const heroStage = containerRef.current?.querySelector("[data-gsap-hero-stage]");
      if (heroStage) {
        gsap.fromTo(
          heroStage,
          {
            rotateX: 7,
            scale: 0.96,
            transformPerspective: 1400,
            transformOrigin: "center top",
          },
          {
            rotateX: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: heroStage,
              start: "top 90%",
              end: "top 25%",
              scrub: 0.7,
            },
          }
        );
      }

      // 3. Section-by-Section Smooth GSAP ScrollTrigger Reveals
      const revealSections = gsap.utils.toArray<HTMLElement>("[data-gsap-reveal]");
      revealSections.forEach((section) => {
        gsap.fromTo(
          section,
          {
            y: 44,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: section,
              start: "top 86%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      });

      // 4. Floating Parallax Depth Elements
      const parallaxEls = gsap.utils.toArray<HTMLElement>("[data-gsap-parallax]");
      parallaxEls.forEach((el) => {
        const speed = Number(el.dataset.gsapParallax || "35");
        gsap.to(el, {
          y: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-1 flex-col">
      {/* GSAP Scrubbed Scroll Progress Bar */}
      <div
        ref={progressRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#006D77] via-[#83C5BE] to-emerald-400 pointer-events-none"
      />
      {children}
    </div>
  );
}

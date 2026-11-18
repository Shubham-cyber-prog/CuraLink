"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Activity,
  FileText,
  ShieldCheck,
  ArrowRight,
  Move3d,
} from "lucide-react";

interface ModuleItem {
  id: string;
  title: string;
  tag: string;
  desc: string;
  metric: string;
  metricLabel: string;
  colorHex: number;
  accentClass: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULES: ModuleItem[] = [
  {
    id: "video",
    title: "HD WebRTC Telehealth",
    tag: "Sub-2 Minute Connect",
    desc: "Direct browser-native 1080p video consultations with NMC-verified Indian doctors. Zero downloads, end-to-end 256-bit AES encrypted.",
    metric: "1080p • 60fps",
    metricLabel: "Encrypted Clinical Stream",
    colorHex: 0x006d77,
    accentClass: "text-[#83C5BE]",
    href: "/find-doctor",
    icon: Video,
  },
  {
    id: "ai",
    title: "AI Symptom & Risk Engine",
    tag: "Clinical Triage",
    desc: "Instant bilingual symptom pre-assessment and Framingham cardiovascular risk scoring that routes you to the exact right specialist.",
    metric: "98.4%",
    metricLabel: "Triage Routing Accuracy",
    colorHex: 0x10b981,
    accentClass: "text-emerald-300",
    href: "/symptom-checker",
    icon: Activity,
  },
  {
    id: "rx",
    title: "NMC Digital E-Prescriptions",
    tag: "ABDM Ready",
    desc: "SHA-256 digitally signed prescriptions with QR pharmacy verification, dosage schedules, and instant PDF downloads valid pan-India.",
    metric: "100%",
    metricLabel: "Pharmacy Acceptance",
    colorHex: 0x38bdf8,
    accentClass: "text-sky-300",
    href: "/records",
    icon: FileText,
  },
  {
    id: "vault",
    title: "Continuous Vitals Telemetry",
    tag: "Real-Time Monitoring",
    desc: "Track blood pressure, glucose, SpO2, and heart rate trends over time with automated clinical deterioration alerts shared with your doctor.",
    metric: "24/7",
    metricLabel: "Trend & Alert Sync",
    colorHex: 0x83c5be,
    accentClass: "text-[#83C5BE]",
    href: "/vitals",
    icon: ShieldCheck,
  },
];

export function ThreeMedicalShowcase() {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeColorRef = useRef<number>(MODULES[0].colorHex);
  const boostSpinRef = useRef<number>(0);

  const activeModule = MODULES[activeIndex];

  useEffect(() => {
    activeColorRef.current = activeModule.colorHex;
    boostSpinRef.current = 0.08;
  }, [activeModule.colorHex]);

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 420;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x83c5be, 26, 35);
    keyLight.position.set(5, 5, 7);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x006d77, 22, 35);
    rimLight.position.set(-5, -4, 5);
    scene.add(rimLight);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Central Sculpted Bio-TorusKnot Core
    const knotGeo = new THREE.TorusKnotGeometry(1.45, 0.38, 160, 28, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0x006d77,
      emissive: 0x003f45,
      emissiveIntensity: 0.45,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    coreGroup.add(knotMesh);

    // Outer Holographic Wireframe Shell
    const shellGeo = new THREE.IcosahedronGeometry(2.55, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x83c5be,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    coreGroup.add(shellMesh);

    // Dual Orbiting Telemetry Rings + Glowing Satellites
    const orbitGeo1 = new THREE.TorusGeometry(3.05, 0.022, 12, 100);
    const orbitGeo2 = new THREE.TorusGeometry(3.45, 0.016, 12, 100);
    const orbitMat1 = new THREE.MeshBasicMaterial({
      color: 0x83c5be,
      transparent: true,
      opacity: 0.4,
    });
    const orbitMat2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });

    const orbit1 = new THREE.Mesh(orbitGeo1, orbitMat1);
    orbit1.rotation.set(Math.PI / 2.4, 0.35, 0);

    const orbit2 = new THREE.Mesh(orbitGeo2, orbitMat2);
    orbit2.rotation.set(-Math.PI / 2.8, -0.45, 0.2);

    const satGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0x83c5be,
      emissive: 0x83c5be,
      emissiveIntensity: 0.9,
    });

    const sat1 = new THREE.Mesh(satGeo, satMat);
    const sat2 = new THREE.Mesh(satGeo, satMat);
    orbit1.add(sat1);
    orbit2.add(sat2);
    sat1.position.set(3.05, 0, 0);
    sat2.position.set(-3.45, 0, 0);

    coreGroup.add(orbit1, orbit2);

    // Interactive Drag & Hover Rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
        velX = nx * 0.04;
        velY = ny * 0.04;
        return;
      }
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      coreGroup.rotation.y += dx * 0.008;
      coreGroup.rotation.x += dy * 0.008;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);

    const targetColor = new THREE.Color(activeColorRef.current);
    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      targetColor.setHex(activeColorRef.current);
      knotMat.color.lerp(targetColor, 0.05);
      keyLight.color.lerp(targetColor, 0.05);

      boostSpinRef.current *= 0.94;
      const spinSpeed = 0.005 + boostSpinRef.current;

      if (!isDragging) {
        coreGroup.rotation.y += spinSpeed + velX * 0.25;
        coreGroup.rotation.x += (velY * 0.25 - coreGroup.rotation.x * 0.01);
      }

      knotMesh.rotation.z = t * 0.22;
      const pulse = 1 + Math.sin(t * 2.2) * 0.03;
      knotMesh.scale.setScalar(pulse);

      shellMesh.rotation.y = -t * 0.18;
      shellMesh.rotation.x = t * 0.1;

      orbit1.rotation.z = t * 0.7;
      orbit2.rotation.z = -t * 0.55;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      knotGeo.dispose();
      knotMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      orbitGeo1.dispose();
      orbitGeo2.dispose();
      orbitMat1.dispose();
      orbitMat2.dispose();
      satGeo.dispose();
      satMat.dispose();
      renderer.dispose();
      if (dom.parentNode === container) {
        container.removeChild(dom);
      }
    };
  }, []);

  const ActiveIcon = activeModule.icon;

  return (
    <section
      data-gsap-reveal
      className="relative py-20 sm:py-28 overflow-hidden bg-[#071320] text-white"
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_30%_50%,rgba(0,109,119,0.24),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#83C5BE] mb-2">
              Interactive 3D Clinical Architecture
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              One connected engine for modern care.
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-[#83C5BE] self-start md:self-auto">
            <Move3d className="h-3.5 w-3.5" />
            <span>Drag 3D core to rotate</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Live Three.js Interactive 3D Viewport */}
          <div className="lg:col-span-6 relative rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0B1F33]/90 to-[#06101B]/95 shadow-[0_24px_70px_rgba(0,0,0,0.45)] overflow-hidden">
            <div
              ref={canvasWrapRef}
              className="h-[360px] sm:h-[430px] w-full cursor-grab active:cursor-grabbing"
            />
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/60">
              <span className="rounded-full bg-black/35 backdrop-blur-md border border-white/10 px-3 py-1">
                WebGL 3D Core • 60 FPS
              </span>
              <span className="rounded-full bg-black/35 backdrop-blur-md border border-white/10 px-3 py-1 text-[#83C5BE]">
                {activeModule.metric}
              </span>
            </div>
          </div>

          {/* RIGHT: Framer Motion Interactive Controls + Live Spec Card */}
          <div className="lg:col-span-6 space-y-5">
            {/* Module Selector Pills */}
            <div className="grid grid-cols-2 gap-2.5">
              {MODULES.map((mod, idx) => {
                const Icon = mod.icon;
                const isActive = idx === activeIndex;
                return (
                  <motion.button
                    key={mod.id}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveIndex(idx)}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-[#83C5BE]/60 bg-white/10 shadow-[0_8px_24px_-6px_rgba(0,109,119,0.4)]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isActive ? "bg-[#006D77] text-white" : "bg-white/10 text-[#83C5BE]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{mod.title}</p>
                      <p className="text-[11px] text-white/55 truncate">{mod.tag}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Active Module Detail Card with Framer Motion spring swap */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule.id}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="rounded-[24px] border border-white/12 bg-white/[0.05] backdrop-blur-xl p-6 sm:p-7 space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#006D77] text-white shadow-md">
                      <ActiveIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${activeModule.accentClass}`}>
                        {activeModule.tag}
                      </span>
                      <h3 className="font-serif text-2xl text-white mt-0.5">
                        {activeModule.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-white/75 leading-relaxed">
                  {activeModule.desc}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-2xl font-bold text-white font-mono">
                      {activeModule.metric}
                    </p>
                    <p className="text-xs text-white/55">{activeModule.metricLabel}</p>
                  </div>

                  <Link
                    href={activeModule.href}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#0A8896] text-sm font-medium text-white shadow-md transition-all"
                  >
                    <span>Explore Module</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

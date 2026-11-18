"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Interactive Three.js WebGL Hero Scene:
 * - Twin 3D DNA Double-Helix molecular strands flanking the hero
 * - Floating 3D bio-network particle field
 * - Translucent orbiting geometric rings
 * - Real-time mouse 3D parallax + scroll depth drift
 */
export function ThreeHeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

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

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 820;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    // Lighting — Royal Teal (#006D77), Soft Aqua (#83C5BE), Deep Navy (#0B1F33)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const tealLight = new THREE.PointLight(0x006d77, 18, 45);
    tealLight.position.set(-10, 6, 10);
    scene.add(tealLight);

    const aquaLight = new THREE.PointLight(0x83c5be, 14, 45);
    aquaLight.position.set(10, -4, 12);
    scene.add(aquaLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Helper: build a 3D DNA Double Helix
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    const sphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const barGeo = new THREE.CylinderGeometry(0.032, 0.032, 1, 8);
    geometries.push(sphereGeo, barGeo);

    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x006d77,
      emissive: 0x004b52,
      emissiveIntensity: 0.45,
      metalness: 0.35,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    const aquaMat = new THREE.MeshStandardMaterial({
      color: 0x83c5be,
      emissive: 0x2d8a82,
      emissiveIntensity: 0.35,
      metalness: 0.25,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
    });

    const rungMat = new THREE.MeshStandardMaterial({
      color: 0x83c5be,
      transparent: true,
      opacity: 0.32,
      metalness: 0.2,
      roughness: 0.4,
    });
    materials.push(tealMat, aquaMat, rungMat);

    const createHelix = (xPos: number, zTilt: number) => {
      const helix = new THREE.Group();
      const turns = 26;
      const radius = 1.45;
      const spacing = 0.56;

      for (let i = 0; i < turns; i++) {
        const angle = i * 0.44;
        const y = (i - turns / 2) * spacing;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        const node1 = new THREE.Mesh(sphereGeo, i % 2 === 0 ? tealMat : aquaMat);
        node1.position.set(x1, y, z1);
        helix.add(node1);

        const node2 = new THREE.Mesh(sphereGeo, i % 2 === 0 ? aquaMat : tealMat);
        node2.position.set(x2, y, z2);
        helix.add(node2);

        if (i % 2 === 0) {
          const p1 = new THREE.Vector3(x1, y, z1);
          const p2 = new THREE.Vector3(x2, y, z2);
          const dist = p1.distanceTo(p2);
          const bar = new THREE.Mesh(barGeo, rungMat);
          bar.scale.set(1, dist, 1);
          bar.position.copy(p1).add(p2).multiplyScalar(0.5);
          bar.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            p2.clone().sub(p1).normalize()
          );
          helix.add(bar);
        }
      }

      helix.position.set(xPos, 0.5, -2.5);
      helix.rotation.z = zTilt;
      return helix;
    };

    const leftHelix = createHelix(-9.2, 0.24);
    const rightHelix = createHelix(9.2, -0.24);
    rootGroup.add(leftHelix, rightHelix);

    // Wireframe Orbital Rings (subtle geometric luxury depth)
    const ringGeo1 = new THREE.TorusGeometry(6.8, 0.02, 12, 100);
    const ringGeo2 = new THREE.TorusGeometry(9.4, 0.015, 12, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x006d77,
      transparent: true,
      opacity: 0.14,
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x83c5be,
      transparent: true,
      opacity: 0.16,
    });
    geometries.push(ringGeo1, ringGeo2);
    materials.push(ringMat, ringMat2);

    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    ring1.rotation.set(Math.PI / 2.6, 0.3, 0);
    ring1.position.set(0, 1.5, -6);

    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.set(Math.PI / 3.1, -0.4, 0.2);
    ring2.position.set(0, 1.2, -7);

    rootGroup.add(ring1, ring2);

    // Floating Bio-Network Particles
    const particleCount = 190;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x006d77,
      size: 0.095,
      transparent: true,
      opacity: 0.42,
    });
    geometries.push(particlesGeo);
    materials.push(particlesMat);

    const particles = new THREE.Points(particlesGeo, particlesMat);
    rootGroup.add(particles);

    // Smooth pointer & scroll tracking
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };
    let scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY || 0;
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 820;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp mouse parallax
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04;

      leftHelix.rotation.y = elapsed * 0.35;
      rightHelix.rotation.y = -elapsed * 0.32;
      leftHelix.position.y = 0.5 + Math.sin(elapsed * 0.8) * 0.35;
      rightHelix.position.y = 0.5 + Math.cos(elapsed * 0.8) * 0.35;

      ring1.rotation.z = elapsed * 0.12;
      ring2.rotation.z = -elapsed * 0.09;
      particles.rotation.y = elapsed * 0.03;

      // Camera responds smoothly to mouse + scroll
      camera.position.x = currentMouse.x * 1.1;
      camera.position.y = -currentMouse.y * 0.7 - Math.min(scrollY * 0.004, 3);
      camera.lookAt(0, 0, -2);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-85 dark:opacity-75"
    />
  );
}

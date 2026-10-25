"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Eye, HeartPulse, CheckCircle2, ShieldCheck, Video, RefreshCw } from "lucide-react";
import Link from "next/link";

export function Doctor3DMan() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live mouse tracking state for UI display
  const [gazeCoords, setGazeCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [doctorStatus, setDoctorStatus] = useState<string>("Attentive · Tracking Gaze");
  const [blinkTrigger, setBlinkTrigger] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    let isVisible = true;

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 4.4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // --- LIGHTING SETUP (Medical Studio + Signature Theme Highlights) ---
    // Ambient Light: Deep Navy undertone (#0B1F33)
    const ambientLight = new THREE.AmbientLight(0x0b1f33, 1.8);
    scene.add(ambientLight);

    // Warm Key Light (Front-Left)
    const keyLight = new THREE.DirectionalLight(0xfff5ee, 2.2);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    // Soft Aqua Rim Light (#83C5BE) for radiant medical glow on doctor's silhouette
    const aquaRimLight = new THREE.DirectionalLight(0x83c5be, 3.2);
    aquaRimLight.position.set(-4, 2.5, -2.5);
    scene.add(aquaRimLight);

    // Royal Teal Fill Light (#006D77) from bottom-right
    const tealFillLight = new THREE.DirectionalLight(0x006d77, 1.6);
    tealFillLight.position.set(2, -2, 2);
    scene.add(tealFillLight);

    // Front soft fill
    const frontFill = new THREE.PointLight(0xffffff, 1.0, 10);
    frontFill.position.set(0, 0.5, 3);
    scene.add(frontFill);

    // --- MATERIALS ---
    // Warm natural Indian skin tone
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfa789,
      roughness: 0.55,
      metalness: 0.05,
    });

    const skinShadowMaterial = new THREE.MeshStandardMaterial({
      color: 0xc48c6f,
      roughness: 0.6,
      metalness: 0.05,
    });

    // Royal Teal Medical Scrubs (#006D77)
    const scrubsMaterial = new THREE.MeshStandardMaterial({
      color: 0x006d77,
      roughness: 0.45,
      metalness: 0.1,
    });

    // Darker Teal for V-neck trim (#004d54)
    const scrubsTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x004d54,
      roughness: 0.5,
    });

    // Inner White Shirt
    const innerShirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4f8f8,
      roughness: 0.6,
    });

    // Stylish Chestnut Brown Hair
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x241610,
      roughness: 0.65,
      metalness: 0.15,
    });

    // Stethoscope Deep Navy Tubing (#0B1F33)
    const stethTubingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b1f33,
      roughness: 0.35,
      metalness: 0.2,
    });

    // Stethoscope Polished Chrome / Bell
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0ecf4,
      metalness: 0.95,
      roughness: 0.12,
    });

    // Eyes - Sclera (White of Eye)
    const scleraMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.05,
    });

    // Eyes - Iris: Royal Teal (#006D77) with Soft Aqua rim
    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x006d77,
      roughness: 0.15,
      metalness: 0.1,
    });

    // Eyes - Pupil: Deep Navy (#0B1F33)
    const pupilMaterial = new THREE.MeshBasicMaterial({
      color: 0x050c14,
    });

    // Eye catchlight (Reflection)
    const catchlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    // Warm friendly lips
    const lipsMaterial = new THREE.MeshStandardMaterial({
      color: 0xb7685c,
      roughness: 0.4,
    });

    // White teeth
    const teethMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    // --- CHARACTER HIERARCHY ---
    const doctorRoot = new THREE.Group();
    scene.add(doctorRoot);
    doctorRoot.position.y = -0.7;

    // 1. TORSO & MEDICAL SCRUBS (Inspired by user's photo)
    const torsoGroup = new THREE.Group();
    doctorRoot.add(torsoGroup);

    // Upper chest/torso
    const torsoGeometry = new THREE.CylinderGeometry(0.85, 0.95, 1.4, 32);
    torsoGeometry.scale(1.15, 1, 0.75);
    const torsoMesh = new THREE.Mesh(torsoGeometry, scrubsMaterial);
    torsoMesh.position.y = 0.2;
    torsoGroup.add(torsoMesh);

    // Left & Right Shoulders
    const shoulderGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const leftShoulder = new THREE.Mesh(shoulderGeo, scrubsMaterial);
    leftShoulder.position.set(-0.95, 0.65, 0);
    leftShoulder.scale.set(1.1, 0.9, 0.85);
    torsoGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, scrubsMaterial);
    rightShoulder.position.set(0.95, 0.65, 0);
    rightShoulder.scale.set(1.1, 0.9, 0.85);
    torsoGroup.add(rightShoulder);

    // Upper arms (bent forward naturally)
    const armGeo = new THREE.CylinderGeometry(0.3, 0.28, 1.1, 24);
    const leftArm = new THREE.Mesh(armGeo, scrubsMaterial);
    leftArm.position.set(-1.08, 0.15, 0.1);
    leftArm.rotation.z = 0.2;
    leftArm.rotation.x = 0.3;
    torsoGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, scrubsMaterial);
    rightArm.position.set(1.08, 0.15, 0.1);
    rightArm.rotation.z = -0.2;
    rightArm.rotation.x = 0.3;
    torsoGroup.add(rightArm);

    // White inner undershirt at neckline
    const innerShirtGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.35, 24);
    const innerShirt = new THREE.Mesh(innerShirtGeo, innerShirtMaterial);
    innerShirt.position.set(0, 0.8, 0.08);
    torsoGroup.add(innerShirt);

    // Scrubs V-Neck Collar Trim (Two diagonal bands)
    const collarBandGeo = new THREE.BoxGeometry(0.06, 0.45, 0.05);
    const leftCollar = new THREE.Mesh(collarBandGeo, scrubsTrimMaterial);
    leftCollar.position.set(-0.16, 0.68, 0.38);
    leftCollar.rotation.z = -0.55;
    torsoGroup.add(leftCollar);

    const rightCollar = new THREE.Mesh(collarBandGeo, scrubsTrimMaterial);
    rightCollar.position.set(0.16, 0.68, 0.38);
    rightCollar.rotation.z = 0.55;
    torsoGroup.add(rightCollar);

    // 2. STETHOSCOPE (Deep Navy tubing + Chrome chest piece)
    const stethGroup = new THREE.Group();
    torsoGroup.add(stethGroup);

    // Tubing curve around back of neck and down over shoulders
    const curvePoints = [
      new THREE.Vector3(-0.35, 0.95, -0.05), // behind neck left
      new THREE.Vector3(-0.48, 0.88, 0.15),  // over shoulder left
      new THREE.Vector3(-0.42, 0.55, 0.38),  // down chest left
      new THREE.Vector3(-0.25, 0.28, 0.44),  // curve towards center
      new THREE.Vector3(0, 0.18, 0.46),      // center chest join
      new THREE.Vector3(0.25, 0.28, 0.44),   // curve up right
      new THREE.Vector3(0.42, 0.55, 0.38),   // up chest right
      new THREE.Vector3(0.48, 0.88, 0.15),   // over shoulder right
      new THREE.Vector3(0.35, 0.95, -0.05),  // behind neck right
    ];
    const stethCurve = new THREE.CatmullRomCurve3(curvePoints);
    const stethGeo = new THREE.TubeGeometry(stethCurve, 64, 0.038, 12, false);
    const stethTube = new THREE.Mesh(stethGeo, stethTubingMaterial);
    stethGroup.add(stethTube);

    // Lower tube hanging down to chest piece
    const lowerPoints = [
      new THREE.Vector3(0, 0.18, 0.46),
      new THREE.Vector3(-0.04, 0.02, 0.47),
      new THREE.Vector3(-0.06, -0.15, 0.45),
    ];
    const lowerCurve = new THREE.CatmullRomCurve3(lowerPoints);
    const lowerTube = new THREE.Mesh(
      new THREE.TubeGeometry(lowerCurve, 20, 0.036, 10, false),
      stethTubingMaterial
    );
    stethGroup.add(lowerTube);

    // Chrome Chest piece (Bell & Diaphragm)
    const chestPieceGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.05, 32);
    const chestPiece = new THREE.Mesh(chestPieceGeo, chromeMaterial);
    chestPiece.rotation.x = Math.PI / 2;
    chestPiece.position.set(-0.06, -0.18, 0.46);
    stethGroup.add(chestPiece);

    // Subtle Soft Aqua center ring on stethoscope diaphragm
    const rimGeo = new THREE.TorusGeometry(0.09, 0.012, 16, 32);
    const rimMesh = new THREE.Mesh(
      rimGeo,
      new THREE.MeshStandardMaterial({ color: 0x83c5be, metalness: 0.8, roughness: 0.2 })
    );
    rimMesh.position.set(-0.06, -0.18, 0.49);
    stethGroup.add(rimMesh);

    // 3. NECK & HEAD
    const neckGroup = new THREE.Group();
    doctorRoot.add(neckGroup);

    const neckGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.48, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.y = 1.05;
    neckGroup.add(neckMesh);

    // HEAD GROUP (Rotates toward cursor)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.42, 0.05);
    neckGroup.add(headGroup);

    // Sculpted Head / Face
    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    headGeo.scale(0.88, 1.08, 0.94);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headGroup.add(headMesh);

    // Jaw / Chin refinement
    const jawGeo = new THREE.SphereGeometry(0.34, 24, 24);
    jawGeo.scale(0.85, 0.75, 0.9);
    const jawMesh = new THREE.Mesh(jawGeo, skinMaterial);
    jawMesh.position.set(0, -0.32, 0.22);
    headGroup.add(jawMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.14, 16, 16);
    earGeo.scale(0.45, 1.0, 0.75);

    const leftEar = new THREE.Mesh(earGeo, skinMaterial);
    leftEar.position.set(-0.52, 0.02, 0);
    leftEar.rotation.y = -0.2;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMaterial);
    rightEar.position.set(0.52, 0.02, 0);
    rightEar.rotation.y = 0.2;
    headGroup.add(rightEar);

    // Nose
    const noseBridgeGeo = new THREE.CylinderGeometry(0.045, 0.065, 0.22, 16);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMaterial);
    noseBridge.position.set(0, 0.04, 0.54);
    noseBridge.rotation.x = -0.22;
    headGroup.add(noseBridge);

    const noseTipGeo = new THREE.SphereGeometry(0.068, 16, 16);
    noseTipGeo.scale(1.05, 0.85, 1.1);
    const noseTip = new THREE.Mesh(noseTipGeo, skinShadowMaterial);
    noseTip.position.set(0, -0.04, 0.58);
    headGroup.add(noseTip);

    // Warm Doctor Smile (Lips & Crescent Teeth)
    const upperLipGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 16);
    const upperLip = new THREE.Mesh(upperLipGeo, lipsMaterial);
    upperLip.rotation.z = Math.PI / 2;
    upperLip.position.set(0, -0.2, 0.51);
    headGroup.add(upperLip);

    const smileGeo = new THREE.TorusGeometry(0.12, 0.022, 12, 24, Math.PI * 0.9);
    const smileMesh = new THREE.Mesh(smileGeo, lipsMaterial);
    smileMesh.position.set(0, -0.2, 0.5);
    smileMesh.rotation.z = -Math.PI * 0.95;
    headGroup.add(smileMesh);

    // Glimpse of clean white teeth in friendly smile
    const teethGeo = new THREE.BoxGeometry(0.12, 0.035, 0.03);
    const teethMesh = new THREE.Mesh(teethGeo, teethMaterial);
    teethMesh.position.set(0, -0.2, 0.515);
    headGroup.add(teethMesh);

    // Subtle groomed stubble shadow around jaw (like the photo)
    const beardGeo = new THREE.SphereGeometry(0.36, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    beardGeo.scale(0.88, 0.7, 0.92);
    const beardMaterial = new THREE.MeshStandardMaterial({
      color: 0x302018,
      transparent: true,
      opacity: 0.22,
      roughness: 0.8,
    });
    const beardMesh = new THREE.Mesh(beardGeo, beardMaterial);
    beardMesh.position.set(0, -0.28, 0.22);
    beardMesh.rotation.x = Math.PI;
    headGroup.add(beardMesh);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.17, 0.032, 0.04);
    const leftBrow = new THREE.Mesh(browGeo, hairMaterial);
    leftBrow.position.set(-0.21, 0.23, 0.49);
    leftBrow.rotation.z = 0.12;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, hairMaterial);
    rightBrow.position.set(0.21, 0.23, 0.49);
    rightBrow.rotation.z = -0.12;
    headGroup.add(rightBrow);

    // Stylish Quiff Hair (Matching photo: neat textured quiff swept up/back)
    const hairTopGeo = new THREE.SphereGeometry(0.56, 24, 24);
    hairTopGeo.scale(0.92, 0.9, 1.05);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMaterial);
    hairTop.position.set(0, 0.28, -0.06);
    headGroup.add(hairTop);

    // Quiff wave on top
    const quiffGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.35, 20);
    quiffGeo.scale(1.1, 0.8, 1.2);
    const quiffMesh = new THREE.Mesh(quiffGeo, hairMaterial);
    quiffMesh.position.set(0, 0.62, 0.08);
    quiffMesh.rotation.x = -0.35;
    headGroup.add(quiffMesh);

    // Side hair tapers
    const sideHairL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.45), hairMaterial);
    sideHairL.position.set(-0.48, 0.2, -0.02);
    headGroup.add(sideHairL);

    const sideHairR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.45), hairMaterial);
    sideHairR.position.set(0.48, 0.2, -0.02);
    headGroup.add(sideHairR);

    // 4. THE 3D EYEBALLS WITH FULL ROTATIONAL TRACKING
    const createEye = (isRight: boolean) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(isRight ? 0.2 : -0.2, 0.12, 0.42);
      headGroup.add(eyeGroup);

      // Sclera (White globe)
      const eyeRadius = 0.095;
      const scleraMesh = new THREE.Mesh(
        new THREE.SphereGeometry(eyeRadius, 24, 24),
        scleraMaterial
      );
      eyeGroup.add(scleraMesh);

      // Iris: Royal Teal (#006D77) with Soft Aqua highlight
      const irisGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.015, 24);
      irisGeo.rotateX(Math.PI / 2);
      const irisMesh = new THREE.Mesh(irisGeo, irisMaterial);
      irisMesh.position.z = eyeRadius - 0.003;
      eyeGroup.add(irisMesh);

      // Soft Aqua highlight ring around iris
      const irisRing = new THREE.Mesh(
        new THREE.RingGeometry(0.038, 0.048, 24),
        new THREE.MeshBasicMaterial({ color: 0x83c5be, side: THREE.DoubleSide })
      );
      irisRing.position.z = eyeRadius + 0.005;
      eyeGroup.add(irisRing);

      // Pupil: Deep Navy (#0B1F33)
      const pupilGeo = new THREE.CircleGeometry(0.025, 20);
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMaterial);
      pupilMesh.position.z = eyeRadius + 0.007;
      eyeGroup.add(pupilMesh);

      // Specular Catchlight (Lively glint in eye)
      const catchlightGeo = new THREE.CircleGeometry(0.009, 12);
      const catchlightMesh = new THREE.Mesh(catchlightGeo, catchlightMaterial);
      catchlightMesh.position.set(0.015, 0.015, eyeRadius + 0.009);
      eyeGroup.add(catchlightMesh);

      // Eyelids (Upper eyelid for blinking)
      const upperEyelidGeo = new THREE.SphereGeometry(
        eyeRadius * 1.04,
        20,
        14,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.5
      );
      const upperEyelid = new THREE.Mesh(upperEyelidGeo, skinMaterial);
      upperEyelid.rotation.x = -Math.PI * 0.5; // open
      eyeGroup.add(upperEyelid);

      return {
        group: eyeGroup,
        upperEyelid,
      };
    };

    const leftEye = createEye(false);
    const rightEye = createEye(true);

    // --- MOUSE & POINTER TRACKING ---
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      // Calculate normalized coordinates [-1, 1] relative to window
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      targetMouse.x = normX;
      targetMouse.y = normY;

      // Update state for reactive HUD badges
      setGazeCoords({
        x: parseFloat(normX.toFixed(2)),
        y: parseFloat(normY.toFixed(2)),
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Touch support for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const normX = (touch.clientX / window.innerWidth) * 2 - 1;
        const normY = -(touch.clientY / window.innerHeight) * 2 + 1;
        targetMouse.x = normX;
        targetMouse.y = normY;
        setGazeCoords({
          x: parseFloat(normX.toFixed(2)),
          y: parseFloat(normY.toFixed(2)),
        });
      }
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Blink state
    let isBlinking = false;
    let blinkProgress = 0;
    let nextBlinkTime = performance.now() + 3000;

    // Trigger blinking on periodic schedule
    const triggerBlink = () => {
      isBlinking = true;
      blinkProgress = 0;
    };

    // --- ANIMATION LOOP ---
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth lerp mouse coordinates
      mouse.x += (targetMouse.x - mouse.x) * 0.1;
      mouse.y += (targetMouse.y - mouse.y) * 0.1;

      // 1. EYE TRACKING (Eyes track mouse cursor in 3D pitch and yaw)
      // Clamped within natural ocular limits
      const eyeYaw = THREE.MathUtils.clamp(mouse.x * 0.52, -0.42, 0.42);
      const eyePitch = THREE.MathUtils.clamp(-mouse.y * 0.42, -0.32, 0.32);

      leftEye.group.rotation.y = THREE.MathUtils.lerp(leftEye.group.rotation.y, eyeYaw, 0.18);
      leftEye.group.rotation.x = THREE.MathUtils.lerp(leftEye.group.rotation.x, eyePitch, 0.18);

      rightEye.group.rotation.y = THREE.MathUtils.lerp(rightEye.group.rotation.y, eyeYaw, 0.18);
      rightEye.group.rotation.x = THREE.MathUtils.lerp(rightEye.group.rotation.x, eyePitch, 0.18);

      // 2. HEAD TRACKING (Natural subtle head rotation follows gaze)
      const headYaw = THREE.MathUtils.clamp(mouse.x * 0.28, -0.26, 0.26);
      const headPitch = THREE.MathUtils.clamp(-mouse.y * 0.22, -0.18, 0.18);
      const headRoll = -mouse.x * 0.05;

      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, headYaw, 0.07);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, headPitch, 0.07);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, headRoll, 0.07);

      // 3. TORSO & BREATHING CYCLE
      // Subtle rhythmic rise and fall of chest
      const breath = Math.sin(elapsed * 2.2);
      torsoGroup.position.y = breath * 0.015;
      neckGroup.position.y = breath * 0.012;
      torsoGroup.scale.x = 1 + breath * 0.008;

      // 4. NATURAL BLINKING ANIMATION
      const now = performance.now();
      if (now > nextBlinkTime && !isBlinking) {
        triggerBlink();
        nextBlinkTime = now + 3200 + Math.random() * 3000;
      }

      if (isBlinking) {
        blinkProgress += delta * 9; // speed of blink (~150ms)
        if (blinkProgress < 1) {
          // Closing
          const closeVal = -Math.PI * 0.5 + Math.sin(blinkProgress * Math.PI) * (Math.PI * 0.55);
          leftEye.upperEyelid.rotation.x = closeVal;
          rightEye.upperEyelid.rotation.x = closeVal;
        } else {
          // Re-opened
          leftEye.upperEyelid.rotation.x = -Math.PI * 0.5;
          rightEye.upperEyelid.rotation.x = -Math.PI * 0.5;
          isBlinking = false;
        }
      }

      // Subtle dynamic rim light wobble tracking cursor
      aquaRimLight.position.x = -4 + mouse.x * 1.5;
      aquaRimLight.position.y = 2.5 + mouse.y * 1.0;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !canvas) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Visibility observer to save performance when scrolled away
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      renderer.dispose();
      // Dispose materials
      [
        skinMaterial,
        skinShadowMaterial,
        scrubsMaterial,
        scrubsTrimMaterial,
        innerShirtMaterial,
        hairMaterial,
        stethTubingMaterial,
        chromeMaterial,
        scleraMaterial,
        irisMaterial,
        pupilMaterial,
        catchlightMaterial,
        lipsMaterial,
        teethMaterial,
      ].forEach((mat) => mat.dispose());
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Ambient background glow matching Royal Teal #006D77 & Soft Aqua #83C5BE */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full bg-radial from-[#83C5BE]/25 via-[#006D77]/15 to-transparent blur-[80px] -z-10"
      />

      {/* Floating Status Badges around Doctor */}
      <div className="w-full flex items-center justify-between px-2 sm:px-6 mb-2 text-xs">
        {/* Left Badge: NMC Credential & Identity */}
        <div className="flex items-center gap-2 rounded-full border border-[#83C5BE]/30 bg-surface/85 backdrop-blur-md px-3.5 py-1.5 shadow-sm text-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#83C5BE] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006D77]" />
          </span>
          <span className="font-semibold text-[#0B1F33] dark:text-white">Dr. Subham Nayak, MD</span>
          <span className="text-[#006D77] dark:text-[#83C5BE] font-medium hidden sm:inline">
            · AIIMS Delhi Alumni
          </span>
        </div>

        {/* Right Badge: Interactive 3D Cursor Eye Tracking Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-[#006D77]/25 bg-[#006D77]/10 dark:bg-[#006D77]/25 backdrop-blur-md px-3.5 py-1.5 shadow-sm">
          <Eye className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE] animate-pulse" />
          <span className="font-medium text-[#006D77] dark:text-[#83C5BE] text-[11px] sm:text-xs">
            Eye Tracking:{" "}
            <span className="font-mono font-bold">
              {gazeCoords.x > 0 ? `+${gazeCoords.x}` : gazeCoords.x},{" "}
              {gazeCoords.y > 0 ? `+${gazeCoords.y}` : gazeCoords.y}
            </span>
          </span>
        </div>
      </div>

      {/* Center 3D Man Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-3xl border border-[#83C5BE]/30 bg-gradient-to-b from-[#006D77]/5 via-surface to-[#0B1F33]/5 dark:from-[#006D77]/15 dark:to-[#0B1F33]/40 shadow-[0_12px_45px_rgba(11,31,51,0.08)] overflow-hidden cursor-crosshair group"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Subtle holographic radial rings behind the doctor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-40 -z-0"
        >
          <div className="w-[300px] h-[300px] rounded-full border border-dashed border-[#83C5BE] animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-[420px] h-[420px] rounded-full border border-[#006D77]/30" />
        </div>

        {/* Floating Live Vitals Hologram (Left bottom) */}
        <div className="absolute bottom-4 left-4 sm:left-6 rounded-2xl border border-[#83C5BE]/35 bg-surface/90 dark:bg-[#0B1F33]/90 backdrop-blur-md p-3 shadow-lg max-w-[210px] space-y-1.5 transition-all group-hover:scale-105">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-[#0B1F33] dark:text-white">
              <HeartPulse className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE] animate-pulse" />
              Patient Telemetry
            </span>
            <span className="font-mono text-[10px] font-semibold text-[#006D77] dark:text-[#83C5BE]">
              72 BPM
            </span>
          </div>

          {/* Mini pulse wave SVG */}
          <div className="h-6 w-full flex items-center overflow-hidden">
            <svg
              className="w-full h-5 stroke-[#006D77] dark:stroke-[#83C5BE] fill-none stroke-[2]"
              viewBox="0 0 100 24"
            >
              <path d="M 0 12 L 20 12 L 25 3 L 30 21 L 35 7 L 40 16 L 45 12 L 100 12" />
            </svg>
          </div>
          <p className="text-[10px] text-muted leading-tight">
            NMC Verified Teleconsultation Protocol Active
          </p>
        </div>

        {/* Floating Quick Consultation Card (Right bottom) */}
        <div className="absolute bottom-4 right-4 sm:right-6 rounded-2xl border border-[#83C5BE]/35 bg-surface/90 dark:bg-[#0B1F33]/90 backdrop-blur-md p-3.5 shadow-lg max-w-[220px] space-y-2 transition-all group-hover:scale-105">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F33] dark:text-white">
            <Video className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
            <span>Consultation Ready</span>
          </div>
          <p className="text-[11px] text-muted leading-snug">
            HD video room standby. Wait time &lt; 2 minutes.
          </p>
          <Link
            href="/find-doctor"
            className="block w-full py-1.5 px-3 rounded-xl bg-[#006D77] hover:bg-[#00565e] text-center text-xs font-semibold text-white shadow-xs hover:shadow-[0_0_12px_rgba(131,197,190,0.5)] transition-all"
          >
            Start Visit Now
          </Link>
        </div>

        {/* Interactive Center Instruction Pill */}
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#83C5BE]/40 bg-surface/80 dark:bg-[#0B1F33]/80 backdrop-blur-md px-4 py-1 text-[11px] font-medium text-foreground shadow-xs">
          <span>Move mouse cursor across screen to direct 3D eye gaze</span>
        </div>
      </div>

      {/* Under-canvas controls & proof-points */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
          <strong className="text-foreground font-semibold">100% Verified NMC Specialists</strong>
        </span>
        <span className="hidden sm:inline text-border">•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
          <span>Real-time Eye Movement Animation</span>
        </span>
        <span className="hidden sm:inline text-border">•</span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
          <span>Browser-Native 3D WebGL</span>
        </span>
      </div>
    </div>
  );
}

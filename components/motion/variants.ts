import type { Transition, Variants } from "framer-motion";

// ─── Base Transitions ────────────────────────────────────────────────────────

export const calmTransition: Transition = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1],
};

export const fastTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 0.8,
};

// ─── Core Variants ───────────────────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: calmTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: calmTransition },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: calmTransition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: smoothSpring },
};

export const blurFadeIn: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Slide Variants ──────────────────────────────────────────────────────────

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: calmTransition },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: calmTransition },
};

// ─── Page & Modal Transitions ────────────────────────────────────────────────

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: calmTransition },
  exit: { opacity: 0, y: -8, transition: fastTransition },
};

export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: smoothSpring },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: fastTransition },
};

export const slideTransition: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: calmTransition },
  exit: { opacity: 0, x: -20, transition: fastTransition },
};

// ─── Container Stagger ───────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.06,
    },
  },
};

export const staggerGrid: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

// ─── Card & Item Animations ──────────────────────────────────────────────────

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: calmTransition },
};

export const cardHover = {
  y: -4,
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" } as Transition,
};

// ─── Decorative / Floating ───────────────────────────────────────────────────

export const floatingElement: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const floatingSlow: Variants = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 1, -1, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const glowPulse: Variants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─── Error / Feedback ────────────────────────────────────────────────────────

export const errorShake: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    x: [0, -4, 4, -2, 2, 0],
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: { opacity: 0, height: 0, transition: fastTransition },
};

// ─── Reduced Motion Fallbacks ────────────────────────────────────────────────

export const reducedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const reducedStaggerContainer: Variants = {
  hidden: {},
  visible: {},
};

// ─── Variant Selector ────────────────────────────────────────────────────────

export interface MotionVariants {
  card: Variants;
  container: Variants;
  item: Variants;
  page: Variants;
}

export function getMotionVariants(reduceMotion: boolean): MotionVariants {
  if (reduceMotion) {
    return {
      card: reducedFadeIn,
      container: reducedStaggerContainer,
      item: reducedFadeIn,
      page: reducedFadeIn,
    };
  }

  return {
    card: cardReveal,
    container: staggerContainer,
    item: fadeInUp,
    page: pageTransition,
  };
}

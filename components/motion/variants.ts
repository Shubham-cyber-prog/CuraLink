import type { Transition, Variants } from "framer-motion";

export const calmTransition: Transition = {
  duration: 0.32,
  ease: [0.16, 1, 0.3, 1],
};

export const fastTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: calmTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: calmTransition },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: calmTransition },
  exit: { opacity: 0, y: -8, transition: fastTransition },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.1,
    },
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: calmTransition },
};

export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: calmTransition },
  exit: { opacity: 0, scale: 0.98, transition: fastTransition },
};

export const slideTransition: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: calmTransition },
  exit: { opacity: 0, x: -20, transition: fastTransition },
};

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

export const reducedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const reducedStaggerContainer: Variants = {
  hidden: {},
  visible: {},
};

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

import type { Transition, Variants } from "framer-motion";

const EASE_STANDARD: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_EMPHASIS: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const MOTION_SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.8,
};

export const MOTION_SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 24,
  mass: 0.9,
};

export const MOTION_TRANSITION_FADE: Transition = {
  duration: 0.38,
  ease: EASE_STANDARD,
};

export const pageFadeVariants: Variants = {
  hidden: { opacity: 1, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.46,
      ease: EASE_STANDARD,
    },
  },
};

export const sectionRevealVariants: Variants = {
  hidden: { opacity: 1, y: 12 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASE_STANDARD,
      delay: Math.min(0.4, index * 0.05),
    },
  }),
};

export const listStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 1, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: MOTION_TRANSITION_FADE,
  },
};

export const chartEntryVariants: Variants = {
  hidden: { opacity: 1, scale: 0.988, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.46,
      ease: EASE_EMPHASIS,
    },
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: EASE_STANDARD },
  },
};

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: EASE_STANDARD,
    },
  },
};

export const ambientFloatLeftVariants: Variants = {
  idle: {
    x: [0, 16, -12, 0],
    y: [0, -10, 12, 0],
    scale: [1, 1.04, 0.98, 1],
    opacity: [0.34, 0.48, 0.38, 0.34],
    transition: {
      duration: 36,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const ambientFloatRightVariants: Variants = {
  idle: {
    x: [0, -14, 18, 0],
    y: [0, 12, -8, 0],
    scale: [1, 0.98, 1.05, 1],
    opacity: [0.28, 0.42, 0.32, 0.28],
    transition: {
      duration: 42,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const ambientPulseVariants: Variants = {
  idle: {
    scale: [1, 1.08, 0.96, 1],
    opacity: [0.2, 0.28, 0.18, 0.2],
    transition: {
      duration: 28,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

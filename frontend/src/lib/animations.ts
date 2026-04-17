/**
 * Animation configurations and variants for Framer Motion
 * Provides consistent, professional animations across the app
 */

import { Variants } from "framer-motion";

// Easing curves for natural motion
export const easings = {
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
  softSpring: { type: "spring", stiffness: 200, damping: 25 },
};

// Page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easings.easeIn,
    },
  },
};

// Stagger children animations
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
};

// Card hover effects
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
    transition: {
      duration: 0.25,
      ease: easings.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Button interactions
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.03,
    transition: easings.softSpring,
  },
  tap: { 
    scale: 0.97,
    transition: {
      duration: 0.1,
    },
  },
};

// Fade in up
export const fadeInUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: easings.easeOut,
    },
  },
};

// Scale in
export const scaleInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
};

// Slide in from side
export const slideInVariants: Variants = {
  left: {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: easings.easeOut,
      },
    },
  },
  right: {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: easings.easeOut,
      },
    },
  },
};

// Modal/Dialog animations
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: easings.easeIn,
    },
  },
};

// Overlay backdrop
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Heart/favorite animation
export const heartVariants: Variants = {
  initial: { scale: 1 },
  liked: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.2, 0.4, 0.6, 1],
      ease: easings.easeOut,
    },
  },
};

// Badge/notification pulse
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

// Skeleton loading shimmer
export const shimmerVariants: Variants = {
  initial: { 
    backgroundPosition: "-200% 0",
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// List item entrance
export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
  },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
      ease: easings.easeOut,
    },
  }),
};

// Floating/levitate effect
export const floatingVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

// Rotate entrance
export const rotateInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    rotate: -10,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easings.easeOut,
    },
  },
};

// Progress bar animation
export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.5,
      ease: easings.easeOut,
    },
  }),
};

// Spring entrance for important elements
export const springEntranceVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
    rotate: -10,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      ...easings.softSpring,
      duration: 0.6,
    },
  },
};

"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-in";
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

const variants = {
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "fade-up": {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  className,
  delay = 0,
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10%" }}
      variants={variants[variant]}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }} // Custom spring-like easing
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  delay?: number;
  once?: boolean;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delayChildren: custom,
      staggerChildren: 0.1,
    },
  }),
};

export function StaggerReveal({
  children,
  className,
  staggerDelay = 0.1,
  delay = 0,
  once = true,
}: StaggerRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10%" }}
      variants={staggerContainer}
      custom={delay}
      className={cn(className)}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={variants["fade-up"]} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

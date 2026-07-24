"use client";

import { motion, useInView, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // defaults to 2s
  className?: string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className = "",
  prefix = "",
  suffix = "",
  decimalPlaces = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [hasAnimated, setHasAnimated] = useState(false);

  // useSpring handles the interpolation logic
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration,
  });

  // useTransform maps the spring value to a formatted string
  const displayValue = useTransform(springValue, (current) => {
    return `${prefix}${current.toFixed(decimalPlaces)}${suffix}`;
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, springValue, hasAnimated]);

  return <motion.span ref={ref} className={className}>{displayValue}</motion.span>;
}

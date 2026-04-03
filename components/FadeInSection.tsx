'use client';

import { motion, HTMLMotionProps } from "framer-motion";
import { useInView } from "react-intersection-observer";
import React, { forwardRef } from "react";

const animations = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  fadeUp: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
  fadeDown: { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
  slideLeft: { initial: { x: -60, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  slideRight: { initial: { x: 60, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  zoom: { initial: { scale: 0.85, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
};

type AnimationType = keyof typeof animations;

interface FadeInSectionProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition"> {
  children: React.ReactNode;
  delay?: number;
  type?: AnimationType;
  threshold?: number;
  duration?: number;
}

const FadeInSection = forwardRef<HTMLDivElement, FadeInSectionProps>(({
  children,
  delay = 0,
  type = "fadeUp",
  threshold = 0.15,
  duration = 0.7,
  className = "",
  ...props
}, ref) => {
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold,
  });

  const animation = animations[type];

  return (
    <motion.div
      ref={(node) => {
        // Merge refs
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        inViewRef(node);
      }}
      initial={animation.initial}
      animate={inView ? animation.animate : animation.initial}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});

FadeInSection.displayName = "FadeInSection";

export default FadeInSection;
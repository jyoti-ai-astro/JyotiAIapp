"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  as?: keyof JSX.IntrinsicElements;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement>;
  customVariants?: any;
  className?: string;
  children: React.ReactNode;
}

export function TimelineContent({
  as: Component = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const defaultVariants = {
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: animationNum * 0.2,
        duration: 0.4,
      },
    },
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const variants = customVariants || defaultVariants;

  const MotionComponent = motion[Component as keyof typeof motion] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </MotionComponent>
  );
}


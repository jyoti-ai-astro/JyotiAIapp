"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerticalCutRevealProps {
  children: string;
  splitBy?: "words" | "chars";
  staggerDuration?: number;
  staggerFrom?: "first" | "last";
  reverse?: boolean;
  containerClassName?: string;
  transition?: any;
}

export function VerticalCutReveal({
  children,
  splitBy = "words",
  staggerDuration = 0.1,
  staggerFrom = "first",
  reverse = false,
  containerClassName,
  transition,
}: VerticalCutRevealProps) {
  const items = splitBy === "words" ? children.split(" ") : children.split("");

  const defaultTransition = {
    type: "spring",
    stiffness: 250,
    damping: 40,
    delay: 0,
  };

  return (
    <div className={cn("flex flex-wrap justify-center", containerClassName)}>
      {items.map((item, index) => {
        const actualIndex = reverse ? items.length - 1 - index : index;
        const delay = staggerFrom === "first" 
          ? actualIndex * staggerDuration 
          : (items.length - 1 - actualIndex) * staggerDuration;

        return (
          <motion.span
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              ...defaultTransition,
              ...transition,
              delay: delay + (transition?.delay || 0),
            }}
            className="inline-block"
          >
            {item}
            {splitBy === "words" && index < items.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
    </div>
  );
}


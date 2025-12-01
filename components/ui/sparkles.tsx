"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  density?: number;
  direction?: "top" | "bottom" | "left" | "right";
  speed?: number;
  color?: string;
  className?: string;
}

export function Sparkles({
  density = 100,
  direction = "bottom",
  speed = 1,
  color = "#FFFFFF",
  className,
}: SparklesProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
        backgroundSize: `${100 / Math.sqrt(density / 100)}% ${100 / Math.sqrt(density / 100)}%`,
        animation: `sparkle-${direction} ${speed}s linear infinite`,
      }}
    />
  );
}


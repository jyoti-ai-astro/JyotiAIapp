/**
 * Clean Cosmic Background (non-R3F)
 *
 * Replaces the noisy canvas with a simple, premium gradient background.
 */
"use client";

import React, { memo } from "react";

interface CosmicBackgroundProps {
  intensity?: number;
  particleCount?: number; // kept for API compatibility (unused)
  showMandala?: boolean;  // kept for API compatibility (unused)
  className?: string;
}

export const CosmicBackground = memo(function CosmicBackground({
  intensity = 1.0,
  className = "",
}: CosmicBackgroundProps) {
  const clamped = Math.max(0, Math.min(1.5, intensity));
  const glowStrength = 0.18 * clamped;
  const secondaryGlow = 0.14 * clamped;

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden bg-[#020617] ${className}`}
    >
      {/* Main gradient nebula */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 0%, rgba(56,189,248,${secondaryGlow}), transparent 55%),
            radial-gradient(circle at 85% 0%, rgba(244,211,94,${glowStrength}), transparent 55%),
            radial-gradient(circle at 50% 80%, rgba(129,140,248,${glowStrength + 0.08}), transparent 60%),
            linear-gradient(to bottom, #020617, #020617 40%, #020617)
          `,
          backgroundBlendMode: "screen, screen, screen, normal",
        }}
      />

      {/* Very subtle grain to avoid flatness */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0 0, rgba(255,255,255,0.55), transparent 55%)",
        }}
      />
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";

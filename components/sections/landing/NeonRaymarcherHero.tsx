"use client";

import React from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(
  () => import("./NeonRaymarcherScene").then((m) => m.Scene),
  { ssr: false }
);

export const NeonRaymarcherHero: React.FC = () => {
  return (
    <section className="relative min-h-[480px] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Scene />
      </div>

      <div className="relative z-10 flex min-h-[480px] flex-col items-center justify-center px-4 text-center text-white">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald-300/80">
          Experimental Cosmic Lab
        </p>
        <h1 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
          A Neon Raymarcher Portal for{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
            Advanced JyotiAI Experiences
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-sm md:text-base text-neutral-300">
          Use this 3D shader hero sparingly on special pages like launches,
          feature drops, or Circuit OS previews. It&apos;s heavy, so we keep it
          for marquee moments only.
        </p>
      </div>
    </section>
  );
};


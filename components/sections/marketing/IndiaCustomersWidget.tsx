"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface IndiaCustomerPing {
  id: number;
  city: string;
  label: string;
  x: string; // as percentage
  y: string; // as percentage
}

interface IndiaCustomersWidgetProps {
  className?: string;
}

const BASE_POINTS: IndiaCustomerPing[] = [
  {
    id: 1,
    city: "Delhi",
    label: "User from Delhi, India",
    x: "50%",
    y: "23%",
  },
  {
    id: 2,
    city: "Mumbai",
    label: "User from Mumbai, India",
    x: "34%",
    y: "56%",
  },
  {
    id: 3,
    city: "Bengaluru",
    label: "User from Bengaluru, India",
    x: "48%",
    y: "68%",
  },
  {
    id: 4,
    city: "Hyderabad",
    label: "User from Hyderabad, India",
    x: "50%",
    y: "60%",
  },
  {
    id: 5,
    city: "Kolkata",
    label: "User from Kolkata, India",
    x: "70%",
    y: "40%",
  },
  {
    id: 6,
    city: "Chennai",
    label: "User from Chennai, India",
    x: "55%",
    y: "76%",
  },
];

export const IndiaCustomersWidget: React.FC<IndiaCustomersWidgetProps> = ({
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Cycle through pings to create a "live" feeling
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BASE_POINTS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const activePing = BASE_POINTS[activeIndex];

  return (
    <section
      className={cn(
        "relative w-full bg-black py-10 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-center">
        <div className="relative w-full md:w-1/2">
          <div className="mb-4 text-xs uppercase tracking-[0.2em] text-indigo-300">
            Live Presence · India
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight">
            People across India are{" "}
            <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
              actively using JyotiAI
            </span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-300">
            To protect privacy, we only show anonymised labels like{" "}
            <span className="font-semibold text-emerald-300">
              "User from India"
            </span>{" "}
            while still signaling trust and real adoption across major cities.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-neutral-200 backdrop-blur">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span>
              Currently viewed from{" "}
              <span className="font-semibold text-emerald-300">
                {activePing.city}, India
              </span>
            </span>
          </div>
        </div>

        {/* Map side */}
        <div className="relative w-full md:w-1/2 mt-6 md:mt-0">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-black shadow-[0_0_40px_rgba(56,189,248,0.45)]">
            {/* Map image (you can replace with your own India SVG/PNG) */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen">
              <img
                src="/images/maps/india-outline-light.png"
                alt="India Map"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Static faint glow grid */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.25),transparent_60%),radial-gradient(circle_at_top,_rgba(129,140,248,0.3),transparent_55%)]" />

            {/* Pings */}
            {BASE_POINTS.map((point, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={point.id}
                  className="absolute"
                  style={{
                    left: point.x,
                    top: point.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative">
                    {/* Pulse ring */}
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      {isActive && (
                        <span className="h-8 w-8 rounded-full border border-emerald-300/40 bg-emerald-300/10 blur-[1px] animate-ping" />
                      )}
                    </span>
                    {/* Dot */}
                    <div
                      className={cn(
                        "relative z-10 h-2.5 w-2.5 rounded-full border border-emerald-200 bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.9)]",
                        !isActive && "opacity-60"
                      )}
                    />
                  </div>
                </div>
              );
            })}

            {/* Floating pill with active city */}
            <AnimatePresence>
              {activePing && (
                <motion.div
                  key={activePing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-1/2 bottom-5 w-[85%] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-xs text-neutral-100 backdrop-blur-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                        Live session
                      </span>
                      <span className="text-[13px] font-medium">
                        User from {activePing.city}, India is exploring JyotiAI
                        right now
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};


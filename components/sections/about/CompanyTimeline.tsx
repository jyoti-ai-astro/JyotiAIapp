"use client";

import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface CompanyTimelineProps {
  title?: string;
  description?: string;
  entries: TimelineEntry[];
  className?: string;
}

export const CompanyTimeline: React.FC<CompanyTimelineProps> = ({
  title = "JyotiAI Journey & Changelog",
  description = "From the first prototype to a full spiritual operating system powered by AI and Vedic astrology.",
  entries,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [entries.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section
      className={`w-full bg-black text-white font-sans md:px-10 ${className}`}
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-16 md:py-24 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-white max-w-4xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-neutral-300 text-sm md:text-base max-w-xl">
          {description}
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {entries.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-32 md:gap-10"
          >
            {/* Sticky left column: dot + large title */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-32 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-900 border border-neutral-700 p-2 shadow-[0_0_20px_rgba(129,140,248,0.7)]" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-4xl font-bold text-neutral-500">
                {item.title}
              </h3>
            </div>

            {/* Right column: card content */}
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-400">
                {item.title}
              </h3>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 via-white/0 to-indigo-500/10 p-4 md:p-6 shadow-[0_0_40px_rgba(79,70,229,0.4)]">
                {item.content}
              </div>
            </div>
          </div>
        ))}

        {/* Vertical animated line */}
        <div
          style={{
            height: `${height}px`,
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent via-neutral-800 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-indigo-500 via-sky-400 to-transparent rounded-full"
          />
        </div>
      </div>
    </section>
  );
};

export type { TimelineEntry, CompanyTimelineProps };


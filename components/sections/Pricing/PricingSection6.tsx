"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

// Simple number display component (replacement for @number-flow/react)
const NumberFlow = ({ value, className }: { value: number; className?: string }) => {
  return <span className={className}>{value.toLocaleString('en-IN')}</span>;
};

const plans = [
  {
    name: "Free",
    description:
      "Perfect for exploring JyotiAI with basic Guru chat and limited insights.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Start Free",
    buttonVariant: "outline" as const,
    includes: [
      "Includes:",
      "Guru chat (limited questions)",
      "Basic birth chart summary",
      "Email-based account",
    ],
  },
  {
    name: "Standard",
    description:
      "Best for regular seekers who want deeper guidance and more questions.",
    price: 499,
    yearlyPrice: 3999,
    buttonText: "Upgrade to Standard",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Everything in Free, plus:",
      "12-month life overview (lite)",
      "More Guru questions every month",
      "Priority email support",
    ],
  },
  {
    name: "Premium",
    description:
      "Full JyotiAI experience with detailed reports, timelines & priority Guru.",
    price: 999,
    yearlyPrice: 7999,
    buttonText: "Go Premium",
    buttonVariant: "outline" as const,
    includes: [
      "Everything in Standard, plus:",
      "Full 12-month predictions",
      "Timeline Engine (month-by-month)",
      "PDF reports for key modules",
    ],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-violet-600 border-violet-600 bg-gradient-to-t from-violet-500 to-indigo-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-violet-600 border-violet-600 bg-gradient-to-t from-violet-500 to-indigo-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Yearly</span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection6() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.4,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className="min-h-screen mx-auto relative bg-black overflow-x-hidden cosmic-page"
      ref={pricingRef}
    >
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] "
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]" />
        <SparklesComp
          density={1800}
          direction="bottom"
          speed={1}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>

      <article className="text-center mb-6 pt-32 max-w-3xl mx-auto space-y-2 relative z-50">
        <h2 className="text-4xl font-medium text-white cosmic-heading">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Choose your JyotiAI path
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-300 cosmic-subheading"
        >
          Start free, then move to deeper timelines, predictions and Guru
          experiences as you grow.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, #4f46e5 0%, transparent 70%)`,
          opacity: 0.6,
          mixBlendMode: "screen",
        }}
      />

      <div className="grid md:grid-cols-3 max-w-5xl gap-4 py-10 mx-auto relative z-10">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative text-white border-neutral-800 glass-card ${
                plan.popular
                  ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#4f46e5] z-20"
                  : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10"
              }`}
            >
              <CardHeader className="text-left">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                  {plan.popular && (
                    <span className="px-3 py-1 text-xs rounded-full bg-violet-600/30 border border-violet-400/60">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold leading-none">
                    ₹
                    <NumberFlow
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-3xl font-semibold"
                    />
                  </span>
                  <span className="text-gray-300 ml-1 text-sm">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <button
                  className={`w-full mb-6 p-3 text-sm rounded-xl gradient-button`}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-3 pt-4 border-t border-neutral-700/70">
                  <h4 className="font-medium text-base mb-3">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <span className="h-2 w-2 bg-violet-400 rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}


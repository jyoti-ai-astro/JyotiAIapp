"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";

// Get payments disabled status from environment
const isPaymentsDisabled = process.env.NEXT_PUBLIC_DISABLE_PAYMENTS === 'true';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";

import {
  getAllSubscriptionPlans,
  getAllOneTimeProducts,
  type SubscriptionPlan,
  type OneTimeProduct,
} from '@/lib/pricing/plans'

const revealVariants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.2,
      duration: 0.5,
    },
  }),
  hidden: {
    filter: "blur(10px)",
    y: -20,
    opacity: 0,
  },
};

export default function PricingSection6() {
  const pricingRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useUserStore();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const subscriptionPlans = getAllSubscriptionPlans();
  const oneTimeProducts = getAllOneTimeProducts();

  const handleSubscriptionCheckout = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      // Create subscription
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const data = await response.json();

      // Load Razorpay script if not already loaded
      if (typeof window !== 'undefined' && !(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Open Razorpay checkout
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new Razorpay({
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'JyotiAI',
        description: plan.description,
        prefill: {
          email: user.email || '',
          name: user.name || '',
        },
        theme: {
          color: '#F2C94C',
        },
        handler: async (response: any) => {
          // Refresh subscription status
          await fetch('/api/subscriptions/status?refresh=true', {
            credentials: 'include',
          });
          // Redirect to payments page
          router.push('/payments');
        },
        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
          },
        },
      });

      rzp.open();
    } catch (error: any) {
      console.error('Subscription checkout error:', error);
      alert(error.message || 'Failed to start subscription checkout');
      setLoadingPlanId(null);
    }
  };

  return (
    <div
      className="min-h-screen mx-auto relative bg-black overflow-x-hidden"
      ref={pricingRef}
    >
      {/* Grid + sparkles background */}
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0  h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
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

      {/* Big blurred ring glow */}
      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
      >
        <div className="relative w-full h-full">
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          />
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          />
        </div>
      </TimelineContent>

      {/* ============================================
          SECTION 1: MONTHLY SUBSCRIPTION PLANS
          ============================================ */}
      {isPaymentsDisabled && (
        <div className="mb-4 rounded-xl border border-yellow-500/40 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200 max-w-5xl mx-auto relative z-50 mt-32">
          Payments are temporarily disabled for maintenance. You can still explore all features in demo mode.
        </div>
      )}
      <article className="text-center mb-12 pt-32 max-w-3xl mx-auto space-y-2 relative z-50">
        <h2 className="text-4xl font-medium text-white">
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
            Choose Your Monthly Path
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-300"
        >
          Three paths, one JyotiAI. Pick the way you want to travel.
        </TimelineContent>
      </article>

      {/* Soft radial glow behind cards */}
      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #206ce8 0%, transparent 70%)",
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      {/* Subscription Plans Cards */}
      <div className="grid md:grid-cols-3 max-w-5xl gap-4 py-6 mx-auto relative z-10 px-4 md:px-0 mb-20">
        {subscriptionPlans.map((plan: SubscriptionPlan, index: number) => (
          <TimelineContent
            key={plan.id}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "relative text-white border-neutral-800",
                plan.highlight
                  ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#0900ff] z-20"
                  : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10",
              )}
            >
              <CardHeader className="text-left">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl md:text-3xl font-semibold">
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <span className="text-xs rounded-full bg-blue-500/20 px-2 py-1 text-blue-100 border border-blue-500/40">
                      {plan.badge}
                    </span>
                  )}
                </div>
                {!plan.highlight && (
                  <span className="text-xs text-gray-400 mb-2 block">{plan.badge}</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-semibold">
                    {plan.priceLabel}
                  </span>
                  <span className="text-gray-300 text-sm md:text-base">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                {isPaymentsDisabled ? (
                  <button
                    disabled
                    className={cn(
                      "w-full mb-6 p-3 md:p-4 text-base md:text-lg rounded-xl transition-all duration-200 block text-center opacity-50 cursor-not-allowed",
                      plan.highlight
                        ? "bg-gradient-to-t from-blue-500 to-blue-600 shadow-lg shadow-blue-800 border border-blue-500 text-white"
                        : "bg-gradient-to-t from-neutral-950 to-neutral-700 shadow-lg shadow-neutral-900 border border-neutral-800 text-white",
                    )}
                    title="Payments temporarily disabled"
                  >
                    Payments Temporarily Disabled
                  </button>
                ) : user ? (
                  <button
                    onClick={() => handleSubscriptionCheckout(plan)}
                    disabled={loadingPlanId === plan.id}
                    className={cn(
                      "w-full mb-6 p-3 md:p-4 text-base md:text-lg rounded-xl transition-all duration-200 block text-center",
                      plan.highlight
                        ? "bg-gradient-to-t from-blue-500 to-blue-600 shadow-lg shadow-blue-800 border border-blue-500 text-white hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        : "bg-gradient-to-t from-neutral-950 to-neutral-700 shadow-lg shadow-neutral-900 border border-neutral-800 text-white hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    {loadingPlanId === plan.id ? 'Loading...' : plan.ctaLabel}
                  </button>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      "w-full mb-6 p-3 md:p-4 text-base md:text-lg rounded-xl transition-all duration-200 block text-center",
                      plan.highlight
                        ? "bg-gradient-to-t from-blue-500 to-blue-600 shadow-lg shadow-blue-800 border border-blue-500 text-white hover:scale-[1.02]"
                        : "bg-gradient-to-t from-neutral-950 to-neutral-700 shadow-lg shadow-neutral-900 border border-neutral-800 text-white hover:scale-[1.02]",
                    )}
                  >
                    {plan.ctaLabel}
                  </Link>
                )}

                <div className="space-y-3 pt-4 border-t border-neutral-700">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <span className="h-2.5 w-2.5 bg-neutral-500 rounded-full" />
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

      {/* ============================================
          SECTION 2: ONE-TIME READINGS
          ============================================ */}
      <div className="relative z-50 mt-20 pb-20">
        <article className="text-center mb-12 max-w-3xl mx-auto space-y-2">
          <h2 className="text-4xl font-medium text-white">
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
              One-Time Readings – No Subscription Needed
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={6}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-gray-300"
          >
            Perfect when you just need a quick answer or deep dive once in a while.
          </TimelineContent>
        </article>

        {/* One-Time Products Cards */}
        <div className="grid md:grid-cols-3 max-w-5xl gap-4 py-6 mx-auto relative z-10 px-4 md:px-0">
          {oneTimeProducts.map((product: OneTimeProduct, index: number) => (
            <TimelineContent
              key={product.id}
              as="div"
              animationNum={7 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <Card
                className={cn(
                  "relative text-white border-neutral-800",
                  product.mostPopular
                    ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#0900ff] z-20"
                    : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10",
                )}
              >
                <CardHeader className="text-left">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl md:text-3xl font-semibold">
                      {product.name}
                    </h3>
                    {product.mostPopular && (
                      <span className="text-xs rounded-full bg-blue-500/20 px-2 py-1 text-blue-100 border border-blue-500/40">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-semibold">
                      ₹{product.amountInINR}
                    </span>
                    <span className="text-gray-300 text-sm md:text-base">
                      one-time
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    {product.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  {isPaymentsDisabled ? (
                    <button
                      disabled
                      className={cn(
                        "w-full mb-6 p-3 md:p-4 text-base md:text-lg rounded-xl transition-all duration-200 block text-center opacity-50 cursor-not-allowed",
                        product.mostPopular
                          ? "bg-gradient-to-t from-blue-500 to-blue-600 shadow-lg shadow-blue-800 border border-blue-500 text-white"
                          : "bg-gradient-to-t from-neutral-950 to-neutral-700 shadow-lg shadow-neutral-900 border border-neutral-800 text-white",
                      )}
                      title="Payments temporarily disabled"
                    >
                      Payments Temporarily Disabled
                    </button>
                  ) : (
                    <Link
                      href={`/pay/${product.productId}`}
                      className={cn(
                        "w-full mb-6 p-3 md:p-4 text-base md:text-lg rounded-xl transition-all duration-200 block text-center",
                        product.mostPopular
                          ? "bg-gradient-to-t from-blue-500 to-blue-600 shadow-lg shadow-blue-800 border border-blue-500 text-white hover:scale-[1.02]"
                          : "bg-gradient-to-t from-neutral-950 to-neutral-700 shadow-lg shadow-neutral-900 border border-neutral-800 text-white hover:scale-[1.02]",
                      )}
                    >
                      Get {product.name}
                    </Link>
                  )}

                  <div className="space-y-3 pt-4 border-t border-neutral-700">
                    <ul className="space-y-2">
                      {product.bullets.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <span className="h-2.5 w-2.5 bg-neutral-500 rounded-full" />
                          <span>{bullet}</span>
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
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CreditCard, ShieldCheck, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import {
  getAllOneTimeProducts,
  getAllSubscriptionPlans,
  type OneTimeProduct,
  type SubscriptionPlan,
} from "@/lib/pricing/plans";

const isPaymentsDisabled = process.env.NEXT_PUBLIC_DISABLE_PAYMENTS === "true";

function productEntitlementSummary(product: OneTimeProduct) {
  const items: string[] = [];
  if (product.tickets.aiQuestions) items.push(`${product.tickets.aiQuestions} Guru question${product.tickets.aiQuestions > 1 ? "s" : ""}`);
  if (product.tickets.kundaliBasic) items.push(`${product.tickets.kundaliBasic} Kundali ticket`);
  if (product.tickets.predictions) items.push(`${product.tickets.predictions} prediction credit`);
  return items.join(" + ") || product.description;
}

function recommendationForPlan(plan: SubscriptionPlan) {
  if (plan.id === "starter") return "Best when you want light daily guidance.";
  if (plan.id === "advanced") return "Best when you use Kundali, Guru, and forecasts regularly.";
  return "Best for families, reports, and broader life-planning workflows.";
}

function recommendationForProduct(product: OneTimeProduct) {
  if (product.id === "quick_99") return "For one direct question.";
  if (product.id === "deep_199") return "For follow-up questions and a basic Kundali use.";
  return "For prediction access without a subscription.";
}

export default function PricingSection6() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const subscriptionPlans = getAllSubscriptionPlans();
  const oneTimeProducts = getAllOneTimeProducts();

  const handleSubscriptionCheckout = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isPaymentsDisabled) {
      alert("Payments are temporarily disabled. Please try again later or use a one-time reading.");
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ planId: plan.id }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.subscriptionId) {
        const message =
          data?.error ||
          data?.message ||
          `Failed to create subscription for plan "${plan.name}".`;
        throw new Error(message);
      }

      if (typeof window !== "undefined" && !(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const rzp = new Razorpay({
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "JyotiAI",
        description: plan.description,
        prefill: {
          email: user.email || "",
          name: user.name || "",
        },
        theme: {
          color: "#F2C94C",
        },
        handler: async () => {
          await fetch("/api/subscriptions/status?refresh=true", {
            credentials: "include",
          });
          router.push("/payments");
        },
        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
          },
        },
      });

      rzp.open();
    } catch (error: any) {
      console.error("Subscription checkout error:", error);
      alert(error?.message || "Failed to start subscription checkout");
      setLoadingPlanId(null);
    }
  };

  return (
    <div
      data-pricing-celestial="true"
      className="relative overflow-hidden rounded-[30px] border border-[#d9b75f]/18 bg-[#030b10] text-[#fff6df] shadow-[0_28px_90px_rgba(0,0,0,0.38)]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(239,170,79,0.14),transparent_28rem),radial-gradient(circle_at_86%_12%,rgba(70,145,145,0.09),transparent_30rem),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_34rem)]"
        aria-hidden="true"
      />
      <div className="relative space-y-14 p-5 sm:p-8 lg:p-10">
        {isPaymentsDisabled && (
          <div className="rounded-xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm text-primary" role="status">
            Payments are temporarily disabled for maintenance. You can still review the available plans.
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <Badge variant="guru" className="w-fit">Free start</Badge>
            <h2 className="max-w-3xl font-heading text-3xl font-semibold leading-tight text-[#fff6df] md:text-5xl">
              Start with your free Kundali, then choose tickets or a monthly plan.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-[#aab5b2] md:text-lg">
              New users can complete onboarding and generate their first basic Kundali for free. Guru questions, additional Kundali use, predictions, and reports follow the paid access shown below.
            </p>
          </div>
          <Card variant="base" size="lg" className="bg-[#07131F] text-[#FFF7E8]">
            <CardHeader className="p-0">
              <CardTitle className="text-[#FFF7E8]">How to choose</CardTitle>
            </CardHeader>
            <CardContent className="mt-4 space-y-3 p-0 text-sm leading-6 text-[#B9C2BF]">
              <p><span className="font-medium text-[#FFF7E8]">Free:</span> first basic Kundali during onboarding.</p>
              <p><span className="font-medium text-[#FFF7E8]">One-time:</span> specific Guru, Kundali, or prediction credits.</p>
              <p><span className="font-medium text-[#FFF7E8]">Subscription:</span> ongoing monthly access based on the selected plan.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5" aria-labelledby="subscription-plans">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-saffron">Subscriptions</p>
              <h3 id="subscription-plans" className="mt-2 font-heading text-2xl font-semibold text-[#fff6df] md:text-3xl">
                Monthly plans
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#9eaaa6]">
              Subscription access is granted only by the canonical active subscription state after payment processing.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                variant={plan.highlight ? "glow" : "base"}
                size="lg"
                className={cn(
                  "flex h-full flex-col border-[#d9b75f]/18 bg-[linear-gradient(155deg,rgba(10,24,30,0.99),rgba(5,13,18,0.99))] text-[#fff6df] shadow-[0_24px_70px_rgba(0,0,0,0.34)]",
                  plan.highlight &&
                    "border-[#efaa4f]/70 bg-[radial-gradient(circle_at_82%_0%,rgba(239,170,79,0.12),transparent_15rem),linear-gradient(155deg,rgba(13,29,35,0.99),rgba(5,13,18,0.99))] shadow-[0_28px_100px_rgba(239,170,79,0.12)]"
                )}
              >
                <CardHeader className="p-0">
                  <div className="flex min-h-10 items-start justify-between gap-3">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="mt-2 text-sm text-[#9eaaa6]">{plan.description}</p>
                    </div>
                    {plan.highlight && <Badge variant="premium">{plan.badge}</Badge>}
                  </div>
                  {!plan.highlight && <p className="mt-3 text-sm font-medium text-primary">{plan.badge}</p>}
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-heading text-4xl font-semibold text-[#fff6df]">{plan.priceLabel}</span>
                    <span className="text-sm text-[#9eaaa6]">{plan.period}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-teal">{recommendationForPlan(plan)}</p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col p-0 pt-6">
                  <ul className="space-y-3 text-sm leading-6 text-[#aab5b2]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    {isPaymentsDisabled ? (
                      <Button disabled fullWidth size="lg">Payments temporarily disabled</Button>
                    ) : user ? (
                      <Button
                        onClick={() => handleSubscriptionCheckout(plan)}
                        disabled={loadingPlanId === plan.id}
                        loading={loadingPlanId === plan.id}
                        fullWidth
                        size="lg"
                        variant={plan.highlight ? "primary" : "outline"}
                      >
                        {loadingPlanId === plan.id ? "Starting checkout" : plan.ctaLabel}
                      </Button>
                    ) : (
                      <Link
                        href={plan.ctaHref}
                        className={cn(
                          "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-6 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          plan.highlight
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border bg-surface-raised text-primary hover:border-saffron hover:bg-surface-sunken"
                        )}
                      >
                        {plan.ctaLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-5" aria-labelledby="one-time-products">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-saffron">No subscription</p>
              <h3 id="one-time-products" className="mt-2 font-heading text-2xl font-semibold text-[#fff6df] md:text-3xl">
                One-time purchases
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#9eaaa6]">
              Buy a specific reading pack when you do not need monthly access.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {oneTimeProducts.map((product) => (
              <Card
                key={product.id}
                variant={product.mostPopular ? "glow" : "base"}
                size="lg"
                className={cn(
                  "flex h-full flex-col border-[#d9b75f]/18 bg-[linear-gradient(155deg,rgba(10,24,30,0.99),rgba(5,13,18,0.99))] text-[#fff6df] shadow-[0_24px_70px_rgba(0,0,0,0.34)]",
                  product.mostPopular &&
                    "border-[#efaa4f]/70 bg-[radial-gradient(circle_at_82%_0%,rgba(239,170,79,0.12),transparent_15rem),linear-gradient(155deg,rgba(13,29,35,0.99),rgba(5,13,18,0.99))] shadow-[0_28px_100px_rgba(239,170,79,0.12)]"
                )}
              >
                <CardHeader className="p-0">
                  <div className="flex min-h-10 items-start justify-between gap-3">
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <p className="mt-2 text-sm text-[#9eaaa6]">{product.description}</p>
                    </div>
                    {product.mostPopular && <Badge variant="premium">Most popular</Badge>}
                  </div>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-heading text-4xl font-semibold text-[#fff6df]">₹{product.amountInINR}</span>
                    <span className="text-sm text-[#9eaaa6]">one-time</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-teal">{recommendationForProduct(product)}</p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col p-0 pt-6">
                  <div className="mb-4 rounded-lg border border-[#d9b75f]/18 bg-[#08151b] px-3 py-2 text-sm font-medium text-[#f7f1e7]">
                    <Ticket className="mr-2 inline h-4 w-4 text-saffron" aria-hidden="true" />
                    {productEntitlementSummary(product)}
                  </div>
                  <ul className="space-y-3 text-sm leading-6 text-[#aab5b2]">
                    {product.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    {isPaymentsDisabled ? (
                      <Button disabled fullWidth size="lg">Payments temporarily disabled</Button>
                    ) : (
                      <Link
                        href={`/pay/${product.productId}`}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Get {product.name}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Payment and product notes">
          <Card
            variant="base"
            size="lg"
            className="border-[#d9b75f]/18 bg-[#08151b] text-[#fff6df]"
          >
            <ShieldCheck className="h-6 w-6 text-saffron" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-xl font-semibold text-[#fff6df]">Secure checkout</h3>
            <p className="mt-2 text-sm leading-6 text-[#9eaaa6]">
              Payments are processed through Razorpay. JyotiAI does not store card details.
            </p>
          </Card>
          <Card
            variant="base"
            size="lg"
            className="border-[#d9b75f]/18 bg-[#08151b] text-[#fff6df]"
          >
            <CreditCard className="h-6 w-6 text-saffron" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-xl font-semibold text-[#fff6df]">Access after payment</h3>
            <p className="mt-2 text-sm leading-6 text-[#9eaaa6]">
              Tickets and subscription access are applied by the server after payment verification.
            </p>
          </Card>
          <Card variant="base" size="lg" className="bg-[#07131F] text-[#FFF7E8]">
            <h3 className="font-heading text-xl font-semibold text-[#FFF7E8]">Not sure?</h3>
            <p className="mt-2 text-sm leading-6 text-[#B9C2BF]">
              Start free with onboarding, then use a one-time pack before choosing a monthly plan.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#F28C28] px-5 text-sm font-medium text-[#07131F] hover:bg-[#F28C28]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C28] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131F]"
            >
              Get my free reading
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Card>
        </section>

      <style jsx global>{`
        /* P4.8A3.2 pricing celestial fallback */
        [data-pricing-celestial="true"] .bg-card,
        [data-pricing-celestial="true"] [class*="bg-card"] {
          background-color: #08151b !important;
          color: #fff6df !important;
        }

        [data-pricing-celestial="true"] .text-primary {
          color: #fff6df !important;
        }

        [data-pricing-celestial="true"] .text-muted-foreground {
          color: #aab5b2 !important;
        }

        [data-pricing-celestial="true"] .border-border {
          border-color: rgba(217, 183, 95, 0.18) !important;
        }

        [data-pricing-celestial="true"] .bg-surface-raised,
        [data-pricing-celestial="true"] .bg-surface-sunken {
          background-color: #08151b !important;
        }
      `}</style>
      </div>
    </div>
  );
}

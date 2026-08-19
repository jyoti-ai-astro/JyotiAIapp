"use client";

import { useEffect, useState } from "react";
import {
  getSubscriptionPlan,
  type SubscriptionPlanId,
} from "@/lib/pricing/plans";

interface SubscriptionStatusResponse {
  active: boolean;
  planId: SubscriptionPlanId | null;
  productId: string | null;
  razorpaySubscriptionId: string | null;
  status: string | null;
}

export default function PaymentsPage() {
  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/subscriptions/status", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }

        const json = (await res.json()) as SubscriptionStatusResponse;
        setStatus(json);
      } catch (err: any) {
        setError(err?.message || "Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const plan =
    status?.planId && typeof status.planId === "string"
      ? getSubscriptionPlan(status.planId)
      : null;

  const hasAnySubscription = !!plan;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Payments
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage your subscription and payments
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
          <h2 className="text-xl font-medium">Current Subscription</h2>
          <p className="mt-1 text-sm text-slate-400">
            Your active subscription plan
          </p>

          {loading && (
            <p className="mt-4 text-sm text-slate-300">
              Checking your subscription…
            </p>
          )}

          {!loading && error && (
            <p className="mt-4 text-sm text-red-400">
              {error} – we couldn&apos;t load your subscription right now.
            </p>
          )}

          {!loading && !error && !hasAnySubscription && (
            <p className="mt-4 text-sm text-slate-300">
              No active subscription
            </p>
          )}

          {!loading && !error && hasAnySubscription && plan && status && (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide">
                    {status.active ? (
                      <span className="text-emerald-400">Active</span>
                    ) : (
                      <span className="text-amber-300">
                        Not active yet ({status.status || "pending"})
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-lg font-semibold">
                    {plan.name} • {plan.priceLabel}
                    <span className="ml-1 text-sm font-normal text-slate-400">
                      {plan.period}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-300">
                    {plan.description}
                  </p>

                  {!status.active && (
                    <p className="mt-2 text-xs text-slate-400">
                      We can see a subscription for this plan in Razorpay, but
                      it&apos;s not marked as active yet. If you just paid,
                      Razorpay may take a short time to update the status. You
                      can refresh this page after a while, or try the payment
                      again if it remains in the{" "}
                      <span className="font-mono">{status.status}</span> state.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-400">
                  <div className="font-semibold text-slate-200">
                    Technical details
                  </div>
                  <div className="mt-1 break-all font-mono">
                    Status: {status.status || "unknown"}
                  </div>
                  {status.razorpaySubscriptionId && (
                    <div className="mt-1 break-all font-mono">
                      Sub ID: {status.razorpaySubscriptionId}
                    </div>
                  )}
                  {status.productId && (
                    <div className="mt-1 break-all font-mono">
                      Plan Product: {status.productId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


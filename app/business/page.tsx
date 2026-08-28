/**
 * Business Page
 *
 * Batch 4 - App Internal Screens Part 2
 *
 * Business idea compatibility checker
 */

"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { useBusiness } from "@/lib/hooks/useBusiness";
import DashboardPageShell from "@/src/ui/layout/DashboardPageShell";
import { LoadingState } from '@/components/ui/feedback-state'
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { BusinessEngine } from "@/components/engines/BusinessEngine";
import { OneTimeOfferBanner } from "@/components/paywall/OneTimeOfferBanner";
import { useTicketAccess } from "@/lib/access/useTicketAccess";
import { getFeatureAccess } from "@/lib/payments/feature-access";
import { checkFeatureAccess } from "@/lib/access/checkFeatureAccess";
import type { AstroContext } from "@/lib/engines/astro-types";
import Link from "next/link";

import { authenticatedJsonRead } from '@/lib/client/authenticated-read'
export default function BusinessPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const featureKey = "business" as const;
  const {
    hasAccess,
    hasSubscription,
    tickets,
    loading: ticketLoading,
    config,
  } = useTicketAccess(featureKey);
  const featureConfig = getFeatureAccess(featureKey);
  const { analysis, loading, error, analyze } = useBusiness();
  const [businessIdea, setBusinessIdea] = useState("");
  const [astro, setAstro] = useState<AstroContext | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (hasAccess && !ticketLoading) {
      fetchAstroContext();
    }
  }, [user, router, hasAccess, ticketLoading]);

  const fetchAstroContext = async () => {
    if (!user?.uid) return

    try {
      const data = await authenticatedJsonRead<{ astro: AstroContext }>(
        '/api/astro/context',
        { ttlMs: 60_000 }
      )
      setAstro(data.astro)
    } catch (err) {
      console.error('Error fetching astro context:', err)
    }
  }

  const handleAnalyze = async () => {
    if (!businessIdea.trim()) {
      alert("Please enter a business idea");
      return;
    }

    // Check access before analyzing
    const access = await checkFeatureAccess(user, "business");
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || "/pay/199");
      }
      return;
    }


    await analyze(businessIdea);


  };

  if (!user) {
    return (
      <DashboardPageShell
        title="Business Compatibility"
        subtitle="Restoring your JyotiAI session."
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <LoadingState
            title="Opening Business Compatibility"
            description="Preparing your business workspace."
          />
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Business Compatibility"
      subtitle="Check if your business idea aligns with your cosmic blueprint"
    >
      <div className="space-y-8">
        {/* Context Panel */}
        <div className="mb-8">
          <OneTimeOfferBanner
            title="Unlock Full Insights"
            description="This module uses your birth chart & predictions powered by Guru Brain."
            priceLabel="₹199"
            ctaLabel="Unlock Now"
            ctaHref="/pay/199"
          />
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-[#dba84c]/15 bg-[linear-gradient(145deg,rgba(15,25,28,0.97),rgba(8,17,21,0.97))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.16)] md:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#dba84c]/20 bg-[#dba84c]/10">
            <Briefcase className="h-5 w-5 text-[#e5a44a]" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c99445]">
            Venture Observatory
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#f5eee2] md:text-4xl">
            Business Compatibility
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a9a49b] md:text-base">
            Evaluate whether a venture aligns with your current astrological
            blueprint.
          </p>
        </section>

        {astro && (
          <section className="rounded-2xl border border-[#dba84c]/15 bg-[linear-gradient(145deg,rgba(15,25,28,0.97),rgba(8,17,21,0.97))] p-5 md:p-6">
            <h2 className="font-semibold text-[#f5eee2]">Birth Context</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Sun Sign", astro.coreChart?.sunSign || "N/A"],
                ["Moon Sign", astro.coreChart?.moonSign || "N/A"],
                ["Ascendant", astro.coreChart?.ascendantSign || "N/A"],
                ["Major Dasha", astro.dasha?.currentMahadasha?.planet || "N/A"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[#dba84c]/10 bg-[#0b1519]/80 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-[#777b77]">
                    {label}
                  </p>
                  <p className="mt-2 font-medium text-[#eee7dc]">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <BusinessEngine />

        {/* Ask Guru With Context Button */}
        {astro && (
          <div className="text-center mb-4">
            <Button
              onClick={() =>
                router.push(
                  `/guru?source=business`,
                )
              }
              className="min-h-11 border border-[#e0a84d]/60 bg-[#e99a34] px-5 font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
            >
              Ask Guru With My Birth Context
            </Button>
          </div>
        )}

        <div className="text-center">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="min-h-11 border-[#dba84c]/20 bg-transparent text-[#d8d2c7] hover:bg-[#dba84c]/[0.06] hover:text-[#fff8eb]"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </DashboardPageShell>
  );
}

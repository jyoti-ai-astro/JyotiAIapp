/**
 * Career Destiny Page
 *
 * H1 Product Migration
 * Presentation normalized to JyotiAI dark observatory system.
 * Existing APIs, access checks and calculation behavior preserved.
 */

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardPageShell from "@/src/ui/layout/DashboardPageShell";
import { OneTimeOfferBanner } from "@/components/paywall/OneTimeOfferBanner";
import { useTicketAccess } from "@/lib/access/useTicketAccess";
import { checkFeatureAccess } from "@/lib/access/checkFeatureAccess";
import type { AstroContext } from "@/lib/engines/astro-types";

const panel =
  "rounded-2xl border border-[#dba84c]/15 bg-[linear-gradient(145deg,rgba(15,25,28,0.97),rgba(8,17,21,0.97))] shadow-[0_18px_55px_rgba(0,0,0,0.16)]";

const mutedPanel = "rounded-xl border border-[#dba84c]/10 bg-[#0b1519]/80";

export default function CareerPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { hasAccess, loading: ticketLoading } = useTicketAccess("career");

  const [loading, setLoading] = useState(false);
  const [careerData, setCareerData] = useState<any>(null);
  const [businessIdea, setBusinessIdea] = useState("");
  const [businessResult, setBusinessResult] = useState<any>(null);
  const [astro, setAstro] = useState<AstroContext | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (hasAccess && !ticketLoading) {
      loadCareerData();
      fetchAstroContext();
    }
  }, [user, router, hasAccess, ticketLoading]);

  const fetchAstroContext = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch("/api/astro/context", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAstro(data.astro);
      }
    } catch (err) {
      console.error("Error fetching astro context:", err);
    }
  };

  const loadCareerData = async () => {
    try {
      const response = await fetch("/api/career/analyze", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCareerData(data);
      }
    } catch (error) {
      console.error("Career data error:", error);
    }
  };

  const checkBusinessCompatibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const access = await checkFeatureAccess(user, "career");

      if (!access.allowed) {
        if (access.redirect || access.redirectTo) {
          router.push(access.redirect || access.redirectTo || "/pay/199");
        }

        setLoading(false);
        return;
      }


      const response = await fetch("/api/business/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessName: businessIdea,
          businessType: "general",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze business compatibility");
      }

      const data = await response.json();
      setBusinessResult(data.compatibility);


    } catch (error: any) {
      console.error("Business compatibility error:", error);
      alert(error.message || "Failed to analyze business compatibility");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (ticketLoading) {
    return (
      <DashboardPageShell
        title="Career Destiny"
        subtitle="Preparing your professional blueprint"
      >
        <div className={`${panel} flex min-h-64 items-center justify-center`}>
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#dba84c]/20 border-t-[#e5a44a]" />
            <p className="mt-4 text-sm text-[#a9a49b]">
              Loading career intelligence…
            </p>
          </div>
        </div>
      </DashboardPageShell>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardPageShell
        title="Career Destiny"
        subtitle="Discover your professional path"
      >
        <div data-career-locked-state="true" className="space-y-6">
          <OneTimeOfferBanner feature="Career Insights" productId="299" />

          <section className={`${panel} relative overflow-hidden p-6 md:p-8`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#dba84c]/10"
            />

            <div className="relative z-10 max-w-3xl">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#dba84c]/20 bg-[#dba84c]/10">
                <Briefcase className="h-5 w-5 text-[#e5a44a]" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c99445]">
                Professional Observatory
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#f5eee2] md:text-3xl">
                Your Career Destiny
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a9a49b] md:text-base">
                Compare employment, entrepreneurship and hybrid potential
                through your astrological blueprint. Unlock the reading to
                calculate your personal scores, timing signals and professional
                recommendation.
              </p>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "Career Signal",
                "Compare job, business and hybrid potential through one connected professional reading.",
              ],
              [
                "Recommendation",
                "Receive a chart-led professional direction based on your current astrological context.",
              ],
              [
                "Business Compatibility",
                "Test a business idea against your personal career and planetary signals.",
              ],
            ].map(([title, description]) => (
              <section key={title} className={`${mutedPanel} p-5`}>
                <p className="font-medium text-[#eee7dc]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#8f918c]">
                  {description}
                </p>
              </section>
            ))}
          </div>

          <p className="text-center text-xs leading-5 text-[#777b77]">
            Unlocking changes access only. Your existing JyotiAI account,
            Kundali and saved profile remain unchanged.
          </p>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Career Destiny"
      subtitle="Career direction, business potential and professional timing from your cosmic blueprint"
    >
      <div className="space-y-8">
        <section className={`${panel} relative overflow-hidden p-6 md:p-8`}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#dba84c]/10"
          />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#dba84c]/20 bg-[#dba84c]/10">
              <Briefcase className="h-5 w-5 text-[#e5a44a]" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c99445]">
              Professional Observatory
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#f5eee2] md:text-4xl">
              Your Career Destiny
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a9a49b] md:text-base">
              Compare employment, entrepreneurship and hybrid potential through
              your current astrological context.
            </p>
          </div>
        </section>

        {astro && (
          <section className={`${panel} p-5 md:p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-[#e5a44a]" />
              <div>
                <h2 className="font-semibold text-[#f5eee2]">Birth Context</h2>
                <p className="text-xs text-[#8f918c]">
                  Current chart anchors used across JyotiAI
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Sun Sign", astro.coreChart?.sunSign || "N/A"],
                ["Moon Sign", astro.coreChart?.moonSign || "N/A"],
                ["Ascendant", astro.coreChart?.ascendantSign || "N/A"],
                ["Major Dasha", astro.dasha?.currentMahadasha?.planet || "N/A"],
              ].map(([label, value]) => (
                <div key={label} className={`${mutedPanel} p-4`}>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#777b77]">
                    {label}
                  </p>
                  <p className="mt-2 font-medium text-[#eee7dc]">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {careerData ? (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#f5eee2]">
                Career Signal
              </h2>
              <p className="mt-1 text-sm text-[#8f918c]">
                Relative strength across your three professional paths.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Job", careerData.jobScore || 48],
                ["Business", careerData.businessScore || 84],
                ["Hybrid", careerData.hybridScore || 62],
              ].map(([label, score], index) => (
                <motion.div
                  key={String(label)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`${panel} p-6`}
                >
                  <p className="text-sm text-[#9f9b94]">{label} Score</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-[#e5a44a]">
                      {String(score)}
                    </span>
                    <span className="pb-1 text-sm text-[#777b77]">/100</span>
                  </div>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#1b2528]">
                    <div
                      className="h-full rounded-full bg-[#c99445]"
                      style={{
                        width: `${Math.min(100, Number(score))}%`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ) : (
          <section className={`${panel} p-6`}>
            <p className="text-sm text-[#a9a49b]">
              Career analysis is not available yet. Your chart context remains
              accessible while JyotiAI prepares this signal.
            </p>
          </section>
        )}

        {careerData && (
          <section className={`${panel} p-6 md:p-7`}>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dba84c]/20 bg-[#dba84c]/10">
                <TrendingUp className="h-4 w-4 text-[#e5a44a]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c99445]">
                  Recommendation
                </p>

                <p className="mt-3 leading-7 text-[#e6dfd4]">
                  {careerData.recommendation ||
                    "You should do BUSINESS. Your Rashi, Dasha, and Palm lines show leadership energy."}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className={`${panel} p-6 md:p-7`}>
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#5f9698]/20 bg-[#5f9698]/10">
              <Lightbulb className="h-4 w-4 text-[#7ca9a9]" />
            </div>

            <div>
              <h2 className="font-semibold text-[#f5eee2]">
                Business Idea Compatibility
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#9f9b94]">
                Test whether a business idea aligns with your astrological
                profile.
              </p>
            </div>
          </div>

          <form onSubmit={checkBusinessCompatibility} className="space-y-4">
            <Input
              type="text"
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              placeholder="e.g., I want to open a chai café"
              required
              className="min-h-12 border-[#dba84c]/15 bg-[#071115] text-[#f5eee2] placeholder:text-[#666d6c] focus-visible:ring-[#c99445]/40"
            />

            <Button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full border border-[#e0a84d]/60 bg-[#e99a34] font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
            >
              {loading ? "Analyzing…" : "Check Compatibility"}
            </Button>
          </form>

          {businessResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid gap-4 md:grid-cols-3"
            >
              <div className={`${mutedPanel} p-5 md:col-span-3`}>
                <p className="text-xs uppercase tracking-[0.14em] text-[#777b77]">
                  Suitability Score
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#e5a44a]">
                  {businessResult.suitabilityScore || 92}
                  <span className="ml-1 text-sm text-[#777b77]">/100</span>
                </p>
              </div>

              <div className={`${mutedPanel} p-4`}>
                <p className="text-xs text-[#8f918c]">Risk Score</p>
                <p className="mt-2 text-xl font-semibold text-[#d7c3a5]">
                  {businessResult.riskScore || 18}/100
                </p>
              </div>

              <div className={`${mutedPanel} p-4`}>
                <p className="text-xs text-[#8f918c]">Planet Support</p>
                <p className="mt-2 font-medium text-[#d8e0da]">
                  {businessResult.planetSupport || "Strong Jupiter & Moon"}
                </p>
              </div>

              {businessResult.recommendedLaunchMonth && (
                <div className={`${mutedPanel} p-4`}>
                  <p className="text-xs text-[#8f918c]">Launch Window</p>
                  <p className="mt-2 font-medium text-[#e5a44a]">
                    {businessResult.recommendedLaunchMonth}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {astro && (
            <Button
              onClick={() =>
                router.push(
                  `/guru?source=career`,
                )
              }
              className="min-h-11 border border-[#e0a84d]/60 bg-[#e99a34] px-5 font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
            >
              Ask Guru With My Birth Context
            </Button>
          )}

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

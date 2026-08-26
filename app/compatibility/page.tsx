/**
 * Compatibility Screen
 *
 * Master Plan v1.0 - Section 9: Compatibility Screen
 * Cosmic-themed compatibility checker
 */

"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { useCompatibility } from "@/lib/hooks/useCompatibility";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import DashboardPageShell from "@/src/ui/layout/DashboardPageShell";
import { Heart, Sparkles, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { OneTimeOfferBanner } from "@/components/paywall/OneTimeOfferBanner";
import { useTicketAccess } from "@/lib/access/useTicketAccess";
import { getFeatureAccess } from "@/lib/payments/feature-access";
import { checkFeatureAccess } from "@/lib/access/checkFeatureAccess";
import type { AstroContext } from "@/lib/engines/astro-types";

export default function CompatibilityPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const featureKey = "compatibility" as const;
  const {
    hasAccess,
    hasSubscription,
    tickets,
    loading: ticketLoading,
    config,
  } = useTicketAccess(featureKey);
  const featureConfig = getFeatureAccess(featureKey);
  const { analysis, loading, analyzeCompatibility } = useCompatibility();
  const [partnerData, setPartnerData] = useState({
    name: "",
    dob: "",
    tob: "",
    pob: "",
    rashi: "",
  });
  const [astro, setAstro] = useState<AstroContext | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (hasAccess && !ticketLoading) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    // Check access before analyzing
    const access = await checkFeatureAccess(user, "compatibility");
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || "/pay/199");
      }
      return;
    }


    const partner1: any = {
      name: user.name || "You",
      dob: user.dob || "",
      rashi: user.rashi || "",
    };

    const partner2 = {
      name: partnerData.name,
      dob: partnerData.dob,
      tob: partnerData.tob,
      pob: partnerData.pob,
      rashi: partnerData.rashi,
    };

    await analyzeCompatibility(partner1, partner2);


  };

  if (!user) {
    return null;
  }

  return (
    <DashboardPageShell
      title="Compatibility Analysis"
      subtitle="Check relationship compatibility and marriage timing with your partner"
    >
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

      {/* Astro Summary Block */}
      {astro && (
        <div className="mb-10 rounded-2xl border border-[#dba84c]/15 bg-[linear-gradient(145deg,rgba(15,25,28,0.97),rgba(8,17,21,0.97))] p-6">
          <h3 className="text-[#e5a44a] font-heading text-xl mb-2">
            Astro Summary
          </h3>
          <p className="text-sm text-[#a9a49b]">
            Sun Sign: {astro.coreChart?.sunSign || "N/A"}
          </p>
          <p className="text-sm text-[#a9a49b]">
            Moon Sign: {astro.coreChart?.moonSign || "N/A"}
          </p>
          <p className="text-sm text-[#a9a49b]">
            Ascendant: {astro.coreChart?.ascendantSign || "N/A"}
          </p>
          <p className="mt-4 text-sm text-[#a9a49b]">
            Next Major Dasha: {astro.dasha?.currentMahadasha?.planet || "N/A"}
          </p>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Heart className="mx-auto mb-4 h-12 w-12 text-[#e5a44a]" />
        </motion.div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#f5eee2] md:text-4xl">
          Compatibility Analysis
        </h1>
        <p className="text-[#a9a49b] max-w-2xl mx-auto">
          Discover your compatibility with your partner through Kundali and
          Numerology
        </p>
      </motion.div>

      {/* Partner Details Form */}
      {!analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-[#dba84c]/15 bg-[#0b1519]/80">
            <CardHeader>
              <CardTitle className="text-[#d8d2c7] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Enter Partner Details
              </CardTitle>
              <CardDescription className="text-[#a9a49b]">
                Provide your partner's birth details for compatibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#a9a49b]">
                    Partner Name
                  </label>
                  <Input
                    type="text"
                    value={partnerData.name}
                    onChange={(e) =>
                      setPartnerData({ ...partnerData, name: e.target.value })
                    }
                    required
                    placeholder="Enter partner's full name"
                    className="border-[#dba84c]/15 bg-[#071115] text-[#f5eee2] placeholder:text-[#666d6c] focus-visible:ring-[#c99445]/40"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#a9a49b]">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={partnerData.dob}
                    onChange={(e) =>
                      setPartnerData({ ...partnerData, dob: e.target.value })
                    }
                    required
                    className="border-[#dba84c]/15 bg-[#071115] text-[#f5eee2] placeholder:text-[#666d6c] focus-visible:ring-[#c99445]/40"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#a9a49b]">
                    Time of Birth
                  </label>
                  <Input
                    type="time"
                    value={partnerData.tob}
                    onChange={(e) =>
                      setPartnerData({ ...partnerData, tob: e.target.value })
                    }
                    required
                    className="border-[#dba84c]/15 bg-[#071115] text-[#f5eee2] placeholder:text-[#666d6c] focus-visible:ring-[#c99445]/40"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#a9a49b]">
                    Place of Birth
                  </label>
                  <Input
                    type="text"
                    value={partnerData.pob}
                    onChange={(e) =>
                      setPartnerData({ ...partnerData, pob: e.target.value })
                    }
                    required
                    placeholder="e.g., Mumbai, India"
                    className="border-[#dba84c]/15 bg-[#071115] text-[#f5eee2] placeholder:text-[#666d6c] focus-visible:ring-[#c99445]/40"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full border border-[#e0a84d]/60 bg-[#e99a34] text-[#160d04] hover:bg-[#f1aa4d]"
                >
                  {loading
                    ? "Analyzing Compatibility..."
                    : "Check Compatibility"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Compatibility Score */}
          <Card className="border-[#dba84c]/15 bg-[#0b1519]/80">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <p className="text-[#a9a49b] text-lg">Compatibility Score</p>
                <motion.p
                  className="text-7xl font-bold text-[#e5a44a]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {analysis.score.overall}/100
                </motion.p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-sm text-[#a9a49b]">Love</p>
                    <p className="text-xl font-semibold text-[#b9c9bc]">
                      {analysis.score.love}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#a9a49b]">Career</p>
                    <p className="text-xl font-semibold text-[#8fb0b1]">
                      {analysis.score.career}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#a9a49b]">Communication</p>
                    <p className="text-xl font-semibold text-[#c9b99d]">
                      {analysis.score.communication}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#a9a49b]">Long-term</p>
                    <p className="text-xl font-semibold text-[#d8b47b]">
                      {analysis.score.longTerm}%
                    </p>
                  </div>
                </div>
                {analysis.marriageTiming && (
                  <div className="mt-4 p-4 bg-[#dba84c]/[0.06] border border-[#dba84c]/15 rounded-lg">
                    <p className="text-sm text-[#e5a44a] font-semibold mb-2">
                      Best Marriage Period
                    </p>
                    <p className="text-[#f5eee2]">
                      {analysis.marriageTiming.bestPeriod}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card className="border-[#dba84c]/15 bg-[#0b1519]/80">
              <CardHeader>
                <CardTitle className="text-[#b9c9bc]">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[#a9a49b]"
                    >
                      <span className="text-[#b9c9bc] mt-1">•</span>
                      <div>
                        <p className="font-semibold">{strength.area}</p>
                        <p className="text-sm text-white/70">
                          {strength.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Risks */}
          {analysis.risks && analysis.risks.length > 0 && (
            <Card className="border-[#dba84c]/15 bg-[#0b1519]/80">
              <CardHeader>
                <CardTitle className="text-[#d8b47b]">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.risks.map((risk, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[#a9a49b]"
                    >
                      <span className="text-[#d8b47b] mt-1">•</span>
                      <div>
                        <p className="font-semibold">{risk.area}</p>
                        <p className="text-sm text-white/70">
                          {risk.description}
                        </p>
                        {risk.remedy && (
                          <p className="text-xs text-[#e5a44a] mt-1">
                            Remedy: {risk.remedy}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {analysis.summary && (
            <Card className="border-[#dba84c]/15 bg-[#0b1519]/80">
              <CardHeader>
                <CardTitle className="text-[#e5a44a]">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#a9a49b] leading-relaxed">
                  {analysis.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card className="border-[#dba84c]/15 bg-[#0b1519]/80">
              <CardHeader>
                <CardTitle className="text-[#c9b99d] flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[#a9a49b]"
                    >
                      <span className="text-[#c9b99d] mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              onClick={() => {
                setPartnerData({
                  name: "",
                  dob: "",
                  tob: "",
                  pob: "",
                  rashi: "",
                });
              }}
              className="border-[#dba84c]/20 bg-transparent text-[#a9a49b] hover:bg-[#dba84c]/[0.06] hover:text-[#fff8eb]"
            >
              Analyze Another Partner
            </Button>
          </div>
        </motion.div>
      )}

      {/* Back Button */}
      {/* Ask Guru With Context Button */}
      {astro && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={() =>
              router.push(
                `/guru?source=compatibility`,
              )
            }
            className="min-h-11 border border-[#e0a84d]/60 bg-[#e99a34] px-5 font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
          >
            Ask Guru With My Birth Context
          </Button>
        </div>
      )}

      <div className="flex justify-center">
        <Link href="/dashboard">
          <Button className="border-[#dba84c]/20 bg-transparent text-[#a9a49b] hover:bg-[#dba84c]/[0.06] hover:text-[#fff8eb]">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </DashboardPageShell>
  );
}

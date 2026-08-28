"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import DashboardPageShell from "@/src/ui/layout/DashboardPageShell";
import { LoadingState } from '@/components/ui/feedback-state'
import { CosmicNumerology } from "@/components/numerology/CosmicNumerology";
import { OneTimeOfferBanner } from "@/components/paywall/OneTimeOfferBanner";
import { checkFeatureAccess } from "@/lib/access/checkFeatureAccess";
import type { AstroContext } from "@/lib/engines/astro-types";
import type { NumerologyProfile } from "@/lib/engines/numerology/calculator";

import { authenticatedJsonRead } from '@/lib/client/authenticated-read'
export default function NumerologyPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    mobileNumber: "",
    vehicleNumber: "",
    houseNumber: "",
  });
  const [astro, setAstro] = useState<AstroContext | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Pre-fill with user data
    if (user.name) {
      setFormData((prev) => ({ ...prev, fullName: user.name || "" }));
    }
    if (user.dob) {
      setFormData((prev) => ({ ...prev, birthDate: user.dob || "" }));
    }

    // Load existing numerology
    loadNumerology();
    fetchAstroContext();
  }, [user, router]);

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

  const loadNumerology = async () => {
    try {
      const response = await fetch("/api/numerology/user", {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.numerology) {
          setProfile(result.numerology);
        }
      }
    } catch (error) {
      console.error("Load numerology error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);

    // Check access before calculating
    const access = await checkFeatureAccess(user, "numerology");
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || "/pay/199");
      }
      setCalculating(false);
      return;
    }



    try {
      const response = await fetch("/api/numerology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          mobileNumber: formData.mobileNumber || undefined,
          vehicleNumber: formData.vehicleNumber || undefined,
          houseNumber: formData.houseNumber || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to calculate numerology");
      }

      const result = await response.json();
      setProfile(result.profile);
    } catch (error: any) {
      console.error("Numerology calculation error:", error);
      alert(error.message || "Failed to calculate numerology");
    } finally {
      setCalculating(false);
    }
  };

  if (!user) {
    return (
      <DashboardPageShell
        title="Numerology"
        subtitle="Restoring your JyotiAI session."
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <LoadingState
            title="Opening Numerology"
            description="Preparing your numerology workspace."
          />
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Numerology"
      subtitle="Explore the number patterns connected to your name and birth date"
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

        {/* Astro Summary Block */}
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
        <CosmicNumerology
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          calculating={calculating}
          profile={profile}
        />

        {/* Ask Guru With Context Button */}
        {astro && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() =>
                router.push(
                  `/guru?source=numerology`,
                )
              }
              className="min-h-11 rounded-md border border-[#e0a84d]/60 bg-[#e99a34] px-5 font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
            >
              Ask Guru With My Birth Context
            </button>
          </div>
        )}
      </div>
    </DashboardPageShell>
  );
}

/**
 * Business Engine Component
 *
 * H1 presentation migration.
 * Existing API endpoint and analysis behavior preserved.
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BusinessEngineProps {
  onAnalysisComplete?: (analysis: any) => void;
}

const panel =
  "rounded-2xl border border-[#dba84c]/15 bg-[linear-gradient(145deg,rgba(15,25,28,0.97),rgba(8,17,21,0.97))] shadow-[0_18px_55px_rgba(0,0,0,0.16)]";

export const BusinessEngine: React.FC<BusinessEngineProps> = ({
  onAnalysisComplete,
}) => {
  const [businessIdea, setBusinessIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!businessIdea.trim()) {
      alert("Please enter a business idea");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/career/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idea: businessIdea }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze business idea");
      }

      const data = await response.json();
      setAnalysis(data);
      onAnalysisComplete?.(data);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze business idea");
    } finally {
      setLoading(false);
    }
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className =
      "pointer-events-none absolute rounded-full bg-[#f3bd67]/20 animate-ping";

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div className="space-y-6">
      <section className={`${panel} p-6 md:p-7`}>
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dba84c]/20 bg-[#dba84c]/10">
            <Briefcase className="h-4 w-4 text-[#e5a44a]" />
          </div>

          <div>
            <h2 className="font-semibold text-[#f5eee2]">
              Enter Your Business Idea
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#9f9b94]">
              Describe the idea you want JyotiAI to evaluate against your
              astrological profile.
            </p>
          </div>
        </div>

        <div>
          <Label
            htmlFor="business-idea"
            className="mb-2 block text-sm font-medium text-[#d8d2c7]"
          >
            Business Idea
          </Label>

          <Textarea
            id="business-idea"
            value={businessIdea}
            onChange={(e) => setBusinessIdea(e.target.value)}
            placeholder="Describe your business idea in detail..."
            rows={6}
            className="border-[#dba84c]/15 bg-[#071115] text-[#f5eee2] placeholder:text-[#666d6c] focus-visible:ring-[#c99445]/40"
          />
        </div>

        <Button
          onClick={(e) => {
            createRipple(e);
            handleAnalyze();
          }}
          disabled={loading || !businessIdea.trim()}
          className="relative mt-5 min-h-11 w-full overflow-hidden border border-[#e0a84d]/60 bg-[#e99a34] font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
        >
          {loading ? (
            "Analyzing…"
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Compatibility
            </>
          )}
        </Button>
      </section>

      {analysis && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${panel} p-6 md:p-7`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c99445]">
            Compatibility Analysis
          </p>

          <div className="mt-5 rounded-xl border border-[#dba84c]/10 bg-[#0b1519]/80 p-5">
            <p className="text-sm text-[#9f9b94]">Compatibility Score</p>

            <p className="mt-2 text-4xl font-semibold tracking-tight text-[#e5a44a]">
              {analysis.compatibilityScore || "N/A"}
              <span className="ml-1 text-sm text-[#777b77]">/100</span>
            </p>
          </div>

          {analysis.analysis && (
            <p className="mt-5 text-sm leading-7 text-[#d8d2c7]">
              {analysis.analysis}
            </p>
          )}
        </motion.section>
      )}
    </div>
  );
};

"use client";

import React from "react";
import DashboardShell from "./DashboardShell";
import { AuthenticatedAppShell } from "./AuthenticatedAppShell";
import { ProductShellNormalizer } from "@/components/product/ProductShellNormalizer";
import { K7AuthenticatedVisualContract } from "@/components/product/K7AuthenticatedVisualContract";

interface DashboardPageShellProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  rightActions?: React.ReactNode;
}

export default function DashboardPageShell({
  title,
  subtitle,
  children,
  rightActions,
}: DashboardPageShellProps) {
  return (
    <div
      data-jyoti-product-shell="true"
      data-dashboard-product-canvas="true"
      className="relative overflow-hidden bg-[#050d11] text-[#eee7dc]"
    >
      <ProductShellNormalizer />
      <K7AuthenticatedVisualContract />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_82%_0%,rgba(229,154,59,0.10),transparent_26rem),radial-gradient(circle_at_16%_16%,rgba(72,137,140,0.07),transparent_22rem)]"
        aria-hidden="true"
      />
      <div
        data-dashboard-content-canvas="true"
        className="page-container relative"
      >
        <AuthenticatedAppShell>
          <DashboardShell
            title={title}
            subtitle={subtitle}
            rightActions={rightActions}
          >
            {children}
          </DashboardShell>
        </AuthenticatedAppShell>
      </div>
    </div>
  );
}

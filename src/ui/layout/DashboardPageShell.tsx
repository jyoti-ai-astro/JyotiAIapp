'use client';

import React from 'react';
import DashboardShell from './DashboardShell';
import { AuthenticatedAppShell } from './AuthenticatedAppShell';

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
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_82%_0%,rgba(242,140,40,0.16),transparent_26rem),radial-gradient(circle_at_16%_16%,rgba(47,125,126,0.12),transparent_22rem)]"
        aria-hidden="true"
      />
      <div className="page-container relative">
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

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
    <div className="page-container">
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
  );
}

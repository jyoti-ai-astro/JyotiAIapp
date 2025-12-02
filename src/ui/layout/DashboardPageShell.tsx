'use client';

import React from 'react';
import DashboardShell from './DashboardShell';

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
      <DashboardShell
        title={title}
        subtitle={subtitle}
        rightActions={rightActions}
      >
        {children}
      </DashboardShell>
    </div>
  );
}


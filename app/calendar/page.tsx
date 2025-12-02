'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { CosmicCalendar } from '@/components/calendar/CosmicCalendar'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'

export default function CalendarPage() {
  return (
    <DashboardPageShell
      title="Cosmic Calendar"
      subtitle="Plan your days aligned with the universe"
    >
      <CosmicCalendar />
    </DashboardPageShell>
  )
}


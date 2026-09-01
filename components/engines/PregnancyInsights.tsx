'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PregnancyInsightsProps {
  onInsightsLoaded?: (insights: any) => void
}

export const PregnancyInsights: React.FC<PregnancyInsightsProps> = () => {
  return (
    <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-display text-gold">
          Pregnancy Insights
        </CardTitle>
        <CardDescription className="text-white/70">
          Personalized pregnancy astrology is not available in Launch v1.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-white/80">
          JyotiAI will not generate conception dates or pregnancy predictions from placeholder data.
          This feature will become available after its astrology engine and safety review are complete.
        </p>
      </CardContent>
    </Card>
  )
}

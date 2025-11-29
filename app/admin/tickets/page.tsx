'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { useUserStore } from '@/store/user-store'

export default function AdminTicketsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [ticketUsage, setTicketUsage] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin (you'll need to implement this check)
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch ticket usage data
    fetchTicketUsage()
  }, [user, router])

  const fetchTicketUsage = async () => {
    try {
      const response = await fetch('/api/admin/tickets/usage', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setTicketUsage(data.usage || [])
      }
    } catch (error) {
      console.error('Failed to fetch ticket usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-navy text-white flex items-center justify-center">
        <p>Loading ticket usage data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      <CosmicBackground intensity={0.4} />

      <div className="relative z-10 container mx-auto px-6 py-24">
        <Card className="bg-cosmic-indigo/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-3xl font-display text-gold">Ticket Usage Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-white/70">
                Ticket usage tracking and analytics coming soon. This page will show:
              </p>
              <ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
                <li>Total tickets purchased</li>
                <li>Tickets used vs remaining</li>
                <li>Most popular features</li>
                <li>Conversion rates</li>
                <li>User engagement metrics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


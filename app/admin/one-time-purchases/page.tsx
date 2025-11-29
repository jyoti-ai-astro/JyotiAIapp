'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { useUserStore } from '@/store/user-store'

export default function AdminOTPPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch one-time purchases
    fetchPurchases()
  }, [user, router])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/admin/purchases/one-time', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setPurchases(data.purchases || [])
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-navy text-white flex items-center justify-center">
        <p>Loading purchase data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      <CosmicBackground intensity={0.4} />

      <div className="relative z-10 container mx-auto px-6 py-24">
        <Card className="bg-cosmic-indigo/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-3xl font-display text-gold">One-Time Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-white/70">
                One-time purchase tracking coming soon. This page will show:
              </p>
              <ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
                <li>All one-time purchases (₹99 and ₹199)</li>
                <li>Purchase date and time</li>
                <li>User email and payment ID</li>
                <li>Tickets granted</li>
                <li>Revenue analytics</li>
              </ul>

              {purchases.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-heading text-gold mb-4">Recent Purchases</h3>
                  <div className="space-y-2">
                    {purchases.map((purchase, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <p className="text-white/80">
                  Product: ₹{purchase.productId} | Payment ID: {purchase.paymentId}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


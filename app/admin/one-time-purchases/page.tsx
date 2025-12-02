/**
 * Admin: One-Time Purchases
 * 
 * Pricing & Payments v3 - Phase I
 * 
 * View all one-time purchases across all users
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Loader2 } from 'lucide-react'

interface OneTimePurchase {
  email: string
  productId: string
  productName: string
  paymentId: string
  orderId: string
  date: string
  amount: number
}

export default function OneTimePurchasesPage() {
  const [purchases, setPurchases] = useState<OneTimePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [dateFilter, setDateFilter] = useState<'7' | '30' | 'all'>('all')

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/admin/one-time-purchases', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setPurchases(data.purchases || [])
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardPageShell title="One-Time Purchases" subtitle="View all one-time reading purchases">
      <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-gold">One-Time Purchases</CardTitle>
          <div className="flex gap-4 mt-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm flex-1 max-w-xs"
            />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as '7' | '30' | 'all')}
              className="bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : purchases.length === 0 ? (
            <p className="text-white/60 text-center py-10">No purchases found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-2 text-white/80">Email</th>
                    <th className="text-left p-2 text-white/80">Product ID</th>
                    <th className="text-left p-2 text-white/80">Product Name</th>
                    <th className="text-left p-2 text-white/80">Amount</th>
                    <th className="text-left p-2 text-white/80">Payment ID</th>
                    <th className="text-left p-2 text-white/80">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases
                    .filter((p) => {
                      if (searchEmail && !p.email.toLowerCase().includes(searchEmail.toLowerCase())) {
                        return false
                      }
                      if (dateFilter !== 'all') {
                        const purchaseDate = new Date(p.date)
                        const daysAgo = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
                        if (dateFilter === '7' && daysAgo > 7) return false
                        if (dateFilter === '30' && daysAgo > 30) return false
                      }
                      return true
                    })
                    .map((purchase, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="p-2 text-white/70">{purchase.email}</td>
                      <td className="p-2 text-white/70 font-mono text-xs">{purchase.productId}</td>
                      <td className="p-2 text-white/70">{purchase.productName}</td>
                      <td className="p-2 text-white/70">₹{purchase.amount}</td>
                      <td className="p-2 text-white/70 font-mono text-xs">{purchase.paymentId}</td>
                      <td className="p-2 text-white/70">
                        {new Date(purchase.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPageShell>
  )
}

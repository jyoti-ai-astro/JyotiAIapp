'use client'

/**
 * Admin Dashboard
 * Milestone 10 - Step 2
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStats {
  users: {
    total: number
    newToday: number
  }
  reports: {
    today: number
  }
  guru: {
    usageToday: number
  }
  uploads: {
    today: number
  }
  revenue: {
    total: number
    today: number
    activeSubscriptions: number
  }
  system: {
    pinecone: string
    workers: string
    cron: string
    aiProvider: string
  }
  overview?: {
    totalUsers: number
    activeSubscriptions: number
    totalOneTimePurchases: number
    oneTimeRevenueINR: number
    totalTicketsAiQuestions: number
    totalTicketsKundali: number
    guruQuestionsToday: number
    predictionsGeneratedToday: number
    timelineGeneratedToday: number
    lastUpdated: string
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch both old stats and new overview metrics
      const [statsResponse, overviewResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/overview'),
      ])

      const statsData = await statsResponse.json()
      const overviewData = await overviewResponse.json()

      if (statsData.success && overviewData.success) {
        // Merge stats with overview metrics
        setStats({
          ...statsData.stats,
          overview: overviewData.metrics,
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="container mx-auto p-6">Failed to load stats</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Command Center</h1>
        <p className="text-muted-foreground">Overview of system statistics and health</p>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.newToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reports Today</CardTitle>
            <CardDescription>Generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports.today}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Guru Usage</CardTitle>
            <CardDescription>Chats today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.guru.usageToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Uploads Today</CardTitle>
            <CardDescription>Palmistry + Aura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uploads.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <CardDescription>Today&apos;s earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.today.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CardDescription>Current subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.activeSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mega Build 4 - Enhanced Metrics */}
      {stats.overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">One-Time Revenue</CardTitle>
              <CardDescription>Total from purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.overview.oneTimeRevenueINR.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.totalOneTimePurchases} purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">AI Question Tickets</CardTitle>
              <CardDescription>In circulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalTicketsAiQuestions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Kundali Tickets</CardTitle>
              <CardDescription>In circulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalTicketsKundali.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Predictions Today</CardTitle>
              <CardDescription>Generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.predictionsGeneratedToday}</div>
              <p className="text-xs text-muted-foreground">
                Timeline: {stats.overview.timelineGeneratedToday}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Status of critical services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium">Pinecone</p>
              <p className={`text-lg font-bold ${stats.system.pinecone === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {stats.system.pinecone}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Guru RAG</p>
              <p className={`text-lg font-bold ${process.env.GURU_RAG_ENABLED === 'true' ? 'text-green-600' : 'text-yellow-600'}`}>
                {process.env.GURU_RAG_ENABLED === 'true' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Cron Jobs</p>
              <p className={`text-lg font-bold ${stats.system.cron === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {stats.system.cron}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">AI Provider</p>
              <p className="text-lg font-bold">{stats.system.aiProvider}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


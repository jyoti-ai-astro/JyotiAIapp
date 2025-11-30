/**
 * Admin Tickets Page
 * 
 * Mega Build 4 - Admin Command Center
 * Ticket usage analytics and management
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface TicketStats {
  totalAiQuestions: number
  totalKundali: number
  usersWithTickets: number
}

interface UserWithTickets {
  uid: string
  email: string
  name: string
  aiQuestions: number
  kundali: number
  lastUpdated: string | null
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [users, setUsers] = useState<UserWithTickets[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTicketData()
  }, [])

  const fetchTicketData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/tickets/overview', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
          setUsers(data.users || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch ticket data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading ticket data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ticket Management</h1>
        <p className="text-muted-foreground">View and manage ticket distribution</p>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total AI Question Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAiQuestions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Kundali Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKundali.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Users with Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usersWithTickets}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users with Non-Zero Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users with tickets</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">User Email</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">AI Tickets</th>
                    <th className="text-left p-2">Kundali Tickets</th>
                    <th className="text-left p-2">Last Updated</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b hover:bg-muted/50">
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">
                        <Badge variant="default">{user.aiQuestions}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{user.kundali}</Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-2">
                        <Link href={`/admin/users?search=${encodeURIComponent(user.email)}`}>
                          <Button variant="outline" size="sm">Open in Users</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

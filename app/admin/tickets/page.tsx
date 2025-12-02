/**
 * Admin: Ticket Management
 * 
 * Pricing & Payments v3 - Phase I
 * 
 * View and manage user tickets
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Loader2, Plus, Minus, RefreshCw } from 'lucide-react'

interface UserTickets {
  uid: string
  email: string
  aiGuruTickets: number
  kundaliTickets: number
  lifetimePredictions: number
}

export default function TicketsPage() {
  const [users, setUsers] = useState<UserTickets[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/tickets', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTickets = async (uid: string, type: 'aiGuruTickets' | 'kundaliTickets' | 'lifetimePredictions', amount: number = 1) => {
    setActionLoading(`${uid}-add-${type}`)
    try {
      const res = await fetch('/api/admin/add-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid,
          tickets: { [type]: amount },
        }),
      })
      if (res.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error adding tickets:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveTickets = async (uid: string, type: 'aiGuruTickets' | 'kundaliTickets' | 'lifetimePredictions', amount: number) => {
    setActionLoading(`${uid}-remove-${type}`)
    try {
      const res = await fetch('/api/admin/remove-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid,
          tickets: { [type]: amount },
        }),
      })
      if (res.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error removing tickets:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetTickets = async (uid: string) => {
    setActionLoading(`${uid}-reset`)
    try {
      const res = await fetch('/api/admin/reset-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ uid }),
      })
      if (res.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error resetting tickets:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = searchEmail
    ? users.filter((u) => u.email.toLowerCase().includes(searchEmail.toLowerCase()))
    : users

  return (
    <DashboardPageShell title="Ticket Management" subtitle="View and manage user tickets">
      <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-gold">User Tickets</CardTitle>
          <div className="flex gap-4 mt-4">
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-white/60 text-center py-10">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-2 text-white/80">Email</th>
                    <th className="text-left p-2 text-white/80">AI Guru</th>
                    <th className="text-left p-2 text-white/80">Kundali</th>
                    <th className="text-left p-2 text-white/80">Predictions</th>
                    <th className="text-left p-2 text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-white/5">
                      <td className="p-2 text-white/70">{user.email}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70">{user.aiGuruTickets}</span>
                          {user.aiGuruTickets > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              Guru Active
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddTickets(user.uid, 'aiGuruTickets', 1)}
                            disabled={actionLoading === `${user.uid}-add-aiGuruTickets`}
                            title="Add 1"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddTickets(user.uid, 'aiGuruTickets', 5)}
                            disabled={actionLoading === `${user.uid}-add-aiGuruTickets`}
                            title="Add 5"
                            className="text-xs"
                          >
                            +5
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveTickets(user.uid, 'aiGuruTickets', 1)}
                            disabled={actionLoading === `${user.uid}-remove-aiGuruTickets` || user.aiGuruTickets === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70">{user.kundaliTickets}</span>
                          {user.kundaliTickets > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Kundali Active
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddTickets(user.uid, 'kundaliTickets', 1)}
                            disabled={actionLoading === `${user.uid}-add-kundaliTickets`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70">{user.lifetimePredictions}</span>
                          {user.lifetimePredictions > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Predictions Active
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddTickets(user.uid, 'lifetimePredictions', 1)}
                            disabled={actionLoading === `${user.uid}-add-lifetimePredictions`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetTickets(user.uid)}
                          disabled={actionLoading === `${user.uid}-reset`}
                        >
                          {actionLoading === `${user.uid}-reset` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Reset All'
                          )}
                        </Button>
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

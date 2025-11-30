/**
 * Admin Users Page
 * 
 * Mega Build 4 - Admin Command Center
 * Full user management with table, search, and actions
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'

interface User {
  uid: string
  email: string
  displayName: string
  isAdmin: boolean
  createdAt: string | null
  lastLoginAt: string | null
  subscriptionStatus: string
  legacyTickets: {
    ai_questions?: number
    kundali_basic?: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [page, searchQuery])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '50')
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setHasMore(data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAdmin = async (uid: string, currentStatus: boolean) => {
    setUpdating(uid)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setAdmin',
          uid,
          isAdmin: !currentStatus,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setUsers(users.map((u) => (u.uid === uid ? { ...u, isAdmin: !currentStatus } : u)))
      } else {
        alert(data.error || 'Failed to update admin status')
      }
    } catch (error) {
      console.error('Failed to toggle admin:', error)
      alert('Failed to update admin status')
    } finally {
      setUpdating(null)
    }
  }

  const handleResetTickets = async (uid: string) => {
    if (!confirm('Reset all tickets for this user?')) return

    setUpdating(uid)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetTickets',
          uid,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setUsers(users.map((u) => (u.uid === uid ? { ...u, legacyTickets: { ai_questions: 0, kundali_basic: 0 } } : u)))
      } else {
        alert(data.error || 'Failed to reset tickets')
      }
    } catch (error) {
      console.error('Failed to reset tickets:', error)
      alert('Failed to reset tickets')
    } finally {
      setUpdating(null)
    }
  }

  const handleUpdateTickets = async (uid: string, ticketType: 'ai_questions' | 'kundali_basic', value: number) => {
    setUpdating(uid)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateTickets',
          uid,
          [ticketType]: value,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setUsers(users.map((u) => 
          u.uid === uid 
            ? { ...u, legacyTickets: { ...u.legacyTickets, [ticketType]: value } }
            : u
        ))
      } else {
        alert(data.error || 'Failed to update tickets')
      }
    } catch (error) {
      console.error('Failed to update tickets:', error)
      alert('Failed to update tickets')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users, tickets, and admin access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
            />
            <Button onClick={fetchUsers} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Admin</th>
                    <th className="text-left p-2">Subscription</th>
                    <th className="text-left p-2">AI Tickets</th>
                    <th className="text-left p-2">Kundali Tickets</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Last Login</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b hover:bg-muted/50">
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.displayName}</td>
                      <td className="p-2">
                        <Switch
                          checked={user.isAdmin}
                          onCheckedChange={() => handleToggleAdmin(user.uid, user.isAdmin)}
                          disabled={updating === user.uid}
                        />
                      </td>
                      <td className="p-2">
                        <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                          {user.subscriptionStatus}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={user.legacyTickets.ai_questions || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            handleUpdateTickets(user.uid, 'ai_questions', value)
                          }}
                          className="w-20"
                          disabled={updating === user.uid}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={user.legacyTickets.kundali_basic || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            handleUpdateTickets(user.uid, 'kundali_basic', value)
                          }}
                          className="w-20"
                          disabled={updating === user.uid}
                        />
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Link href={`/admin/users/${user.uid}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetTickets(user.uid)}
                            disabled={updating === user.uid}
                          >
                            Reset Tickets
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

/**
 * User Details Page
 * Milestone 10 - Step 3
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function UserDetailsPage() {
  const params = useParams()
  const uid = params.uid as string
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [uid])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/admin/users/${uid}`)
      const data = await response.json()

      if (data.success) {
        setUserData(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Action completed successfully')
        fetchUserData()
      }
    } catch (error) {
      console.error('Action failed:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!userData) {
    return <div>User not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{userData.name || 'User'}</h1>
          <p className="text-muted-foreground">{userData.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleAction('upgrade_premium')}>
            Upgrade to Premium
          </Button>
          <Button variant="outline" onClick={() => handleAction('block')}>
            Block User
          </Button>
          <Button variant="outline" onClick={() => handleAction('reset_onboarding')}>
            Reset Onboarding
          </Button>
          <Button variant="destructive" onClick={() => handleAction('delete')}>
            Delete User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="kundali">Kundali</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="chats">Guru Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Name:</strong> {userData.name || 'N/A'}</p>
                <p><strong>Rashi:</strong> {userData.rashi || 'N/A'}</p>
                <p><strong>Nakshatra:</strong> {userData.nakshatra || 'N/A'}</p>
                <p><strong>Onboarding Complete:</strong> {userData.onboardingComplete ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kundali">
          <Card>
            <CardHeader>
              <CardTitle>Kundali Data</CardTitle>
            </CardHeader>
            <CardContent>
              {userData.kundali ? (
                <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                  {JSON.stringify(userData.kundali, null, 2)}
                </pre>
              ) : (
                <p>No kundali data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports ({userData.reports?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {userData.reports && userData.reports.length > 0 ? (
                <div className="space-y-2">
                  {userData.reports.map((report: any) => (
                    <div key={report.id} className="rounded border p-3">
                      <p className="font-medium">{report.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reports</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments ({userData.payments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {userData.payments && userData.payments.length > 0 ? (
                <div className="space-y-2">
                  {userData.payments.map((payment: any) => (
                    <div key={payment.id} className="rounded border p-3">
                      <p className="font-medium">₹{payment.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {payment.status} | {payment.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No payments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Guru Chats ({userData.guruChats?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {userData.guruChats && userData.guruChats.length > 0 ? (
                <div className="space-y-2">
                  {userData.guruChats.map((chat: any) => (
                    <div key={chat.id} className="rounded border p-3">
                      <p className="font-medium">Q: {chat.message}</p>
                      <p className="text-sm text-muted-foreground">A: {chat.response?.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No chats</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


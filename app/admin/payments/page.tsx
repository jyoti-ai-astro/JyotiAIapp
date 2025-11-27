'use client'

/**
 * Payment Dashboard
 * Milestone 10 - Step 5
 */

'use client';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Payment {
  id: string
  userId: string
  amount: number
  status: string
  type: string
  createdAt: any
  orderId?: string
  paymentId?: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/payments?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPayments(data.payments)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySignature = async (paymentId: string, orderId: string, signature: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, orderId, signature }),
      })

      const data = await response.json()
      if (data.success) {
        alert(data.isValid ? 'Signature is valid' : 'Signature is invalid')
      }
    } catch (error) {
      console.error('Verify failed:', error)
    }
  }

  const handleFixPayment = async (paymentId: string, userId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Payment updated successfully')
        fetchPayments()
      }
    } catch (error) {
      console.error('Fix payment failed:', error)
    }
  }

  const handleRefund = async (paymentId: string) => {
    const amount = prompt('Enter refund amount:')
    const reason = prompt('Enter refund reason:')
    if (!amount) return

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), reason }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Refund processed successfully')
        fetchPayments()
      }
    } catch (error) {
      console.error('Refund failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Dashboard</h1>
        <p className="text-muted-foreground">Manage payments and subscriptions</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payments</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : payments.length === 0 ? (
            <div>No payments found</div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">₹{payment.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.type} | {payment.status} | User: {payment.userId}
                    </p>
                    {payment.orderId && (
                      <p className="text-xs text-muted-foreground">Order: {payment.orderId}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {payment.status === 'failed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFixPayment(payment.id, payment.userId, 'retry')}
                        >
                          Retry
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFixPayment(payment.id, payment.userId, 'mark_success')}
                        >
                          Mark Success
                        </Button>
                      </>
                    )}
                    {payment.status === 'success' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefund(payment.id)}
                      >
                        Refund
                      </Button>
                    )}
                    {payment.paymentId && payment.orderId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifySignature(payment.paymentId!, payment.orderId!, '')}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


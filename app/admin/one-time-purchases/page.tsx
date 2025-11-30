/**
 * Admin One-Time Purchases Page
 * 
 * Mega Build 4 - Admin Command Center
 * View and filter one-time purchases
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Purchase {
  id: string
  userId: string
  userEmail?: string
  userName?: string
  productId: number
  amount: number
  status: string
  createdAt: string | null
  paymentId: string | null
  orderId: string
  planName: string | null
}

export default function AdminOTPPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [productFilter, setProductFilter] = useState('ALL')

  useEffect(() => {
    fetchPurchases()
  }, [page, statusFilter, productFilter])

  const fetchPurchases = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '50')
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (productFilter !== 'ALL') params.append('product', productFilter)

      const response = await fetch(`/api/admin/purchases/one-time?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPurchases(data.purchases || [])
          setHasMore(data.pagination?.hasMore || false)
        }
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">One-Time Purchases</h1>
        <p className="text-muted-foreground">View and filter one-time purchase transactions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Product</label>
              <Select value={productFilter} onValueChange={(value) => {
                setProductFilter(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Products</SelectItem>
                  <SelectItem value="99">₹99</SelectItem>
                  <SelectItem value="199">₹199</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchases ({purchases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading purchases...</div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No purchases found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Payment ID</th>
                    <th className="text-left p-2">Order ID</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-sm">
                        {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{purchase.userName || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{purchase.userEmail || purchase.userId}</div>
                        </div>
                      </td>
                      <td className="p-2">₹{purchase.productId}</td>
                      <td className="p-2 font-medium">₹{purchase.amount}</td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(purchase.status)}>
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm font-mono">{purchase.paymentId || 'N/A'}</td>
                      <td className="p-2 text-sm font-mono">{purchase.orderId}</td>
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

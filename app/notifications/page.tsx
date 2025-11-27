'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'daily' | 'transit' | 'festival' | 'chakra' | 'system'
  title: string
  message: string
  category: string
  timestamp: string
  read: boolean
  metadata?: Record<string, any>
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadNotifications()
  }, [user, router, filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' 
        ? '/api/notifications/list'
        : `/api/notifications/list?type=${filter}`
      
      const response = await fetch(url, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setNotifications(result.notifications || [])
        setUnreadCount(result.unreadCount || 0)
      }
    } catch (error) {
      console.error('Load notifications error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        loadNotifications()
      }
    } catch (error) {
      console.error('Mark read error:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAll: true }),
      })

      if (response.ok) {
        loadNotifications()
      }
    } catch (error) {
      console.error('Mark all read error:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      daily: '🌟',
      transit: '🔮',
      festival: '🎉',
      chakra: '✨',
      system: '📢',
    }
    return icons[type] || '📬'
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'daily', 'transit', 'festival', 'system'].map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>Stay updated with your spiritual insights</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${
                    !notification.read ? 'bg-mystic/5 border-mystic' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <span className="text-xs bg-mystic text-white px-2 py-1 rounded">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
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


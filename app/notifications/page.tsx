'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Check,
  CheckCheck,
  Inbox,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ErrorState,
  LoadingState,
  RetryButton,
} from '@/components/ui/feedback-state'
import { useUserStore } from '@/store/user-store'

type NotificationType =
  | 'daily'
  | 'transit'
  | 'festival'
  | 'chakra'
  | 'system'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  category: string
  timestamp: string | null
  read: boolean
  metadata?: Record<string, unknown>
}

type FilterType = 'all' | NotificationType

const FILTERS: Array<{ value: FilterType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'daily', label: 'Daily' },
  { value: 'transit', label: 'Transits' },
  { value: 'festival', label: 'Festivals' },
  { value: 'chakra', label: 'Chakra' },
  { value: 'system', label: 'System' },
]

function notificationGlyph(type: NotificationType) {
  switch (type) {
    case 'daily':
      return '✦'
    case 'transit':
      return '☌'
    case 'festival':
      return '✺'
    case 'chakra':
      return '◉'
    case 'system':
      return '•'
    default:
      return '✦'
  }
}

function formatNotificationTime(timestamp: string | null) {
  if (!timestamp) return 'Time unavailable'

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Time unavailable'

  return date.toLocaleString()
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useUserStore()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const loadNotifications = useCallback(
    async (refresh = false) => {
      try {
        refresh ? setRefreshing(true) : setLoading(true)
        setError(null)

        const url =
          filter === 'all'
            ? '/api/notifications/list'
            : `/api/notifications/list?type=${encodeURIComponent(filter)}`

        const response = await fetch(url, {
          cache: 'no-store',
          credentials: 'include',
        })

        if (response.status === 401) {
          router.push('/login')
          return
        }

        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            json?.error || `Unable to load notifications (${response.status})`
          )
        }

        setNotifications(
          Array.isArray(json?.notifications) ? json.notifications : []
        )
        setUnreadCount(
          typeof json?.unreadCount === 'number' ? json.unreadCount : 0
        )
      } catch (err: any) {
        console.error('Load notifications error:', err)
        setError(err?.message || 'Unable to load notifications')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [filter, router]
  )

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    void loadNotifications()
  }, [user, router, loadNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      setWorkingId(notificationId)

      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId }),
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(json?.error || 'Unable to mark notification as read')
      }

      await loadNotifications(true)
    } catch (err: any) {
      console.error('Mark notification read error:', err)
      setError(err?.message || 'Unable to update notification')
    } finally {
      setWorkingId(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true)

      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAll: true }),
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(json?.error || 'Unable to mark all notifications as read')
      }

      await loadNotifications(true)
    } catch (err: any) {
      console.error('Mark all notifications read error:', err)
      setError(err?.message || 'Unable to update notifications')
    } finally {
      setMarkingAll(false)
    }
  }

  if (!user) return null

  return (
    <DashboardPageShell
      title="Notifications"
      subtitle={
        unreadCount > 0
          ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
          : 'Your JyotiAI updates, guidance, and account messages'
      }
      rightActions={
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              className="min-h-11"
              disabled={markingAll}
              onClick={markAllAsRead}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              {markingAll ? 'Updating…' : 'Mark all read'}
            </Button>
          )}

          <Button
            variant="outline"
            className="min-h-11"
            disabled={refreshing}
            onClick={() => loadNotifications(true)}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10">
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>

                <div>
                  <p className="font-medium">Your notification center</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Daily guidance, transit notices, festivals, chakra updates,
                    and important JyotiAI messages appear here.
                  </p>
                </div>
              </div>

              <Link href="/settings">
                <Button variant="outline" className="min-h-11">
                  Notification settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={filter === item.value ? 'default' : 'outline'}
              className="shrink-0"
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {error && !loading && (
          <ErrorState
            title="Notifications unavailable"
            description={error}
            action={<RetryButton onClick={() => loadNotifications()} />}
          />
        )}

        {!error && loading ? (
          <LoadingState
            title="Loading notifications"
            description="Checking your latest JyotiAI updates."
          />
        ) : !error && notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-muted/30">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold">
                Nothing here yet
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                When JyotiAI creates guidance, transit notices, festival
                reminders, or account updates for you, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : !error ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Your updates
              </CardTitle>
              <CardDescription>
                Newest notifications appear first.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    notification.read
                      ? 'bg-background/30'
                      : 'border-amber-300/40 bg-amber-50/40 dark:bg-amber-300/[0.04]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background text-lg">
                      {notificationGlyph(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>

                        {!notification.read && (
                          <Badge variant="secondary">New</Badge>
                        )}

                        <Badge variant="outline" className="capitalize">
                          {notification.type}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs text-muted-foreground">
                        {formatNotificationTime(notification.timestamp)}
                      </p>
                    </div>

                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={workingId === notification.id}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {workingId === notification.id ? 'Updating…' : 'Read'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </DashboardPageShell>
  )
}

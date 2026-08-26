import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

const ALLOWED_SETTINGS = new Set([
  'aiProvider',
  'embeddingProvider',
  'betaMode',
  'guruUsageLimit',
  'dailyHoroscopeTime',
  'maintenanceMode',
])

function validateSetting(key: string, value: unknown): boolean {
  switch (key) {
    case 'aiProvider':
    case 'embeddingProvider':
      return typeof value === 'string' && value.length > 0 && value.length <= 64
    case 'betaMode':
    case 'maintenanceMode':
      return typeof value === 'boolean'
    case 'guruUsageLimit':
      return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 10000
    case 'dailyHoroscopeTime':
      return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
    default:
      return false
  }
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const settingsRef = adminDb.collection('system_settings').doc('main')
        const settingsSnap = await settingsRef.get()
        const { envVars } = await import('@/lib/env/env.mjs')

        const defaultSettings = {
          aiProvider: envVars.ai.provider,
          embeddingProvider: envVars.ai.embeddingProvider,
          betaMode: envVars.app.betaMode,
          guruUsageLimit: 50,
          dailyHoroscopeTime: '05:00',
          maintenanceMode: false,
        }

        const stored = settingsSnap.exists ? settingsSnap.data() || {} : {}
        const safeStored = Object.fromEntries(
          Object.entries(stored).filter(([key]) => ALLOWED_SETTINGS.has(key))
        )

        return NextResponse.json({ success: true, settings: { ...defaultSettings, ...safeStored } })
      } catch (error: any) {
        console.error('Get settings error:', error)
        return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
      }
    },
    'settings.read'
  )(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const body = await req.json()
        const { reason, settings } = body || {}

        if (typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 500) {
          return NextResponse.json({ error: 'A reason of 5-500 characters is required' }, { status: 400 })
        }
        if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
          return NextResponse.json({ error: 'settings object is required' }, { status: 400 })
        }

        const entries = Object.entries(settings)
        if (entries.length === 0) {
          return NextResponse.json({ error: 'At least one setting is required' }, { status: 400 })
        }

        const updates: Record<string, unknown> = {}
        for (const [key, value] of entries) {
          if (!ALLOWED_SETTINGS.has(key) || !validateSetting(key, value)) {
            return NextResponse.json({ error: `Invalid or unsupported setting: ${key}` }, { status: 400 })
          }
          updates[key] = value
        }

        const settingsRef = adminDb.collection('system_settings').doc('main')
        const beforeSnap = await settingsRef.get()
        const before = beforeSnap.exists ? beforeSnap.data() || {} : {}
        const now = new Date()

        const batch = adminDb.batch()
        batch.set(settingsRef, { ...updates, updatedAt: now, updatedBy: admin.uid }, { merge: true })
        const auditRef = adminDb.collection('admin_audit').doc()
        batch.set(auditRef, {
          action: 'settings.update',
          actorUid: admin.uid,
          reason: reason.trim(),
          changedKeys: Object.keys(updates),
          before: Object.fromEntries(Object.keys(updates).map((key) => [key, before[key] ?? null])),
          after: updates,
          createdAt: now,
        })
        await batch.commit()

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Update settings error:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
      }
    },
    'settings.write'
  )(request)
}

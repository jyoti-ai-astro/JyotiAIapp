import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * Get System Settings API
 * Milestone 10 - Step 12
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const settingsRef = adminDb.collection('system_settings').doc('main')
        const settingsSnap = await settingsRef.get()

        // Phase 31 - F46: Use validated environment variables
        const { envVars } = await import('@/lib/env/env.mjs')
        
        const defaultSettings = {
          aiProvider: envVars.ai.provider,
          embeddingProvider: envVars.ai.embeddingProvider,
          betaMode: envVars.app.betaMode,
          guruUsageLimit: 50,
          dailyHoroscopeTime: '05:00',
          maintenanceMode: false,
        }

        const settings = settingsSnap.exists
          ? { ...defaultSettings, ...settingsSnap.data() }
          : defaultSettings

        return NextResponse.json({
          success: true,
          settings,
        })
      } catch (error: any) {
        console.error('Get settings error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to get settings' },
          { status: 500 }
        )
      }
    },
    'settings.read'
  )(request)
}

/**
 * Update System Settings API
 * Milestone 10 - Step 12
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const settings = await req.json()

        const settingsRef = adminDb.collection('system_settings').doc('main')

        await settingsRef.set(
          {
            ...settings,
            updatedAt: new Date(),
            updatedBy: admin.uid,
          },
          { merge: true }
        )

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Update settings error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to update settings' },
          { status: 500 }
        )
      }
    },
    'settings.write'
  )(request)
}


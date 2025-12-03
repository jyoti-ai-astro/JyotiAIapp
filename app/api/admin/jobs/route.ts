export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

/**
 * Get Background Jobs Status API
 * Milestone 10 - Step 10
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        // Get job statuses from Firestore
        const jobsRef = adminDb.collection('background_jobs')
        const snapshot = await jobsRef.get()

        const jobs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Default jobs if not in Firestore
        const defaultJobs = [
          {
            id: 'daily-horoscope',
            name: 'Daily Horoscope Job',
            schedule: '5 AM daily',
            status: 'active',
            lastRun: null,
            nextRun: null,
            failures: 0,
          },
          {
            id: 'transit-alert',
            name: 'Transit Alert Job',
            schedule: 'Hourly',
            status: 'active',
            lastRun: null,
            nextRun: null,
            failures: 0,
          },
          {
            id: 'festival',
            name: 'Festival Job',
            schedule: 'Midnight daily',
            status: 'active',
            lastRun: null,
            nextRun: null,
            failures: 0,
          },
          {
            id: 'notification-queue',
            name: 'Notification Queue Worker',
            schedule: 'Every 5 minutes',
            status: 'active',
            lastRun: null,
            nextRun: null,
            failures: 0,
          },
        ]

        // Merge with Firestore data
        const jobMap = new Map(jobs.map((j) => [j.id, j]))
        const allJobs = defaultJobs.map((job) => ({
          ...job,
          ...(jobMap.get(job.id) || {}),
        }))

        return NextResponse.json({
          success: true,
          jobs: allJobs,
        })
      } catch (error: any) {
        console.error('Get jobs error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to get jobs' },
          { status: 500 }
        )
      }
    },
    'jobs.trigger'
  )(request)
}

/**
 * Trigger Background Job API
 * Milestone 10 - Step 10
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      try {
        const { jobId } = await req.json()

        if (!jobId) {
          return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
        }

        // Trigger job based on ID
        const jobEndpoints: Record<string, string> = {
          'daily-horoscope': '/api/workers/daily-horoscope',
          'transit-alert': '/api/workers/transit-alert',
          'festival': '/api/workers/festival',
          'notification-queue': '/api/workers/process-queue',
        }

        const endpoint = jobEndpoints[jobId]
        if (!endpoint) {
          return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
        }

        // Trigger the job
        const response = await fetch(`${req.nextUrl.origin}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: req.headers.get('cookie') || '',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to trigger job')
        }

        // Update job status
        if (adminDb) {
          await adminDb.collection('background_jobs').doc(jobId).set(
            {
              lastRun: new Date(),
              triggeredBy: admin.uid,
              status: 'running',
            },
            { merge: true }
          )
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Trigger job error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to trigger job' },
          { status: 500 }
        )
      }
    },
    'jobs.trigger'
  )(request)
}


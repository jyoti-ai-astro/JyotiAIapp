import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { restoreCollection } from '@/scripts/backup-firestore'

/**
 * Restore Backup API
 * Milestone 10 - Step 11
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { backupId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { backupId } = params
        const { collection, dryRun } = await req.json()

        // Get backup info
        const backupRef = adminDb.collection('backups').doc(backupId)
        const backupSnap = await backupRef.get()

        if (!backupSnap.exists) {
          return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
        }

        const backupData = backupSnap.data()
        const backupPath = backupData?.path

        if (!backupPath) {
          return NextResponse.json({ error: 'Backup path not found' }, { status: 404 })
        }

        // Restore collection
        if (collection) {
          await restoreCollection(collection, `${backupPath}/${collection}_*.json`, dryRun !== false)
        } else {
          return NextResponse.json({ error: 'Collection is required' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Restore error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to restore backup' },
          { status: 500 }
        )
      }
    },
    'backup.write'
  )(request)
}

/**
 * Download Backup API
 * Milestone 10 - Step 11
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { backupId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { backupId } = params

        // Get backup info
        const backupRef = adminDb.collection('backups').doc(backupId)
        const backupSnap = await backupRef.get()

        if (!backupSnap.exists) {
          return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
        }

        const backupData = backupSnap.data()
        const backupPath = backupData?.path

        // In production, generate signed URL or download link
        return NextResponse.json({
          success: true,
          downloadUrl: backupPath, // In production, this would be a signed URL
        })
      } catch (error: any) {
        console.error('Download backup error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to download backup' },
          { status: 500 }
        )
      }
    },
    'backup.read'
  )(request)
}


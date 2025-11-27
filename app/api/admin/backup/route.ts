import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { backupAllCollections } from '@/scripts/backup-firestore'

/**
 * Create Backup API
 * Milestone 10 - Step 11
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { collections } = await req.json()

        // Create backup directory
        const backupDir = `/tmp/backups/${Date.now()}`
        // Note: In production, use proper file system or cloud storage

        if (collections && collections.length > 0) {
          // Backup specific collections
          for (const collection of collections) {
            await backupAllCollections(backupDir)
          }
        } else {
          // Backup all collections
          await backupAllCollections(backupDir)
        }

        // Store backup metadata
        const backupRef = adminDb.collection('backups').doc()
        await backupRef.set({
          id: backupRef.id,
          path: backupDir,
          collections: collections || 'all',
          createdAt: new Date(),
          createdBy: admin.uid,
        })

        return NextResponse.json({
          success: true,
          backupId: backupRef.id,
          path: backupDir,
        })
      } catch (error: any) {
        console.error('Backup error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to create backup' },
          { status: 500 }
        )
      }
    },
    'backup.write'
  )(request)
}

/**
 * List Backups API
 * Milestone 10 - Step 11
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const snapshot = await adminDb
          .collection('backups')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get()

        const backups = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        return NextResponse.json({
          success: true,
          backups,
        })
      } catch (error: any) {
        console.error('List backups error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to list backups' },
          { status: 500 }
        )
      }
    },
    'backup.read'
  )(request)
}


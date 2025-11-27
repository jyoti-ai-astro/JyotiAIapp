/**
 * Backup & Recovery Scripts
 * Milestone 9 - Step 12
 * 
 * Firestore backup and recovery utilities
 */

import { adminDb } from '@/lib/firebase/admin'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Backup Firestore collection
 */
export async function backupCollection(collectionName: string, outputDir: string): Promise<void> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const collectionRef = adminDb.collection(collectionName)
  const snapshot = await collectionRef.get()

  const data: any[] = []
  snapshot.forEach((doc) => {
    data.push({
      id: doc.id,
      ...doc.data(),
    })
  })

  const outputPath = path.join(outputDir, `${collectionName}_${Date.now()}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))

  console.log(`Backed up ${collectionName}: ${data.length} documents to ${outputPath}`)
}

/**
 * Backup all critical collections
 */
export async function backupAllCollections(outputDir: string): Promise<void> {
  const criticalCollections = [
    'users',
    'kundali',
    'reports',
    'notifications',
    'subscriptions',
    'guruChat',
    'scans',
  ]

  for (const collection of criticalCollections) {
    try {
      await backupCollection(collection, outputDir)
    } catch (error) {
      console.error(`Failed to backup ${collection}:`, error)
    }
  }
}

/**
 * Restore collection from backup
 */
export async function restoreCollection(
  collectionName: string,
  backupFilePath: string,
  dryRun: boolean = true
): Promise<void> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'))

  if (dryRun) {
    console.log(`[DRY RUN] Would restore ${backupData.length} documents to ${collectionName}`)
    return
  }

  const batch = adminDb.batch()
  let count = 0

  for (const doc of backupData) {
    const { id, ...data } = doc
    const docRef = adminDb.collection(collectionName).doc(id)
    batch.set(docRef, data)
    count++

    if (count >= 500) {
      // Firestore batch limit is 500
      await batch.commit()
      count = 0
    }
  }

  if (count > 0) {
    await batch.commit()
  }

  console.log(`Restored ${backupData.length} documents to ${collectionName}`)
}


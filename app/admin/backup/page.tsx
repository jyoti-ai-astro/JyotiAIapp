'use client'

/**
 * Backup & Restore Tools Page
 * Milestone 10 - Step 11
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface Backup {
  id: string
  path: string
  collections: string[]
  createdAt: any
  createdBy: string
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [restoreCollection, setRestoreCollection] = useState('')
  const [restoreBackupId, setRestoreBackupId] = useState('')

  const collections = ['users', 'kundali', 'reports', 'notifications', 'subscriptions', 'guruChat', 'scans']

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/backup')
      const data = await response.json()

      if (data.success) {
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    if (!confirm('Create backup?')) return

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collections: selectedCollections.length > 0 ? selectedCollections : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Backup created successfully')
        fetchBackups()
      }
    } catch (error) {
      console.error('Backup failed:', error)
    }
  }

  const handleRestore = async () => {
    if (!restoreBackupId || !restoreCollection) {
      alert('Please select backup and collection')
      return
    }

    if (!confirm(`Restore ${restoreCollection} from backup?`)) return

    try {
      const response = await fetch(`/api/admin/backup/${restoreBackupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: restoreCollection,
          dryRun: false,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Restore completed successfully')
      }
    } catch (error) {
      console.error('Restore failed:', error)
    }
  }

  const handleDownload = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/${backupId}`)
      const data = await response.json()

      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup & Restore Tools</h1>
        <p className="text-muted-foreground">Create and restore Firestore backups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Select Collections (leave empty for all):</p>
            <div className="grid gap-2 md:grid-cols-4">
              {collections.map((collection) => (
                <div key={collection} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCollections.includes(collection)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCollections([...selectedCollections, collection])
                      } else {
                        setSelectedCollections(selectedCollections.filter((c) => c !== collection))
                      }
                    }}
                  />
                  <label className="text-sm">{collection}</label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleCreateBackup}>Create Backup</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restore Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Backup</label>
            <select
              className="w-full rounded-md border p-2"
              value={restoreBackupId}
              onChange={(e) => setRestoreBackupId(e.target.value)}
            >
              <option value="">Select backup...</option>
              {backups.map((backup) => (
                <option key={backup.id} value={backup.id}>
                  {backup.id} - {backup.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Collection to Restore</label>
            <select
              className="w-full rounded-md border p-2"
              value={restoreCollection}
              onChange={(e) => setRestoreCollection(e.target.value)}
            >
              <option value="">Select collection...</option>
              {collections.map((collection) => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleRestore} variant="destructive">
            Restore
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History ({backups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : backups.length === 0 ? (
            <div>No backups found</div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{backup.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {backup.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Collections: {Array.isArray(backup.collections) ? backup.collections.join(', ') : 'all'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(backup.id)}>
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


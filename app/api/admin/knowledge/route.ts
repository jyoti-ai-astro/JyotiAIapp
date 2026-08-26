export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

function toIso(value: any): string | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

      try {
        const { searchParams } = new URL(req.url)
        const category = (searchParams.get('category') || '').trim()
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50

        let query: any = adminDb.collection('knowledge_base')
        if (category) query = query.where('category', '==', category)
        const snapshot = await query.orderBy('createdAt', 'desc').limit(search ? 100 : limit).get()

        const documents = snapshot.docs
          .map((doc: any) => {
            const data = doc.data()
            const content = String(data.content || '')
            return {
              id: doc.id,
              title: data.title || 'Untitled',
              category: data.category || 'uncategorized',
              tags: Array.isArray(data.tags) ? data.tags.slice(0, 20) : [],
              contentPreview: content.slice(0, 320),
              contentLength: content.length,
              createdAt: toIso(data.createdAt),
              updatedAt: toIso(data.updatedAt),
              createdBy: data.createdBy || null,
              vectorIndexed: Boolean(data.vectorIndexed ?? data.pineconeId ?? data.embedding),
            }
          })
          .filter((doc: any) => {
            if (!search) return true
            return [doc.id, doc.title, doc.category, ...(doc.tags || [])].some((value) => String(value).toLowerCase().includes(search))
          })
          .slice(0, limit)

        return NextResponse.json({ success: true, documents, count: documents.length })
      } catch (error: any) {
        console.error('List knowledge error:', error)
        return NextResponse.json({ error: error.message || 'Failed to list documents' }, { status: 500 })
      }
    },
    'knowledge.read'
  )(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async () => NextResponse.json(
      {
        error: 'Direct knowledge writes are temporarily retired. Use the audited retry-safe knowledge indexing job once enabled.',
        code: 'KNOWLEDGE_DIRECT_WRITE_RETIRED',
      },
      { status: 410 }
    ),
    'knowledge.write'
  )(request)
}

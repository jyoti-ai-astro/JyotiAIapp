'use client'

/**
 * Knowledge Base Manager Page
 * Milestone 10 - Step 7
 */

'use client';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Document {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: any
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  })

  useEffect(() => {
    fetchDocuments()
  }, [categoryFilter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.append('category', categoryFilter)

      const response = await fetch(`/api/admin/knowledge?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Document created successfully')
        setShowCreateForm(false)
        setFormData({ title: '', content: '', category: '', tags: '' })
        fetchDocuments()
      }
    } catch (error) {
      console.error('Create failed:', error)
    }
  }

  const handleUpdate = async (docId: string) => {
    try {
      const response = await fetch(`/api/admin/knowledge/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Document updated successfully')
        setEditingDoc(null)
        setFormData({ title: '', content: '', category: '', tags: '' })
        fetchDocuments()
      }
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return

    try {
      const response = await fetch(`/api/admin/knowledge/${docId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        alert('Document deleted successfully')
        fetchDocuments()
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleRegenerateEmbedding = async (docId: string) => {
    try {
      const response = await fetch(`/api/admin/knowledge/${docId}`, {
        method: 'POST',
      })

      const data = await response.json()
      if (data.success) {
        alert('Embedding regenerated successfully')
      }
    } catch (error) {
      console.error('Regenerate failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base Manager</h1>
          <p className="text-muted-foreground">Manage RAG documents and embeddings</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>Create Document</Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
            />
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="astrology">Astrology</SelectItem>
                <SelectItem value="numerology">Numerology</SelectItem>
                <SelectItem value="remedies">Remedies</SelectItem>
                <SelectItem value="festival_insights">Festival Insights</SelectItem>
                <SelectItem value="philosophy">Philosophy</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents ({documents.length})</CardTitle>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="astrology">Astrology</SelectItem>
                <SelectItem value="numerology">Numerology</SelectItem>
                <SelectItem value="remedies">Remedies</SelectItem>
                <SelectItem value="festival_insights">Festival Insights</SelectItem>
                <SelectItem value="philosophy">Philosophy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : documents.length === 0 ? (
            <div>No documents found</div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.category} | {doc.tags?.join(', ') || 'No tags'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.content.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDoc(doc)
                        setFormData({
                          title: doc.title,
                          content: doc.content,
                          category: doc.category,
                          tags: doc.tags?.join(', ') || '',
                        })
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateEmbedding(doc.id)}
                    >
                      Regenerate Embedding
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingDoc && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
            />
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="astrology">Astrology</SelectItem>
                <SelectItem value="numerology">Numerology</SelectItem>
                <SelectItem value="remedies">Remedies</SelectItem>
                <SelectItem value="festival_insights">Festival Insights</SelectItem>
                <SelectItem value="philosophy">Philosophy</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={() => handleUpdate(editingDoc.id)}>Update</Button>
              <Button variant="outline" onClick={() => setEditingDoc(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


'use client'

/**
 * Content Management System Page
 * Milestone 10 - Step 8
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Template {
  id: string
  type: string
  content: string
  metadata?: any
}

export default function ContentPage() {
  const [templates, setTemplates] = useState<Record<string, Template>>({})
  const [activeTab, setActiveTab] = useState('horoscope')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (templates[activeTab]) {
      setContent(templates[activeTab].content || '')
    }
  }, [activeTab, templates])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/content')
      const data = await response.json()

      if (data.success) {
        const templatesMap: Record<string, Template> = {}
        data.templates.forEach((t: Template) => {
          templatesMap[t.type] = t
        })
        setTemplates(templatesMap)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          content,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Content saved successfully')
        fetchTemplates()
      }
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handlePreview = () => {
    // Open preview in new window
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview - ${activeTab}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management System</h1>
        <p className="text-muted-foreground">Edit templates for horoscopes, festivals, rituals, notifications, and emails</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Templates</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreview}>
                Preview
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="horoscope">Daily Horoscope</TabsTrigger>
              <TabsTrigger value="festival">Festival</TabsTrigger>
              <TabsTrigger value="ritual">Ritual</TabsTrigger>
              <TabsTrigger value="notification">Notification</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="horoscope">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Daily horoscope template..."
                rows={20}
                className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="festival">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Festival template..."
                rows={20}
                className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="ritual">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ritual template..."
                rows={20}
                className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="notification">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Notification template..."
                rows={20}
                className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="email">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Email template (HTML)..."
                rows={20}
                className="font-mono text-sm"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


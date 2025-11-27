'use client'

/**
 * AI Guru Monitoring Page
 * Milestone 10 - Step 6
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Chat {
  id: string
  userId: string
  message: string
  response: string
  contextUsed?: any
  sources?: any[]
  confidence?: number
  createdAt: any
}

export default function GuruPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/admin/guru?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setChats(data.chats)
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (chat: Chat) => {
    try {
      const response = await fetch(`/api/admin/guru/${chat.id}?userId=${chat.userId}`)
      const data = await response.json()

      if (data.success) {
        setSelectedChat(data.chat)
      }
    } catch (error) {
      console.error('Failed to fetch chat details:', error)
    }
  }

  const handleAddFeedback = async (chatId: string, userId: string, rating: number, feedback: string, hallucination: boolean) => {
    try {
      const response = await fetch(`/api/admin/guru/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, feedback, rating, hallucination }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Feedback added successfully')
        fetchChats()
      }
    } catch (error) {
      console.error('Add feedback failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Guru Monitoring</h1>
        <p className="text-muted-foreground">Monitor and analyze AI Guru conversations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Chats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Filter by User ID..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Button onClick={fetchChats} disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Chats ({chats.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : chats.length === 0 ? (
              <div>No chats found</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="rounded-lg border p-3 cursor-pointer hover:bg-muted"
                    onClick={() => handleViewDetails(chat)}
                  >
                    <p className="text-sm font-medium truncate">Q: {chat.message}</p>
                    <p className="text-xs text-muted-foreground">
                      User: {chat.userId} | Confidence: {chat.confidence || 'N/A'}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedChat && (
          <Card>
            <CardHeader>
              <CardTitle>Chat Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chat" className="w-full">
                <TabsList>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="context">Context</TabsTrigger>
                  <TabsTrigger value="rag">RAG Sources</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="chat">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Question:</p>
                      <p className="text-sm">{selectedChat.message}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Response:</p>
                      <p className="text-sm">{selectedChat.response}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Confidence:</p>
                      <p className="text-sm">{selectedChat.confidence || 'N/A'}%</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="context">
                  <pre className="overflow-auto rounded bg-muted p-4 text-xs">
                    {JSON.stringify(selectedChat.contextUsed || {}, null, 2)}
                  </pre>
                </TabsContent>

                <TabsContent value="rag">
                  <div className="space-y-2">
                    {selectedChat.sources && selectedChat.sources.length > 0 ? (
                      selectedChat.sources.map((source: any, idx: number) => (
                        <div key={idx} className="rounded border p-2">
                          <p className="text-sm font-medium">{source.title}</p>
                          <p className="text-xs text-muted-foreground">{source.category}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No RAG sources used</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="feedback">
                  <div className="space-y-4">
                    <Input placeholder="Rating (1-5)" type="number" min="1" max="5" id="rating" />
                    <Input placeholder="Feedback comment" id="feedback" />
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="hallucination" />
                      <label htmlFor="hallucination" className="text-sm">Mark as hallucination</label>
                    </div>
                    <Button
                      onClick={() => {
                        const rating = (document.getElementById('rating') as HTMLInputElement)?.value
                        const feedback = (document.getElementById('feedback') as HTMLInputElement)?.value
                        const hallucination = (document.getElementById('hallucination') as HTMLInputElement)?.checked
                        if (rating && feedback) {
                          handleAddFeedback(selectedChat.id, selectedChat.userId, parseInt(rating), feedback, hallucination)
                        }
                      }}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


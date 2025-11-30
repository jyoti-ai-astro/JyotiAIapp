'use client'

/**
 * AI Guru Monitoring Page
 * Milestone 10 - Step 6
 */

'use client';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Chat {
  id: string
  userId: string
  userEmail?: string
  question?: string
  message?: string
  answer?: string
  response?: string
  answerSummary?: string
  contextUsed?: any
  debugPayload?: any
  sources?: any[]
  confidence?: number
  mode?: string
  usedAstroContext?: boolean
  usedRag?: boolean
  errorCode?: string | null
  createdAt: any
}

export default function GuruPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [todayOnly, setTodayOnly] = useState(true)

  useEffect(() => {
    fetchChats()
  }, [todayOnly])

  const fetchChats = async () => {
    setLoading(true)
    try {
      // Fetch from new Guru logs API
      const params = new URLSearchParams()
      params.append('limit', '100')
      params.append('today', todayOnly.toString())

      const response = await fetch(`/api/admin/guru/logs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setChats(data.sessions || [])
        setStats(data.stats || null)
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
        <h1 className="text-3xl font-bold">AI Guru Debug Console</h1>
        <p className="text-muted-foreground">Monitor and analyze AI Guru conversations with debug info</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Guru Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{todayOnly ? 'Today' : 'All time'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">With AstroContext</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withAstroContext}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.withAstroContext / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">With RAG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withRag}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.withRag / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todayOnly}
                onChange={(e) => setTodayOnly(e.target.checked)}
              />
              <span className="text-sm">Today only</span>
            </label>
            <Button onClick={fetchChats} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Refresh'}
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
                    onClick={() => setSelectedChat(chat)}
                  >
                    <p className="text-sm font-medium truncate">Q: {chat.question || chat.message}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={chat.usedAstroContext ? 'default' : 'secondary'}>
                        {chat.usedAstroContext ? 'Astro' : 'No Astro'}
                      </Badge>
                      <Badge variant={chat.usedRag ? 'default' : 'secondary'}>
                        {chat.usedRag ? 'RAG' : 'No RAG'}
                      </Badge>
                      {chat.mode && (
                        <Badge variant="outline">{chat.mode}</Badge>
                      )}
                      {chat.errorCode && (
                        <Badge variant="destructive">Error: {chat.errorCode}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {chat.userEmail || chat.userId} | {chat.createdAt ? new Date(chat.createdAt).toLocaleString() : 'N/A'}
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
                      <p className="text-sm">{selectedChat.question || selectedChat.message}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Response:</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedChat.answer || selectedChat.response}</p>
                    </div>
                    {selectedChat.confidence && (
                      <div>
                        <p className="text-sm font-medium">Confidence:</p>
                        <p className="text-sm">{selectedChat.confidence}%</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="context">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Debug Payload</p>
                      <pre className="overflow-auto rounded bg-muted p-4 text-xs max-h-96">
                        {JSON.stringify(selectedChat.debugPayload || selectedChat.contextUsed || {}, null, 2)}
                      </pre>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Used AstroContext</p>
                        <Badge variant={selectedChat.usedAstroContext ? 'default' : 'secondary'}>
                          {selectedChat.usedAstroContext ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Used RAG</p>
                        <Badge variant={selectedChat.usedRag ? 'default' : 'secondary'}>
                          {selectedChat.usedRag ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {selectedChat.mode && (
                        <div>
                          <p className="text-sm font-medium">Mode</p>
                          <Badge variant="outline">{selectedChat.mode}</Badge>
                        </div>
                      )}
                      {selectedChat.errorCode && (
                        <div>
                          <p className="text-sm font-medium">Error Code</p>
                          <Badge variant="destructive">{selectedChat.errorCode}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
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


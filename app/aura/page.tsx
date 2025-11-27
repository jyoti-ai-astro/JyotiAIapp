'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuraPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleFileSelect = (file: File | null) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!imageFile) {
      alert('Please select an image')
      return
    }

    setUploading(true)

    try {
      // Upload image
      const formData = new FormData()
      formData.append('image', imageFile)

      const uploadResponse = await fetch('/api/aura/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const uploadData = await uploadResponse.json()
      setImageUrl(uploadData.imageUrl)

      // Analyze aura
      setAnalyzing(true)
      const analyzeResponse = await fetch('/api/aura/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: uploadData.imageUrl,
        }),
      })

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze aura')
      }

      const analyzeData = await analyzeResponse.json()
      setAnalysis(analyzeData.analysis)
    } catch (error: any) {
      console.error('Aura error:', error)
      alert(error.message || 'Failed to process image')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-display font-bold">Aura Reading</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Selfie</CardTitle>
          <CardDescription>
            Upload a clear selfie to analyze your aura colors and chakra balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Selfie Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>

          {imagePreview && (
            <div className="rounded-lg border p-4">
              <img src={imagePreview} alt="Selfie preview" className="w-full rounded-lg" />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!imageFile || uploading || analyzing}
            className="w-full"
          >
            {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload & Analyze'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Tips: Use natural lighting, face the camera directly, ensure clear visibility. Maximum
            file size: 10MB
          </p>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aura Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Primary Color</p>
                  <p className="text-lg font-semibold text-mystic capitalize">
                    {analysis.primaryColor}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">All Colors Detected</p>
                  <div className="flex gap-2 mt-2">
                    {analysis.auraColors.map((color: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-mystic/10 px-3 py-1 text-sm capitalize"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Energy Score</p>
                  <p className="text-2xl font-bold text-mystic">{analysis.energyScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chakra Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analysis.chakraBalance).map(([chakra, score]: [string, any]) => (
                  <div key={chakra}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium capitalize">{chakra}</p>
                      <p className="text-sm">{score}/100</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-mystic"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}


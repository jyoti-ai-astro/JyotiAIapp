'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PalmistryPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [leftPalmFile, setLeftPalmFile] = useState<File | null>(null)
  const [rightPalmFile, setRightPalmFile] = useState<File | null>(null)
  const [leftPalmPreview, setLeftPalmPreview] = useState<string | null>(null)
  const [rightPalmPreview, setRightPalmPreview] = useState<string | null>(null)
  const [leftPalmUrl, setLeftPalmUrl] = useState<string | null>(null)
  const [rightPalmUrl, setRightPalmUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleFileSelect = (
    file: File | null,
    side: 'left' | 'right',
    setPreview: (url: string) => void
  ) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    if (side === 'left') {
      setLeftPalmFile(file)
    } else {
      setRightPalmFile(file)
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!leftPalmFile || !rightPalmFile) {
      alert('Please select both left and right palm images')
      return
    }

    setUploading(true)

    try {
      // Upload images
      const formData = new FormData()
      formData.append('leftPalm', leftPalmFile)
      formData.append('rightPalm', rightPalmFile)

      const uploadResponse = await fetch('/api/palmistry/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload images')
      }

      const uploadData = await uploadResponse.json()
      setLeftPalmUrl(uploadData.leftPalmUrl)
      setRightPalmUrl(uploadData.rightPalmUrl)

      // Analyze palm
      setAnalyzing(true)
      const analyzeResponse = await fetch('/api/palmistry/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leftPalmUrl: uploadData.leftPalmUrl,
          rightPalmUrl: uploadData.rightPalmUrl,
        }),
      })

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze palm')
      }

      const analyzeData = await analyzeResponse.json()
      setAnalysis(analyzeData.analysis)
    } catch (error: any) {
      console.error('Palmistry error:', error)
      alert(error.message || 'Failed to process palm images')
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
        <h1 className="text-4xl font-display font-bold">Palmistry Analysis</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Palms</CardTitle>
          <CardDescription>
            Upload clear images of both your left and right palms for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Palm */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Left Palm</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] || null, 'left', setLeftPalmPreview)
                  }
                  className="w-full text-sm"
                />
              </div>
              {leftPalmPreview && (
                <div className="rounded-lg border p-4">
                  <img
                    src={leftPalmPreview}
                    alt="Left palm preview"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Right Palm */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Right Palm</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] || null, 'right', setRightPalmPreview)
                  }
                  className="w-full text-sm"
                />
              </div>
              {rightPalmPreview && (
                <div className="rounded-lg border p-4">
                  <img
                    src={rightPalmPreview}
                    alt="Right palm preview"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!leftPalmFile || !rightPalmFile || uploading || analyzing}
            className="w-full"
          >
            {uploading
              ? 'Uploading...'
              : analyzing
                ? 'Analyzing...'
                : 'Upload & Analyze'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Tips: Use good lighting, keep palm flat, ensure all lines are visible. Maximum file
            size: 10MB
          </p>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Palmistry Analysis</CardTitle>
            <CardDescription>Your palm reading results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Full palmistry analysis with AI Vision will be available in a later milestone.
                  The structure is ready for integration.
                </p>
              </div>
              {analysis.overallScore !== undefined && (
                <div>
                  <p className="text-sm font-medium">Overall Score</p>
                  <p className="text-2xl font-bold text-mystic">{analysis.overallScore}/100</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


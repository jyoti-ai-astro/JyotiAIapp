'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { CosmicPalmistry } from '@/components/palmistry/CosmicPalmistry'

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

  const handleFileSelect = (file: File | null, side: 'left' | 'right') => {
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
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLeftPalmPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setRightPalmFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setRightPalmPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
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
    <CosmicPalmistry
      leftPalmFile={leftPalmFile}
      rightPalmFile={rightPalmFile}
      leftPalmPreview={leftPalmPreview}
      rightPalmPreview={rightPalmPreview}
      onFileSelect={handleFileSelect}
      onUpload={handleUpload}
      uploading={uploading}
      analyzing={analyzing}
      analysis={analysis}
    />
  )
}


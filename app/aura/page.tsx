'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { CosmicAura } from '@/components/aura/CosmicAura'

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
    <CosmicAura
      imageFile={imageFile}
      imagePreview={imagePreview}
      onFileSelect={handleFileSelect}
      onUpload={handleUpload}
      uploading={uploading}
      analyzing={analyzing}
      analysis={analysis}
    />
  )
}


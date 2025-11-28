'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { usePalmistry } from '@/lib/hooks/usePalmistry'
import { CosmicPalmistry } from '@/components/palmistry/CosmicPalmistry'

export default function PalmistryPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const { analysis, loading: analyzing, error, analyze } = usePalmistry()
  const [leftPalmFile, setLeftPalmFile] = useState<File | null>(null)
  const [rightPalmFile, setRightPalmFile] = useState<File | null>(null)
  const [leftPalmPreview, setLeftPalmPreview] = useState<string | null>(null)
  const [rightPalmPreview, setRightPalmPreview] = useState<string | null>(null)

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
    if (!leftPalmFile || !rightPalmFile || !leftPalmPreview || !rightPalmPreview) {
      alert('Please select both left and right palm images')
      return
    }
    await analyze(leftPalmPreview, rightPalmPreview)
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
              uploading={false}
              analyzing={analyzing}
              analysis={analysis}
    />
  )
}


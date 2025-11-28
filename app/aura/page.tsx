'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { useAuraScan } from '@/lib/hooks/useAuraScan'
import { CosmicAura } from '@/components/aura/CosmicAura';
import { AuraScanner } from '@/components/engines/AuraScanner';

export default function AuraPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const { analysis, loading: analyzing, error, scan } = useAuraScan()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
    if (!imageFile || !imagePreview) {
      alert('Please select an image')
      return
    }
    await scan(imagePreview)
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
              uploading={false}
              analyzing={analyzing}
              analysis={analysis}
            />
  )
}


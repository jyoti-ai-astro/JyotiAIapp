/**
 * Unified Upload Service
 * Part B - Section 4: Milestone 4 - Step 4
 * 
 * Handles image uploads for palm, face, aura scans
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

export interface UploadResult {
  url: string
  path: string
  size: number
  type: string
  uploadedAt: Date
}

export interface UploadOptions {
  userId: string
  file: File
  category: 'palm' | 'face' | 'aura' | 'other'
  subcategory?: 'left' | 'right' | 'front' | 'back'
}

/**
 * Compress image in browser (client-side)
 */
export async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP image.',
    }
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.',
    }
  }
  
  return { valid: true }
}

/**
 * Upload image to Firebase Storage
 */
export async function uploadImage(options: UploadOptions): Promise<UploadResult> {
  const { userId, file, category, subcategory } = options
  
  // Validate file
  const validation = validateImage(file)
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file')
  }
  
  // Compress image
  const compressedBlob = await compressImage(file)
  
  // Generate file path
  const timestamp = Date.now()
  const extension = file.name.split('.').pop() || 'jpg'
  const filename = subcategory
    ? `${category}-${subcategory}-${timestamp}.${extension}`
    : `${category}-${timestamp}.${extension}`
  
  const storagePath = `user_uploads/${userId}/${filename}`
  
  // Upload to Firebase Storage
  const storageRef = ref(storage, storagePath)
  const snapshot = await uploadBytes(storageRef, compressedBlob, {
    contentType: file.type,
  })
  
  // Get download URL
  const url = await getDownloadURL(snapshot.ref)
  
  return {
    url,
    path: storagePath,
    size: compressedBlob.size,
    type: file.type,
    uploadedAt: new Date(),
  }
}

/**
 * Upload multiple images (for palm - left and right)
 */
export async function uploadMultipleImages(
  userId: string,
  files: Array<{ file: File; subcategory: string }>,
  category: 'palm' | 'face' | 'aura'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(({ file, subcategory }) =>
    uploadImage({
      userId,
      file,
      category,
      subcategory: subcategory as 'left' | 'right' | 'front' | 'back',
    })
  )
  
  return Promise.all(uploadPromises)
}

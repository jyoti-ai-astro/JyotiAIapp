import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { uploadImage, validateImage } from '@/lib/services/upload-service'

/**
 * Upload Image Endpoint
 * Part B - Section 3: Milestone 4 - Step 4
 * 
 * Handles image uploads for palm, face, aura scans
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type || !['palm-left', 'palm-right', 'face', 'aura'].includes(type)) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    // Validate image
    const validation = validateImage(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Upload image (client-side compression will be handled in UI)
    // For server-side, we'll use the file as-is for now
    const result = await uploadImage(file, uid, type as any, false)

    return NextResponse.json({
      success: true,
      upload: result,
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}


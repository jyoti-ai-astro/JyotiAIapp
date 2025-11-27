import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

/**
 * Upload Aura Image (Selfie)
 * Part B - Section 4: Milestone 4 - Step 3
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
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Upload image to Firebase Storage
    const timestamp = Date.now()
    const imagePath = `user_uploads/${uid}/aura-${timestamp}.jpg`

    const imageRef = ref(storage, imagePath)
    const imageBlob = await image.arrayBuffer()

    await uploadBytes(imageRef, imageBlob, { contentType: image.type })
    const imageUrl = await getDownloadURL(imageRef)

    return NextResponse.json({
      success: true,
      imageUrl,
    })
  } catch (error: any) {
    console.error('Aura upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}


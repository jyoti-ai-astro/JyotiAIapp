import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

/**
 * Upload Palm Images
 * Part B - Section 4: Milestone 4 - Step 2
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
    const leftPalm = formData.get('leftPalm') as File
    const rightPalm = formData.get('rightPalm') as File

    if (!leftPalm || !rightPalm) {
      return NextResponse.json(
        { error: 'Both left and right palm images are required' },
        { status: 400 }
      )
    }

    // Upload images to Firebase Storage
    const timestamp = Date.now()
    const leftPath = `user_uploads/${uid}/palm-left-${timestamp}.jpg`
    const rightPath = `user_uploads/${uid}/palm-right-${timestamp}.jpg`

    const leftRef = ref(storage, leftPath)
    const rightRef = ref(storage, rightPath)

    // Convert File to Blob for upload
    const leftBlob = await leftPalm.arrayBuffer()
    const rightBlob = await rightPalm.arrayBuffer()

    await uploadBytes(leftRef, leftBlob, { contentType: leftPalm.type })
    await uploadBytes(rightRef, rightBlob, { contentType: rightPalm.type })

    const leftUrl = await getDownloadURL(leftRef)
    const rightUrl = await getDownloadURL(rightRef)

    return NextResponse.json({
      success: true,
      leftPalmUrl: leftUrl,
      rightPalmUrl: rightUrl,
    })
  } catch (error: any) {
    console.error('Palm upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload palm images' },
      { status: 500 }
    )
  }
}


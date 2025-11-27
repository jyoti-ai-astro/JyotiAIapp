import { NextRequest, NextResponse } from 'next/server'
import { KundaliGenerator } from '@/lib/engines/kundali/generator'
import type { BirthDetails } from '@/lib/engines/kundali/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const birthDetails: BirthDetails = body

    // Validate birth details
    if (!birthDetails.dob || !birthDetails.tob || !birthDetails.pob) {
      return NextResponse.json({ error: 'Missing required birth details' }, { status: 400 })
    }

    // Generate kundali
    const generator = new KundaliGenerator()
    const kundali = await generator.generate(birthDetails)

    return NextResponse.json({ success: true, kundali })
  } catch (error) {
    console.error('Kundali generation error:', error)
    return NextResponse.json({ error: 'Failed to generate kundali' }, { status: 500 })
  }
}


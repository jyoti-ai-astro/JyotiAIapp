import { NextRequest, NextResponse } from 'next/server'
import { KundaliGenerator } from '@/lib/engines/kundali/generator'
import type { BirthDetails } from '@/lib/engines/kundali/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const birthDetails: BirthDetails = body

    // Validate birth details
    if (!birthDetails.dob || !birthDetails.tob || !birthDetails.pob) {
      return NextResponse.json({ error: 'Missing required birth details' }, { status: 400 })
    }

    // Convert API birth details to the astronomical engine contract.
    // This follows the same convention already used by generate-full
    // and onboarding/calculate-rashi.
    const dob = new Date(birthDetails.dob)
    const [hours, minutes] = String(birthDetails.tob).split(':').map(Number)

    if (
      Number.isNaN(dob.getTime()) ||
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return NextResponse.json(
        { error: 'Invalid birth date or time' },
        { status: 400 }
      )
    }

    const engineBirthDetails = {
      year: dob.getFullYear(),
      month: dob.getMonth() + 1,
      day: dob.getDate(),
      hour: hours,
      minute: minutes,
      second: 0,
      lat: birthDetails.lat,
      lng: birthDetails.lng,
      timezone: birthDetails.timezone || 'Asia/Kolkata',
    }

    // Generate kundali
    const generator = new KundaliGenerator()
    const kundali = await generator.generate(engineBirthDetails)

    return NextResponse.json({ success: true, kundali })
  } catch (error) {
    console.error('Kundali generation error:', error)
    return NextResponse.json({ error: 'Failed to generate kundali' }, { status: 500 })
  }
}


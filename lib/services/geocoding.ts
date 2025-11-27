/**
 * Geocoding Service
 * Converts place names to coordinates and timezone
 * Part B - Section 3: Onboarding Flow
 */

interface GeocodeResult {
  lat: number
  lng: number
  timezone: string
  formattedAddress: string
}

/**
 * Geocode using TimezoneDB API (free tier available)
 * Falls back to GeoNames if TimezoneDB fails
 */
export async function geocodePlace(placeName: string): Promise<GeocodeResult> {
  // First try: TimezoneDB (more accurate for timezone)
  try {
    // Phase 31 - F46: Use validated environment variables
    const timezoneDbKey = (await import('@/lib/env/env.mjs')).envVars.geocoding.timezoneDbKey
    if (timezoneDbKey) {
      // Use Google Geocoding for coordinates first
      const geoResult = await geocodeWithGoogle(placeName)
      if (geoResult) {
        // Then get timezone from TimezoneDB
        const timezone = await getTimezoneFromTimezoneDB(geoResult.lat, geoResult.lng, timezoneDbKey)
        return {
          ...geoResult,
          timezone: timezone || geoResult.timezone,
        }
      }
    }
  } catch (error) {
    console.warn('TimezoneDB geocoding failed, trying GeoNames:', error)
  }

  // Fallback: GeoNames (free, no API key required for basic usage)
  try {
    return await geocodeWithGeoNames(placeName)
  } catch (error) {
    console.error('GeoNames geocoding failed:', error)
    throw new Error(`Could not geocode place: ${placeName}`)
  }
}

/**
 * Geocode using Google Geocoding API (if available)
 */
async function geocodeWithGoogle(placeName: string): Promise<GeocodeResult | null> {
  const googleApiKey = (await import('@/lib/env/env.mjs')).envVars.geocoding.googleApiKey
  if (!googleApiKey) {
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=${googleApiKey}`
    )
    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      const location = result.geometry.location

      // Get timezone from Google Time Zone API
      const timezoneResponse = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${googleApiKey}`
      )
      const timezoneData = await timezoneResponse.json()

      return {
        lat: location.lat,
        lng: location.lng,
        timezone: timezoneData.timeZoneId || 'UTC',
        formattedAddress: result.formatted_address,
      }
    }
  } catch (error) {
    console.error('Google geocoding error:', error)
  }

  return null
}

/**
 * Get timezone from TimezoneDB API
 */
async function getTimezoneFromTimezoneDB(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${lat}&lng=${lng}`
    )
    const data = await response.json()

    if (data.status === 'OK') {
      return data.zoneName || null
    }
  } catch (error) {
    console.error('TimezoneDB error:', error)
  }

  return null
}

/**
 * Geocode using GeoNames (free, no API key required)
 */
async function geocodeWithGeoNames(placeName: string): Promise<GeocodeResult> {
  try {
    // GeoNames search API
    const response = await fetch(
      `http://api.geonames.org/searchJSON?q=${encodeURIComponent(placeName)}&maxRows=1&username=demo`
    )
    const data = await response.json()

    if (data.geonames && data.geonames.length > 0) {
      const place = data.geonames[0]

      // Get timezone from GeoNames timezone API
      const timezoneResponse = await fetch(
        `http://api.geonames.org/timezoneJSON?lat=${place.lat}&lng=${place.lng}&username=demo`
      )
      const timezoneData = await timezoneResponse.json()

      return {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lng),
        timezone: timezoneData.timezoneId || 'UTC',
        formattedAddress: `${place.name}, ${place.countryName}`,
      }
    }

    throw new Error('No results found')
  } catch (error) {
    console.error('GeoNames error:', error)
    throw error
  }
}

/**
 * Simple fallback: return default values if all geocoding fails
 */
export function getDefaultGeocode(placeName: string): GeocodeResult {
  // Common Indian cities fallback
  const indianCities: Record<string, GeocodeResult> = {
    delhi: { lat: 28.7041, lng: 77.1025, timezone: 'Asia/Kolkata', formattedAddress: 'Delhi, India' },
    mumbai: { lat: 19.076, lng: 72.8777, timezone: 'Asia/Kolkata', formattedAddress: 'Mumbai, India' },
    bangalore: { lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata', formattedAddress: 'Bangalore, India' },
    kolkata: { lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata', formattedAddress: 'Kolkata, India' },
    chennai: { lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata', formattedAddress: 'Chennai, India' },
  }

  const lowerPlace = placeName.toLowerCase()
  for (const [city, coords] of Object.entries(indianCities)) {
    if (lowerPlace.includes(city)) {
      return coords
    }
  }

  // Default to Delhi if unknown
  return indianCities.delhi
}


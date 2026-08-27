/**
 * Geocoding Service
 * Converts place names to coordinates and timezone
 * Part B - Section 3: Onboarding Flow
 */

export interface GeocodeResult {
  lat: number
  lng: number
  timezone: string
  formattedAddress: string
  provider?: 'google' | 'geonames' | 'client_coordinates'
}

export class GeocodingError extends Error {
  code: 'LOCATION_NOT_VERIFIED' | 'TIMEZONE_NOT_VERIFIED' | 'INVALID_COORDINATES'

  constructor(code: GeocodingError['code'], message: string) {
    super(message)
    this.name = 'GeocodingError'
    this.code = code
  }
}

export function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

export function isValidTimezone(timezone: unknown): timezone is string {
  if (typeof timezone !== 'string' || timezone.trim().length === 0) return false
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/**
 * Geocode using TimezoneDB API (free tier available)
 * Falls back to GeoNames if TimezoneDB fails
 */
export async function geocodePlace(placeName: string): Promise<GeocodeResult> {
  const trimmedPlace = placeName.trim()
  if (!trimmedPlace) {
    throw new GeocodingError('LOCATION_NOT_VERIFIED', 'Place of birth is required.')
  }

  // First try Google when configured. It provides both coordinates and timezone.
  try {
    const geoResult = await geocodeWithGoogle(trimmedPlace)
    if (geoResult) {
      return geoResult
    }
  } catch (error) {
    console.warn('Google geocoding failed, trying GeoNames:', error)
  }

  // Secondary provider: GeoNames. Results are accepted only with a real timezone.
  try {
    return await geocodeWithGeoNames(trimmedPlace)
  } catch (error) {
    console.error('GeoNames geocoding failed:', error)
    throw new GeocodingError(
      'LOCATION_NOT_VERIFIED',
      `Could not verify place of birth: ${trimmedPlace}`
    )
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
      if (!isValidCoordinate(location.lat, location.lng)) {
        throw new GeocodingError('INVALID_COORDINATES', 'Google returned invalid coordinates.')
      }

      // Get timezone from Google Time Zone API
      const timezoneResponse = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${googleApiKey}`
      )
      const timezoneData = await timezoneResponse.json()
      const timezone = timezoneData.status === 'OK' ? timezoneData.timeZoneId : null

      if (!isValidTimezone(timezone)) {
        throw new GeocodingError('TIMEZONE_NOT_VERIFIED', 'Google did not return a valid timezone.')
      }

      return {
        lat: location.lat,
        lng: location.lng,
        timezone,
        formattedAddress: result.formatted_address,
        provider: 'google',
      }
    }
  } catch (error) {
    console.error('Google geocoding error:', error)
  }

  return null
}

export async function resolveTimezoneForCoordinates(
  lat: number,
  lng: number
): Promise<string> {
  if (!isValidCoordinate(lat, lng)) {
    throw new GeocodingError('INVALID_COORDINATES', 'Birth coordinates are invalid.')
  }

  const { envVars } = await import('@/lib/env/env.mjs')
  const googleApiKey = envVars.geocoding.googleApiKey
  if (googleApiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${googleApiKey}`
      )
      const data = await response.json()
      if (data.status === 'OK' && isValidTimezone(data.timeZoneId)) {
        return data.timeZoneId
      }
    } catch (error) {
      console.warn('Google timezone lookup failed:', error)
    }
  }

  const timezoneDbKey = envVars.geocoding.timezoneDbKey
  if (timezoneDbKey) {
    const timezone = await getTimezoneFromTimezoneDB(lat, lng, timezoneDbKey)
    if (isValidTimezone(timezone)) {
      return timezone
    }
  }

  throw new GeocodingError(
    'TIMEZONE_NOT_VERIFIED',
    'Could not verify timezone for the selected birth location.'
  )
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

    if (data.status === 'OK' && isValidTimezone(data.zoneName)) {
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
      const lat = parseFloat(place.lat)
      const lng = parseFloat(place.lng)
      if (!isValidCoordinate(lat, lng)) {
        throw new GeocodingError('INVALID_COORDINATES', 'GeoNames returned invalid coordinates.')
      }

      // Get timezone from GeoNames timezone API
      const timezoneResponse = await fetch(
        `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=demo`
      )
      const timezoneData = await timezoneResponse.json()
      const timezone = timezoneData.timezoneId

      if (!isValidTimezone(timezone)) {
        throw new GeocodingError('TIMEZONE_NOT_VERIFIED', 'GeoNames did not return a valid timezone.')
      }

      return {
        lat,
        lng,
        timezone,
        formattedAddress: `${place.name}, ${place.countryName}`,
        provider: 'geonames',
      }
    }

    throw new GeocodingError('LOCATION_NOT_VERIFIED', 'No geocoding results found.')
  } catch (error) {
    console.error('GeoNames error:', error)
    throw error
  }
}

/**
 * Deprecated test/dev helper. Production onboarding and profile updates must
 * never use these synthetic coordinates.
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

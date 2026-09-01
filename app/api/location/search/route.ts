import { NextRequest, NextResponse } from 'next/server'
import { envVars } from '@/lib/env/env.mjs'

export const dynamic = 'force-dynamic'

type SearchRequest =
  | { action?: 'search'; query: string }
  | { action: 'resolve'; placeId: string }

type GoogleAutocompleteSuggestion = {
  placePrediction?: {
    place?: string
    placeId?: string
    text?: {
      text?: string
    }
    structuredFormat?: {
      mainText?: {
        text?: string
      }
      secondaryText?: {
        text?: string
      }
    }
    types?: string[]
  }
}

function getGoogleApiKey() {
  return (
    envVars?.geocoding?.googleApiKey ||
    process.env.GOOGLE_GEOCODING_API_KEY ||
    ''
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SearchRequest
    const apiKey = getGoogleApiKey()

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Google location services are not configured.',
          results: [],
        },
        { status: 500 }
      )
    }

    if ('action' in body && body.action === 'resolve') {
      return resolvePlace(body.placeId, apiKey)
    }

    const query = 'query' in body ? body.query?.trim() : ''

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types',
        },
        body: JSON.stringify({
          input: query,
          includedPrimaryTypes: [
            '(cities)',
          ],
          languageCode: 'en',
        }),
        cache: 'no-store',
      }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('Places API New autocomplete error:', data)

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            'Location search provider returned an error.',
          results: [],
        },
        { status: response.status }
      )
    }

    const suggestions = Array.isArray(data?.suggestions)
      ? (data.suggestions as GoogleAutocompleteSuggestion[])
      : []

    const results = suggestions
      .map((entry) => entry.placePrediction)
      .filter(Boolean)
      .map((prediction) => ({
        placeId:
          prediction?.placeId ||
          prediction?.place?.replace(/^places\//, '') ||
          '',
        formattedAddress:
          prediction?.text?.text ||
          [
            prediction?.structuredFormat?.mainText?.text,
            prediction?.structuredFormat?.secondaryText?.text,
          ]
            .filter(Boolean)
            .join(', '),
        primaryText:
          prediction?.structuredFormat?.mainText?.text || '',
        secondaryText:
          prediction?.structuredFormat?.secondaryText?.text || '',
        types: prediction?.types || [],
      }))
      .filter((result) => result.placeId && result.formattedAddress)
      .slice(0, 6)

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Location search error:', error)

    return NextResponse.json(
      {
        error: error?.message || 'Failed to search locations',
        results: [],
      },
      { status: 500 }
    )
  }
}

async function resolvePlace(placeId: string, apiKey: string) {
  const trimmedPlaceId = placeId?.trim()

  if (!trimmedPlaceId) {
    return NextResponse.json(
      {
        error: 'A valid place ID is required.',
      },
      { status: 400 }
    )
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(
      trimmedPlaceId
    )}`,
    {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,addressComponents,location,types',
      },
      cache: 'no-store',
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    console.error('Places API New details error:', data)

    return NextResponse.json(
      {
        error:
          data?.error?.message ||
          'Could not verify the selected location.',
      },
      { status: response.status }
    )
  }

  const lat = data?.location?.latitude
  const lng = data?.location?.longitude

  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return NextResponse.json(
      {
        error: 'Google returned invalid location coordinates.',
      },
      { status: 422 }
    )
  }

  const components = Array.isArray(data?.addressComponents)
    ? data.addressComponents
    : []

  const findComponent = (...types: string[]) =>
    components.find((component: any) =>
      types.some((type) =>
        Array.isArray(component?.types)
          ? component.types.includes(type)
          : false
      )
    )

  const cityComponent = findComponent(
    'locality',
    'postal_town',
    'administrative_area_level_3',
    'administrative_area_level_2'
  )

  const stateComponent = findComponent('administrative_area_level_1')
  const countryComponent = findComponent('country')

  return NextResponse.json({
    result: {
      placeId: data.id || trimmedPlaceId,
      formattedAddress:
        data.formattedAddress ||
        data?.displayName?.text ||
        '',
      lat,
      lng,
      city: cityComponent?.longText || cityComponent?.shortText || '',
      state: stateComponent?.longText || stateComponent?.shortText || '',
      country:
        countryComponent?.longText ||
        countryComponent?.shortText ||
        '',
      countryCode: countryComponent?.shortText || '',
    },
  })
}

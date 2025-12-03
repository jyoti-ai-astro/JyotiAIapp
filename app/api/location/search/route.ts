/**
 * Location Search API
 * 
 * Searches for locations using Google Geocoding API
 * Returns formatted addresses with coordinates
 */

import { NextRequest, NextResponse } from 'next/server';
import { envVars } from '@/lib/env/env.mjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const googleApiKey = envVars.geocoding.googleApiKey;

    if (!googleApiKey) {
      console.warn('GOOGLE_GEOCODING_API_KEY not configured. Location autocomplete will not work.');
      // Return helpful error message instead of empty results
      return NextResponse.json({ 
        results: [],
        error: 'Location search is not configured. Please set GOOGLE_GEOCODING_API_KEY in Vercel environment variables.',
      });
    }

    // Use Google Places Autocomplete API for better suggestions
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleApiKey}&types=(cities)`;

    const autocompleteResponse = await fetch(autocompleteUrl);
    const autocompleteData = await autocompleteResponse.json();

    if (autocompleteData.status !== 'OK' && autocompleteData.status !== 'ZERO_RESULTS') {
      // Fallback to geocoding API
      return await geocodeFallback(query, googleApiKey);
    }

    if (!autocompleteData.predictions || autocompleteData.predictions.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Get details for each prediction
    const results = await Promise.all(
      autocompleteData.predictions.slice(0, 5).map(async (prediction: any) => {
        // Get place details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry,formatted_address,name,address_components&key=${googleApiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === 'OK' && detailsData.result) {
          const result = detailsData.result;
          const location = result.geometry.location;

          // Extract city and country from address components
          let city = '';
          let country = '';
          if (result.address_components) {
            const cityComponent = result.address_components.find((comp: any) =>
              comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
            );
            const countryComponent = result.address_components.find((comp: any) =>
              comp.types.includes('country')
            );
            city = cityComponent?.long_name || '';
            country = countryComponent?.long_name || '';
          }

          return {
            formattedAddress: result.formatted_address || prediction.description,
            lat: location.lat,
            lng: location.lng,
            city,
            country,
          };
        }

        return null;
      })
    );

    return NextResponse.json({
      results: results.filter((r) => r !== null),
    });
  } catch (error: any) {
    console.error('Location search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search locations' },
      { status: 500 }
    );
  }
}

async function geocodeFallback(query: string, apiKey: string) {
  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const results = data.results.slice(0, 5).map((result: any) => {
        const location = result.geometry.location;
        let city = '';
        let country = '';

        if (result.address_components) {
          const cityComponent = result.address_components.find((comp: any) =>
            comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
          );
          const countryComponent = result.address_components.find((comp: any) =>
            comp.types.includes('country')
          );
          city = cityComponent?.long_name || '';
          country = countryComponent?.long_name || '';
        }

        return {
          formattedAddress: result.formatted_address,
          lat: location.lat,
          lng: location.lng,
          city,
          country,
        };
      });

      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error: any) {
    console.error('Geocode fallback error:', error);
    return NextResponse.json({ results: [] });
  }
}


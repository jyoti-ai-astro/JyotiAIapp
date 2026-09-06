import { isAstroFactsMetadata } from './astro-facts'
import type { AstroContext } from './astro-types'
import type { KundaliData } from './kundali-engine'

function dateToIso(value: any): string {
  if (!value) return new Date().toISOString()
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

export function normalizeFirestoreKundaliData(
  kundaliRoot: any,
  d1: any,
  dashaData: any
): KundaliData | null {
  if (kundaliRoot?.meta?.stale === true) {
    return null
  }

  if (!d1?.grahas || !d1?.bhavas || !d1?.lagna || !dashaData?.currentMahadasha || !dashaData?.currentAntardasha) {
    return null
  }

  const grahas = Object.values(d1.grahas).map((graha: any) => ({
    planet: graha.planet,
    sign: graha.sign,
    nakshatra: graha.nakshatra,
    pada: graha.pada,
    house: graha.house,
    longitude: graha.longitude,
    latitude: graha.latitude || 0,
    degreesInSign: graha.degreesInSign,
    retrograde: graha.retrograde || false,
  })) as KundaliData['grahas']

  const houses = Object.values(d1.bhavas).map((bhava: any) => ({
    houseNumber: bhava.houseNumber,
    sign: bhava.sign,
    cuspLongitude: bhava.cuspLongitude ?? bhava.degree ?? 0,
    planets: bhava.planets || [],
  })) as KundaliData['houses']

  return {
    ...(isAstroFactsMetadata(kundaliRoot?.meta?.astroFacts)
      ? {
          meta: {
            astroEngine: kundaliRoot.meta.astroEngine,
            astroFacts: kundaliRoot.meta.astroFacts,
          },
        }
      : {}),
    grahas,
    houses,
    lagna: {
      sign: d1.lagna.sign,
      longitude: d1.lagna.longitude || 0,
    },
    dasha: {
      currentMahadasha: {
        planet: dashaData.currentMahadasha.planet,
        startDate: dateToIso(dashaData.currentMahadasha.startDate),
        endDate: dateToIso(dashaData.currentMahadasha.endDate),
      },
      currentAntardasha: {
        planet: dashaData.currentAntardasha.planet,
        startDate: dateToIso(dashaData.currentAntardasha.startDate),
        endDate: dateToIso(dashaData.currentAntardasha.endDate),
      },
      ...(dashaData.currentPratyantardasha
        ? {
            currentPratyantardasha: {
              planet: dashaData.currentPratyantardasha.planet,
              startDate: dateToIso(dashaData.currentPratyantardasha.startDate),
              endDate: dateToIso(dashaData.currentPratyantardasha.endDate),
            },
          }
        : {}),
    },
    divisionalCharts: {
      d1,
      d9: null,
      d10: null,
    },
  }
}

export function attachKundaliAstroFacts(
  context: AstroContext,
  kundali: KundaliData
): AstroContext {
  return kundali.meta?.astroFacts
    ? {
        ...context,
        astroFacts: kundali.meta.astroFacts,
      }
    : context
}

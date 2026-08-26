'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  formatAstrologyDisplayValue,
  nullableAstrologyDisplay,
} from '@/lib/astrology/display-formatters'

export type KundaliGraha = {
  planet?: unknown
  sign?: unknown
  house?: number
  nakshatra?: unknown
  pada?: number
  longitude?: number
  degreesInSign?: number
  retrograde?: boolean
}

export type KundaliBhava = {
  houseNumber?: number
  sign?: unknown
  planets?: unknown[]
  cuspLongitude?: number
}

type ChartHouse = {
  houseNumber: number
  sign?: string | null
  planets: KundaliGraha[]
}

const HOUSE_LAYOUT = [
  1, 2, 3, 4,
  12, 0, 0, 5,
  11, 0, 0, 6,
  10, 9, 8, 7,
]

function formatDegree(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(1)}°` : null
}

function buildHouses(grahas: Record<string, KundaliGraha>, bhavas: Record<string, KundaliBhava>) {
  const byHouse = new Map<number, ChartHouse>()

  for (let houseNumber = 1; houseNumber <= 12; houseNumber += 1) {
    const bhava = Object.values(bhavas).find((item) => Number(item?.houseNumber) === houseNumber)
    byHouse.set(houseNumber, {
      houseNumber,
      sign: nullableAstrologyDisplay(bhava?.sign) || null,
      planets: [],
    })
  }

  Object.entries(grahas).forEach(([key, graha]) => {
    const houseNumber = Number(graha?.house)
    if (!Number.isFinite(houseNumber) || houseNumber < 1 || houseNumber > 12) return
    const house = byHouse.get(houseNumber)
    if (!house) return
    house.planets.push({
      ...graha,
      planet: formatAstrologyDisplayValue(graha.planet, key),
      sign: nullableAstrologyDisplay(graha.sign) || undefined,
    })
    const sign = nullableAstrologyDisplay(graha.sign)
    if (!house.sign && sign) house.sign = sign
  })

  return byHouse
}

export function KundaliChart2D({
  grahas,
  bhavas,
  lagnaSign,
  stale,
  className,
}: {
  grahas: Record<string, KundaliGraha>
  bhavas: Record<string, KundaliBhava>
  lagnaSign?: string | null
  stale?: boolean
  className?: string
}) {
  const houses = buildHouses(grahas || {}, bhavas || {})
  const hasPlacements = Array.from(houses.values()).some((house) => house.planets.length > 0)

  if (!hasPlacements) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="font-medium text-primary">D1 chart data is unavailable.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate or refresh your Kundali to view planetary placements.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      data-kundali-d1="true"
      className={cn(
        'border-[#d4a24b]/20 !bg-[#071014] shadow-none',
        className
      )}
    >
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-[#f3ead8]">D1 Kundali chart</CardTitle>
            <p className="mt-2 text-sm text-[#969a98]">
              A 12-house view built from your saved D1 planetary placements.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lagnaSign && <Badge variant="premium">Lagna: {lagnaSign}</Badge>}
            {stale && <Badge variant="warning">Outdated chart</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label="D1 Kundali chart showing planets by house"
          className="grid aspect-square w-full grid-cols-4 grid-rows-4 overflow-hidden rounded-2xl border border-[#d4a24b]/24 bg-[#091216] shadow-[inset_0_0_80px_rgba(214,162,75,0.025)]"
        >
          {HOUSE_LAYOUT.map((houseNumber, index) => {
            if (houseNumber === 0) {
              return (
                <div
                  key={`center-${index}`}
                  className={cn(
                    'relative flex items-center justify-center bg-[#0b1519] p-3 text-center',
                    index === 5 && 'border-l border-t border-[#d4a24b]/22',
                    index === 6 && 'border-r border-t border-[#d4a24b]/22',
                    index === 9 && 'border-l border-b border-[#d4a24b]/22',
                    index === 10 && 'border-r border-b border-[#d4a24b]/22'
                  )}
                >
                  {index === 5 ? (
                    <div className="relative z-10">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#dfa84d]/30 bg-[#111b1e] shadow-[0_0_28px_rgba(223,168,77,0.08)]">
                        <p className="font-heading text-xl font-semibold text-[#efc46d]">D1</p>
                      </div>
                      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9e9788]">
                        Birth chart
                      </p>
                    </div>
                  ) : null}
                </div>
              )
            }

            const house = houses.get(houseNumber)
            return (
              <div
                key={houseNumber}
                className="min-h-24 border border-[#d4a24b]/14 bg-[#0d171b] p-2 transition-colors hover:bg-[#111d21] md:p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-[#d8a84e]">H{houseNumber}</span>
                  {house?.sign && (
                    <span className="text-right text-[11px] text-[#aaa393]">
                      {house.sign}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {house?.planets.length ? (
                    house.planets.map((planet) => (
                      <span
                        key={`${houseNumber}-${planet.planet}`}
                        className={cn(
                          'rounded-md border border-[#d4a24b]/24 bg-[#182126] px-1.5 py-1 text-[11px] font-medium text-[#eee5d3]',
                          planet.retrograde &&
                            'border-[#d98d45]/40 bg-[#211812] text-[#efc184]'
                        )}
                        title={[
                          formatAstrologyDisplayValue(planet.sign, ''),
                          formatDegree(planet.degreesInSign),
                          planet.retrograde ? 'retrograde' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      >
                        {formatAstrologyDisplayValue(planet.planet, 'Planet')}
                        {planet.retrograde ? ' Rx' : ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#746f65]">No planets</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="sr-only">
          {Array.from(houses.values()).map((house) => (
            <p key={house.houseNumber}>
              House {house.houseNumber}
              {house.sign ? ` in ${house.sign}` : ''}:{' '}
              {house.planets.length
                ? house.planets.map((planet) => formatAstrologyDisplayValue(planet.planet, 'Planet')).join(', ')
                : 'no planets'}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default KundaliChart2D

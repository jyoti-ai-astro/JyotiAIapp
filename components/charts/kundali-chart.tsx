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
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>D1 Kundali chart</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
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
          className="grid aspect-square w-full max-w-3xl grid-cols-4 grid-rows-4 overflow-hidden rounded-xl border border-border bg-surface-raised"
        >
          {HOUSE_LAYOUT.map((houseNumber, index) => {
            if (houseNumber === 0) {
              return (
                <div
                  key={`center-${index}`}
                  className="flex items-center justify-center border border-border/80 bg-jyoti-gold/10 p-3 text-center"
                >
                  {index === 5 ? (
                    <div>
                      <p className="font-heading text-lg font-semibold text-primary">D1</p>
                      <p className="text-xs text-muted-foreground">Birth chart</p>
                    </div>
                  ) : null}
                </div>
              )
            }

            const house = houses.get(houseNumber)
            return (
              <div
                key={houseNumber}
                className="min-h-24 border border-border/80 bg-card p-2 md:p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-primary">H{houseNumber}</span>
                  {house?.sign && <span className="text-right text-[11px] text-muted-foreground">{house.sign}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {house?.planets.length ? (
                    house.planets.map((planet) => (
                      <span
                        key={`${houseNumber}-${planet.planet}`}
                        className={cn(
                          'rounded-md border border-jyoti-gold/30 bg-jyoti-gold/10 px-1.5 py-1 text-[11px] font-medium text-primary',
                          planet.retrograde && 'border-warning/35 bg-warning/10'
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
                    <span className="text-[11px] text-muted-foreground">No planets</span>
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

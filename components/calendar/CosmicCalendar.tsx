'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type DayStatus = 'good' | 'neutral' | 'challenging'

interface DayData {
  date: string
  status: DayStatus
  tithi: string
  nakshatra: string
  luckScore: number
  event?: string
}

const nakshatras = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
]

function buildDayData(dateStr: string): DayData {
  /*
   * Deterministic preview data.
   *
   * This keeps the current calendar usable without pretending that random
   * values are calculated Panchang data. Replace this adapter with the real
   * calendar API when that backend is connected.
   */
  const seed = dateStr
    .replaceAll('-', '')
    .split('')
    .reduce((sum, value) => sum + Number(value), 0)

  const status: DayStatus =
    seed % 5 === 0 ? 'challenging' : seed % 3 === 0 ? 'good' : 'neutral'

  const lunarDay = (dayjs(dateStr).date() - 1) % 15 + 1
  const paksha = dayjs(dateStr).date() <= 15 ? 'Shukla Paksha' : 'Krishna Paksha'

  return {
    date: dateStr,
    status,
    tithi: `${paksha} ${lunarDay}`,
    nakshatra: nakshatras[seed % nakshatras.length],
    luckScore: 64 + (seed % 29),
    event: seed % 7 === 0 ? 'Notable transit window' : undefined,
  }
}

const statusLabel: Record<DayStatus, string> = {
  good: 'Supportive',
  neutral: 'Balanced',
  challenging: 'Reflective',
}

export const CosmicCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)

  const calendarGrid = useMemo(() => {
    const startOfMonth = currentDate.startOf('month')
    const startDayOfWeek = startOfMonth.day()
    const daysInMonth = currentDate.daysInMonth()
    const grid: Array<string | null> = []

    for (let i = 0; i < startDayOfWeek; i += 1) {
      grid.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      grid.push(currentDate.date(day).format('YYYY-MM-DD'))
    }

    return grid
  }, [currentDate])

  const handlePrevMonth = () => setCurrentDate((date) => date.subtract(1, 'month'))
  const handleNextMonth = () => setCurrentDate((date) => date.add(1, 'month'))

  return (
    <div className="relative space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface-raised px-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          Supportive
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-saffron" />
          Balanced
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger" />
          Reflective
        </span>
        <span className="ml-auto hidden items-center gap-2 sm:inline-flex">
          <CalendarDays className="h-4 w-4 text-saffron" aria-hidden="true" />
          Calendar guidance preview
        </span>
      </div>

      <Card
        size="lg"
        className="overflow-hidden border-border bg-card shadow-[0_16px_44px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-border pb-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron">
              Monthly guidance
            </p>
            <h2 className="mt-1 font-heading text-2xl font-semibold text-primary md:text-3xl">
              {currentDate.format('MMMM YYYY')}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="text-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {calendarGrid.map((dateStr, index) => {
            if (!dateStr) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const data = buildDayData(dateStr)
            const isToday = dateStr === dayjs().format('YYYY-MM-DD')
            const dayNumber = dayjs(dateStr).date()

            return (
              <motion.button
                key={dateStr}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDay(data)}
                aria-label={`${dayjs(dateStr).format('MMMM D')}, ${statusLabel[data.status]} day`}
                className={cn(
                  'relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-lg border transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isToday
                    ? 'border-saffron/60 bg-saffron/10'
                    : 'border-border bg-surface-raised hover:border-saffron/40 hover:bg-secondary/60'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold md:text-base',
                    isToday ? 'text-saffron' : 'text-primary'
                  )}
                >
                  {dayNumber}
                </span>

                <span
                  className={cn(
                    'mt-1.5 h-1.5 w-1.5 rounded-full',
                    data.status === 'good'
                      ? 'bg-success'
                      : data.status === 'neutral'
                        ? 'bg-saffron'
                        : 'bg-danger'
                  )}
                />
              </motion.button>
            )
          })}
        </div>

        <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
          Guidance shown here is a deterministic interface preview until the production Panchang
          calendar service is connected.
        </p>
      </Card>

      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.button
              type="button"
              aria-label="Close day details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 z-50 cursor-default bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="calendar-day-title"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="fixed inset-0 z-50 m-auto h-fit w-full max-w-md p-4"
            >
              <Card
                size="lg"
                className="border-saffron/30 bg-[#091317] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  aria-label="Close"
                  className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="pr-10">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron">
                    Daily guidance
                  </p>
                  <h3
                    id="calendar-day-title"
                    className="mt-2 font-heading text-2xl font-semibold text-primary"
                  >
                    {dayjs(selectedDay.date).format('MMMM D, YYYY')}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {statusLabel[selectedDay.status]} day
                  </p>
                </div>

                <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-raised">
                  <div className="flex items-center justify-between gap-4 p-4">
                    <span className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Moon className="h-4 w-4 text-saffron" />
                      Tithi
                    </span>
                    <span className="text-right text-sm font-medium text-primary">
                      {selectedDay.tithi}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4">
                    <span className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-saffron" />
                      Nakshatra
                    </span>
                    <span className="text-right text-sm font-medium text-primary">
                      {selectedDay.nakshatra}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4">
                    <span className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-saffron" />
                      Guidance score
                    </span>
                    <span className="text-right font-heading text-lg font-semibold text-saffron">
                      {selectedDay.luckScore}/100
                    </span>
                  </div>
                </div>

                {selectedDay.event && (
                  <div className="mt-4 rounded-xl border border-saffron/20 bg-saffron/10 px-4 py-3 text-sm text-primary">
                    {selectedDay.event}
                  </div>
                )}

                <Button
                  variant="outline"
                  fullWidth
                  className="mt-6"
                  onClick={() => setSelectedDay(null)}
                >
                  Close guidance
                </Button>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sparkles, Moon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'

// Types
type DayStatus = 'good' | 'neutral' | 'challenging'

interface DayData {
  date: string
  status: DayStatus
  tithi: string
  nakshatra: string
  luckScore: number
  event?: string
}

export const CosmicCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [calendarData, setCalendarData] = useState<Record<string, DayData>>({})

  // Generate mock data for the current month
  // In production, this would fetch from /api/calendar/month
  useEffect(() => {
    const daysInMonth = currentDate.daysInMonth()
    const newData: Record<string, DayData> = {}

    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentDate.date(i).format('YYYY-MM-DD')
      // Mock logic for status
      const random = Math.random()
      const status: DayStatus = random > 0.7 ? 'good' : random > 0.4 ? 'neutral' : 'challenging'

      newData[date] = {
        date,
        status,
        tithi:
          ['Shukla Paksha', 'Krishna Paksha'][Math.floor(Math.random() * 2)] +
          ' ' +
          (i % 15 + 1),
        nakshatra: ['Rohini', 'Ashwini', 'Bharani', 'Krittika'][Math.floor(Math.random() * 4)],
        luckScore: Math.floor(Math.random() * 40) + 60, // 60-100
        event: i % 5 === 0 ? 'Important Transit' : undefined,
      }
    }
    setCalendarData(newData)
  }, [currentDate])

  const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'))
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, 'month'))

  // Calendar Grid Generation
  const startOfMonth = currentDate.startOf('month')
  const startDayOfWeek = startOfMonth.day() // 0 (Sunday) to 6 (Saturday)
  const daysInMonth = currentDate.daysInMonth()

  const calendarGrid = []
  // Empty slots for previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarGrid.push(null)
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarGrid.push(currentDate.date(i).format('YYYY-MM-DD'))
  }

  return (
    <div className="relative">
      {/* Calendar Card */}
      <Card className="bg-cosmic-indigo/40 backdrop-blur-xl border-white/10 p-6 md:p-8 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="hover:bg-white/10 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-2xl font-display font-bold text-white">
            {currentDate.format('MMMM YYYY')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="hover:bg-white/10 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-white/40 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {calendarGrid.map((dateStr, index) => {
            if (!dateStr) return <div key={`empty-${index}`} className="aspect-square" />

            const data = calendarData[dateStr]
            const isToday = dateStr === dayjs().format('YYYY-MM-DD')
            const dayNumber = dayjs(dateStr).date()

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => data && setSelectedDay(data)}
                className={cn(
                  'aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-colors',
                  isToday
                    ? 'bg-white/10 border-gold/50'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                )}
              >
                <span className={cn('text-lg font-semibold', isToday ? 'text-gold' : 'text-white')}>
                  {dayNumber}
                </span>

                {/* Status Dot */}
                {data && (
                  <div className="mt-2 flex gap-1">
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        data.status === 'good'
                          ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                          : data.status === 'neutral'
                            ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                            : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                      )}
                    />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-sm h-fit p-4"
            >
              <Card className="bg-cosmic-navy border-gold/30 p-6 relative overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.3)]">
                {/* Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/10" />

                <button
                  onClick={() => setSelectedDay(null)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative z-10 space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-display font-bold text-white">
                      {dayjs(selectedDay.date).format('MMMM D, YYYY')}
                    </h3>
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mt-2',
                        selectedDay.status === 'good'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : selectedDay.status === 'neutral'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      )}
                    >
                      {selectedDay.status.toUpperCase()} DAY
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-purple-300" />
                        <span className="text-white/80">Tithi</span>
                      </div>
                      <span className="text-white font-medium">{selectedDay.tithi}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-300" />
                        <span className="text-white/80">Nakshatra</span>
                      </div>
                      <span className="text-white font-medium">{selectedDay.nakshatra}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-gold" />
                        <span className="text-white/80">Luck Score</span>
                      </div>
                      <span className="text-gold font-bold text-lg">{selectedDay.luckScore}/100</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold">
                    View Full Forecast
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}


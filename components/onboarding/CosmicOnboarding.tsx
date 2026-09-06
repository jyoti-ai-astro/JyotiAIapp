'use client'

import React, { useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Moon,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePickerInput } from '@/components/auth/DatePickerInput'
import { LocationAutocomplete } from '@/components/auth/LocationAutocomplete'
import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark'
import { getBirthProfileActivationState } from '@/lib/onboarding/activation'

interface NakshatraObj {
  nakshatra: string
  name?: string
  pada?: string | number
}

export interface CosmicOnboardingProps {
  step: number
  formData: {
    dob: string
    tob: string
    pob: string
    lat?: number
    lng?: number
  }
  setFormData: (data: any) => void
  rashiData: {
    moon: string
    sun: string
    ascendant: string
    nakshatra: string | NakshatraObj
  } | null
  selectedRashi: 'moon' | 'sun' | 'ascendant'
  setSelectedRashi: (rashi: 'moon' | 'sun' | 'ascendant') => void
  onBirthDetailsSubmit: () => void
  onRashiConfirm: () => void
  onRashiBack: () => void
  onComplete: () => void
  loading: boolean
  errorMessage?: string | null
}

const steps = [
  ['Birth details', 'Verified date, time and place'],
  ['Chart preference', 'Choose your primary Rashi lens'],
  ['Create Kundali', 'Build your personal JyotiAI context'],
]

export const CosmicOnboarding: React.FC<CosmicOnboardingProps> = ({
  step,
  formData,
  setFormData,
  rashiData,
  selectedRashi,
  setSelectedRashi,
  onBirthDetailsSubmit,
  onRashiConfirm,
  onRashiBack,
  onComplete,
  loading,
  errorMessage,
}) => {
  const timeInputId = useId()
  const birthActivation = getBirthProfileActivationState(formData)

  const nakshatraDisplay =
    !rashiData
      ? ''
      : typeof rashiData.nakshatra === 'string'
        ? rashiData.nakshatra
        : `${rashiData.nakshatra.name || rashiData.nakshatra.nakshatra || ''}${
            rashiData.nakshatra.pada
              ? ` · Pada ${rashiData.nakshatra.pada}`
              : ''
          }`

  const rashiOptions = rashiData
    ? [
        {
          key: 'moon' as const,
          icon: Moon,
          title: 'Moon Sign',
          subtitle: 'Chandra Rashi · Recommended',
          value: rashiData.moon,
        },
        {
          key: 'sun' as const,
          icon: Sun,
          title: 'Sun Sign',
          subtitle: 'Solar identity',
          value: rashiData.sun,
        },
        {
          key: 'ascendant' as const,
          icon: Star,
          title: 'Ascendant',
          subtitle: 'Lagna · Rising sign',
          value: rashiData.ascendant,
        },
      ]
    : []

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03090d] text-[#fff7e8]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 82% 10%, rgba(226,151,53,.18), transparent 28rem), radial-gradient(circle at 15% 60%, rgba(46,113,111,.13), transparent 28rem), linear-gradient(180deg,#03090d 0%,#07131a 100%)',
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-[36%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-[#d7aa57]/8" />

      <header className="relative z-20 flex h-20 items-center border-b border-[#d7aa57]/14 px-5 md:px-10">
        <div className="mx-auto flex w-full max-w-[1450px] items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <SolarJyotiMark className="h-9 w-9 text-[#f1c979]" />
            <div>
              <div className="font-heading text-xl">JyotiAI</div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-[#b9c2bf]">
                Birth Profile
              </div>
            </div>
          </a>

          <div className="flex items-center gap-2 text-xs text-[#b9c2bf]">
            <ShieldCheck className="h-4 w-4 text-[#f1c979]" />
            Step {step} of 3
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1450px] gap-10 px-5 py-10 lg:grid-cols-[320px_minmax(0,760px)] lg:justify-center lg:px-10 lg:py-16">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[26px] border border-[#d7aa57]/16 bg-[#07131a]/66 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#f1c979]">
              Personal foundation
            </p>

            <h1 className="mt-3 font-heading text-3xl leading-tight">
              Your Kundali begins with precise birth data.
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#b9c2bf]">
              JyotiAI uses your verified birth profile as the foundation for
              Kundali, Guru context, predictions, timeline and reports.
            </p>

            <div className="mt-8 space-y-5">
              {steps.map(([title, subtitle], index) => {
                const stepNumber = index + 1
                const active = stepNumber === step
                const complete = stepNumber < step

                return (
                  <div key={title} className="flex gap-4">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
                        active
                          ? 'border-[#e69a3a] bg-[#e69a3a] text-[#061014]'
                          : complete
                            ? 'border-[#5ea487]/50 bg-[#5ea487]/15 text-[#8dd0b4]'
                            : 'border-white/12 text-[#7f8a86]'
                      }`}
                    >
                      {complete ? <Check className="h-4 w-4" /> : stepNumber}
                    </div>

                    <div>
                      <div
                        className={`text-sm ${
                          active ? 'text-[#fff7e8]' : 'text-[#c3cbc7]'
                        }`}
                      >
                        {title}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-[#7f8a86]">
                        {subtitle}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        <section className="rounded-[30px] border border-[#d7aa57]/18 bg-[#07131a]/84 p-6 shadow-[0_30px_100px_rgba(0,0,0,.36)] backdrop-blur-xl sm:p-9">
          <div className="mb-8 flex gap-2 lg:hidden">
            {[1, 2, 3].map((value) => (
              <div
                key={value}
                className={`h-1 flex-1 rounded-full ${
                  value <= step ? 'bg-[#e69a3a]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-sm text-red-100"
            >
              {errorMessage}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="birth"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#f1c979]">
                    <Sparkles className="h-4 w-4" />
                    Step one
                  </div>
                  <h2 className="mt-3 font-heading text-3xl sm:text-4xl">
                    Tell us where your story began.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#b9c2bf]">
                    Enter the birth details you would give to a professional
                    astrologer. Location coordinates and timezone are resolved
                    automatically after you choose a place.
                  </p>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(event) => {
                    event.preventDefault()

                    if (!birthActivation.canContinue) {
                      return
                    }

                    onBirthDetailsSubmit()
                  }}
                >
                  <DatePickerInput
                    value={formData.dob}
                    onChange={(dob) => setFormData({ ...formData, dob })}
                    required
                    label="Date of Birth"
                  />

                  <div>
                    <label
                      htmlFor={timeInputId}
                      className="mb-2 flex items-center gap-2 text-sm text-[#d9dedb]"
                    >
                      <Clock className="h-4 w-4 text-[#f1c979]" />
                      Time of Birth
                    </label>

                    <Input
                      id={timeInputId}
                      type="time"
                      value={formData.tob}
                      onChange={(event) =>
                        setFormData({ ...formData, tob: event.target.value })
                      }
                      required
                      className="border-[#d7aa57]/25 bg-white/5 text-[#fff7e8]"
                    />

                    <p className="mt-2 text-xs text-[#7f8a86]">
                      Use the most accurate recorded time available.
                    </p>
                  </div>

                  <div>
                    <LocationAutocomplete
                      value={formData.pob}
                      onChange={(pob, coordinates) =>
                        setFormData({
                          ...formData,
                          pob,
                          lat: coordinates?.lat,
                          lng: coordinates?.lng,
                        })
                      }
                      required
                      label="Place of Birth"
                    />

                    <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#7f8a86]">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Start typing your city and choose the correct suggestion.
                      JyotiAI handles coordinates and timezone in the background.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#d7aa57]/14 bg-white/[0.025] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#fff7e8]">
                        Birth profile readiness
                      </p>
                      <span className="shrink-0 text-xs text-[#f1c979]">
                        {birthActivation.completedCount}/{birthActivation.totalCount}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {birthActivation.requirements.map((requirement) => (
                        <div
                          key={requirement.key}
                          className="flex min-h-8 items-center gap-2 text-xs text-[#c7d0cb]"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              requirement.complete
                                ? 'border-[#8dd0b4]/50 bg-[#8dd0b4]/12 text-[#8dd0b4]'
                                : 'border-white/14 bg-white/[0.025] text-[#7f8a86]'
                            }`}
                            aria-hidden="true"
                          >
                            {requirement.complete ? <Check className="h-3 w-3" /> : null}
                          </span>
                          {requirement.label}
                        </div>
                      ))}
                    </div>

                    {!birthActivation.canContinue ? (
                      <p className="mt-3 text-xs leading-5 text-[#b99a67]">
                        Complete the remaining items before continuing.
                      </p>
                    ) : (
                      <p className="mt-3 text-xs leading-5 text-[#8dd0b4]">
                        Ready to calculate your chart.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !birthActivation.canContinue}
                    className="min-h-12 w-full rounded-xl bg-[#e69a3a] font-semibold text-[#061014] hover:bg-[#f0ae55]"
                  >
                    {loading
                      ? 'Preparing your chart...'
                      : birthActivation.canContinue
                        ? 'Continue to chart'
                        : 'Complete birth profile'}
                    {!loading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Button>
                </form>
              </motion.div>
            ) : null}

            {step === 2 && rashiData ? (
              <motion.div
                key="rashi"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="mb-8">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#f1c979]">
                    Your calculated chart
                  </div>
                  <h2 className="mt-3 font-heading text-3xl sm:text-4xl">
                    Choose your primary Rashi lens.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#b9c2bf]">
                    Your full Kundali retains all chart data. This only chooses
                    the primary sign JyotiAI highlights in your experience.
                  </p>
                </div>

                <div className="grid gap-3">
                  {rashiOptions.map((option) => {
                    const Icon = option.icon
                    const active = selectedRashi === option.key

                    return (
                      <button
                        type="button"
                        key={option.key}
                        onClick={() => setSelectedRashi(option.key)}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                          active
                            ? 'border-[#e69a3a]/70 bg-[#e69a3a]/10'
                            : 'border-white/10 bg-white/[0.025] hover:border-[#d7aa57]/30'
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                            active
                              ? 'bg-[#e69a3a]/16 text-[#f1c979]'
                              : 'bg-white/5 text-[#a9b2ae]'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{option.title}</div>
                          <div className="mt-1 text-xs text-[#8d9793]">
                            {option.subtitle}
                          </div>
                        </div>

                        <div className="font-heading text-xl text-[#f1c979]">
                          {option.value || '—'}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-[#d7aa57]/14 bg-white/[0.025] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#8d9793]">
                    Nakshatra
                  </div>
                  <div className="mt-1 text-base text-[#fff7e8]">
                    {nakshatraDisplay || 'Calculated with your chart'}
                  </div>
                </div>

                <div className="mt-7 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRashiBack}
                    className="min-h-12 border-[#d7aa57]/25 bg-transparent text-[#fff7e8]"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={onRashiConfirm}
                    disabled={loading}
                    className="min-h-12 flex-1 bg-[#e69a3a] font-semibold text-[#061014] hover:bg-[#f0ae55]"
                  >
                    {loading ? 'Saving preference...' : 'Confirm & continue'}
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {step === 3 ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 text-center"
              >
                <SolarJyotiMark className="mx-auto h-24 w-24 text-[#f1c979]" />

                <div className="mt-6 text-xs uppercase tracking-[0.2em] text-[#f1c979]">
                  Final step
                </div>

                <h2 className="mx-auto mt-3 max-w-xl font-heading text-3xl sm:text-4xl">
                  Build the Kundali that powers JyotiAI.
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#b9c2bf]">
                  JyotiAI will now generate your canonical birth chart and
                  connect it to your dashboard, Guru, predictions, timeline and
                  future reports.
                </p>

                <div className="mx-auto mt-7 grid max-w-lg gap-3 text-left text-sm text-[#d6dcd8] sm:grid-cols-2">
                  {[
                    'Canonical Kundali',
                    'Personal Guru context',
                    'Prediction foundation',
                    'Saved account profile',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3"
                    >
                      <Check className="h-4 w-4 text-[#8dd0b4]" />
                      {item}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={onComplete}
                  disabled={loading}
                  className="mt-8 min-h-12 w-full bg-[#e69a3a] font-semibold text-[#061014] hover:bg-[#f0ae55]"
                >
                  {loading ? 'Building your Kundali...' : 'Create my JyotiAI profile'}
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}

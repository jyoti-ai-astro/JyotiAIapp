'use client'

import React, {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { CheckCircle2, Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LocationSuggestion {
  placeId: string
  formattedAddress: string
  primaryText?: string
  secondaryText?: string
}

interface VerifiedLocation {
  placeId: string
  formattedAddress: string
  lat: number
  lng: number
  city?: string
  state?: string
  country?: string
  countryCode?: string
}

interface LocationAutocompleteProps {
  value: string
  onChange: (
    value: string,
    coordinates?: { lat: number; lng: number },
    location?: VerifiedLocation
  ) => void
  required?: boolean
  className?: string
  label?: string
}

export const LocationAutocomplete: React.FC<
  LocationAutocompleteProps
> = ({
  value,
  onChange,
  required = false,
  className = '',
  label = 'Place of Birth',
}) => {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<
    LocationSuggestion[]
  >([])
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] =
    useState<VerifiedLocation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const reactId = useId()
  const inputId = `${reactId}-location`

  useEffect(() => {
    if (value !== query) {
      setQuery(value)

      if (
        selectedLocation &&
        value !== selectedLocation.formattedAddress
      ) {
        setSelectedLocation(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const fetchSuggestions = async (searchQuery: string) => {
    const trimmed = searchQuery.trim()

    if (trimmed.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/location/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query: trimmed,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.error || 'Location search is temporarily unavailable.'
        )
      }

      const results = Array.isArray(data.results)
        ? data.results
        : []

      setSuggestions(results)
      setShowSuggestions(results.length > 0)

      if (results.length === 0) {
        setError(
          'No matching location found. Try a nearby city or include state/country.'
        )
      }
    } catch (err: any) {
      console.error('Location search error:', err)
      setSuggestions([])
      setShowSuggestions(false)
      setError(
        err?.message || 'Location search is temporarily unavailable.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (
      selectedLocation &&
      query === selectedLocation.formattedAddress
    ) {
      return
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handleSelect = async (
    suggestion: LocationSuggestion
  ) => {
    setResolving(true)
    setError(null)

    try {
      const response = await fetch('/api/location/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          placeId: suggestion.placeId,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.result) {
        throw new Error(
          data.error || 'Could not verify the selected location.'
        )
      }

      const location = data.result as VerifiedLocation

      setSelectedLocation(location)
      setQuery(location.formattedAddress)
      setSuggestions([])
      setShowSuggestions(false)

      onChange(
        location.formattedAddress,
        {
          lat: location.lat,
          lng: location.lng,
        },
        location
      )
    } catch (err: any) {
      console.error('Location resolve error:', err)

      setSelectedLocation(null)
      setError(
        err?.message || 'Could not verify the selected location.'
      )

      onChange(query)
    } finally {
      setResolving(false)
    }
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value

    setQuery(newValue)
    setSelectedLocation(null)
    setError(null)

    onChange(newValue)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(
          event.target as Node
        ) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
  }, [])

  return (
    <div className={`relative ${className}`}>
      <Label
        className="mb-2 flex items-center gap-2 text-white/80"
        htmlFor={inputId}
      >
        <MapPin className="h-4 w-4" />
        {label}
        {required ? (
          <span className="text-red-400">*</span>
        ) : null}
      </Label>

      <div className="relative">
        <Input
          id={inputId}
          name="place-of-birth"
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder="Start typing city name (e.g., Sasaram, Bihar, India)"
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold"
        />

        {(loading || resolving) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-white/60" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 ? (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#d7aa57]/20 bg-[#07131a] shadow-2xl"
        >
          {suggestions.map((location) => (
            <button
              key={location.placeId}
              type="button"
              onClick={() => handleSelect(location)}
              className="w-full border-b border-white/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/5"
            >
              <div className="font-medium text-white">
                {location.primaryText ||
                  location.formattedAddress}
              </div>

              {location.secondaryText ? (
                <div className="mt-1 text-sm text-white/55">
                  {location.secondaryText}
                </div>
              ) : null}
            </button>
          ))}

          <div className="px-4 py-2 text-right text-[10px] uppercase tracking-[0.14em] text-white/35">
            Powered by Google
          </div>
        </div>
      ) : null}

      {selectedLocation ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-[#8dd0b4]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Location verified
          {selectedLocation.city ? (
            <span className="text-white/45">
              · {selectedLocation.city}
              {selectedLocation.state
                ? `, ${selectedLocation.state}`
                : ''}
            </span>
          ) : null}
        </div>
      ) : query.trim().length > 1 ? (
        <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#b99a67]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Select a location from the Google suggestions before continuing.
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 text-xs leading-5 text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  )
}

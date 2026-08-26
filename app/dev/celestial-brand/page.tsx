import type { Metadata } from 'next'

import { CelestialBrandPrototype } from './CelestialBrandPrototype'

export const metadata: Metadata = {
  title: 'Celestial Brand Prototype | JyotiAI',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CelestialBrandPage() {
  return <CelestialBrandPrototype />
}

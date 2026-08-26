import type { Metadata } from 'next'

import { CelestialV3Client } from './dev/visual-v3/CelestialV3Client'

export const metadata: Metadata = {
  title: 'JyotiAI — Your Celestial Intelligence',
  description:
    'Explore your Kundali, planetary timing, Jyoti Guru, predictions, timelines and deeper Vedic guidance through JyotiAI.',
}

export default function HomePage() {
  return <CelestialV3Client />
}

import type { Metadata } from 'next'
import { CelestialV3Client } from './CelestialV3Client'

export const metadata: Metadata = {
  title: 'JyotiAI — Celestial OS',
  description: 'JyotiAI Visual V3 cinematic celestial experience prototype.',
}

export default function VisualV3Page() {
  return <CelestialV3Client />
}

import type { Metadata } from 'next'
import { SupportPageClient } from './support-page-client'

export const metadata: Metadata = {
  title: 'Support | JyotiAI',
  description: 'Get help with your JyotiAI account, access, reports, and product experience.',
}

export default function SupportPage() {
  return <SupportPageClient />
}

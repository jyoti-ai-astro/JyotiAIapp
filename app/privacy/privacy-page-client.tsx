'use client'

import { redirect } from 'next/navigation'

export function PrivacyPageClient() {
  redirect('/legal/privacy')
}

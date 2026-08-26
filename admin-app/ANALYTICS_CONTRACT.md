# JyotiAI Mission Control — First-Party Analytics Contract

## Objective
Create one canonical event stream that lets Mission Control answer: where did a visitor come from, what did they do, when did they register, which product did they use or buy, which verified payment/subscription resulted, and which campaign/source/device/page should receive attribution.

Third-party platforms (GA4, Google Ads, Meta, email providers) are enrichment/activation systems. JyotiAI's verified payment/subscription records remain the economic source of truth.

## Identity and attribution fields
Every eligible event should carry, when available:
- eventId (UUID; idempotent)
- eventName
- occurredAt (server timestamp preferred)
- anonymousId
- sessionId
- userUid after authentication
- landingPath
- currentPath
- referrer
- utmSource / utmMedium / utmCampaign / utmContent / utmTerm
- gclid / wbraid / gbraid when present
- fbclid when present
- deviceClass / browser / os
- country / region only when derived lawfully and needed
- appEnvironment
- release/version

Persist first-touch and latest-touch attribution onto the user acquisition profile when identity becomes known. Do not overwrite first-touch.

## Core funnel events
- session_started
- landing_viewed
- signup_started
- signup_completed
- login_completed
- pricing_viewed
- checkout_started
- payment_created
- payment_verified
- payment_failed
- refund_verified
- subscription_created
- subscription_activated
- subscription_renewed
- subscription_cancelled
- subscription_expired

## Product events
- kundali_started
- kundali_generated
- report_viewed
- report_purchase_started
- report_generated
- guru_session_started
- guru_message_sent
- prediction_purchase_started
- prediction_generated
- compatibility_generated
- face_reading_started
- palmistry_started
- aura_scan_started
- numerology_generated

Only emit events for real product actions. Never manufacture purchase/success events client-side; financial success events must originate from canonical verified server state.

## Recommended Firestore/warehouse shape
analytics_events/{eventId}
- immutable append-style event document
- retention policy appropriate to privacy/analytics requirements

user_acquisition/{uid}
- firstTouch
- latestTouch
- signupAt
- firstPaidAt
- firstProduct
- acquisitionChannel

Optional later: export event stream to BigQuery for high-volume cohort/funnel analysis instead of running large analytical scans against Firestore.

## Privacy boundaries
Do not send birth date/time/place, Kundali chart data, Guru message text, report bodies, private profile text, payment secrets, card data, Razorpay signatures, Firebase tokens, admin session tokens, or raw sensitive content into ad/analytics platforms.

Use consent-aware activation for advertising/analytics where required. Keep first-party operational logs distinct from marketing tracking.

## External integrations
GA4: acquisition/funnel/engagement enrichment.
Google Ads: spend/campaign/ad-group metrics and conversion activation.
Meta Ads: spend/campaign/ad-set/ad metrics and server-side conversion activation.
Search Console: query/page organic performance.
Email/CRM: delivery/click/unsubscribe lifecycle plus canonical downstream conversion attribution.

## Mission Control dimensions/filters
Date range; new vs returning user; first-touch source/medium/campaign; latest-touch source/medium/campaign; organic/paid/direct/referral/email; country/region; device; landing page; signup cohort; paid/unpaid; plan; product; payment status; subscription status; report type; ticket type; Guru activity; lifetime value; first purchase date; last activity date.

## Launch priority
1. Capture first-party UTM/referrer/session identity and signup attribution.
2. Join verified payments/subscriptions to attribution.
3. Add product funnel events.
4. Connect GA4 + Search Console.
5. Connect Google Ads + Meta with server-side verified conversions.
6. Add BigQuery when event volume/analysis complexity justifies it.

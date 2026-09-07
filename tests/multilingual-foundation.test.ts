/**
 * JyotiAI Multilingual Foundation Test Suite
 * 
 * Verifies:
 * 1. BCP-47 locale registry, normalization, wave classification, and fallbacks
 * 2. Locale-aware number, currency (₹), and date formatters
 * 3. Server-side locale resolution (query params, cookies, headers)
 * 4. Unicode script detection across Indic and Latin scripts
 * 5. Language, script, and code-mixing detection (English, Hindi, Hinglish)
 * 6. Vedic astrology glossary lookup and entity recognition
 * 7. Language Gateway processor and MultilingualTurn envelope generation
 * 8. Message catalog structural parity across Wave 1 locales
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALE_REGISTRY,
  WAVE_1_LOCALES,
  WAVE_2_LOCALES,
  WAVE_3_LOCALES,
  ALL_SUPPORTED_LOCALES,
  isSupportedLocale,
  isWave1Locale,
  normalizeLocale,
  getAvailableLocales,
} from '../i18n/config'

import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../i18n/format'

import { resolveServerLocale } from '../i18n/request'

import {
  detectScript,
  detectLanguage,
  isCodeMixedHinglish,
} from '../lib/language/detect'

import {
  ASTROLOGY_GLOSSARY,
  getGlossaryEntry,
  getAllGlossaryEntries,
  findAstrologyTerms,
} from '../lib/language/glossary'

import { processLanguageGatewayTurn } from '../lib/language/gateway'

function testLocaleRegistryAndNormalization() {
  console.log('Testing locale registry and normalization...')

  // Defaults and waves
  assert.equal(DEFAULT_LOCALE, 'en-IN')
  assert.equal(FALLBACK_LOCALE, 'en-IN')
  assert.deepEqual(Array.from(WAVE_1_LOCALES), ['en-IN', 'hi-IN', 'hi-Latn'])
  assert.equal(ALL_SUPPORTED_LOCALES.length, 17)

  // Wave 1 check
  assert.equal(isWave1Locale('en-IN'), true)
  assert.equal(isWave1Locale('hi-IN'), true)
  assert.equal(isWave1Locale('hi-Latn'), true)
  assert.equal(isWave1Locale('bn-IN'), false)

  // Supported check
  assert.equal(isSupportedLocale('en-IN'), true)
  assert.equal(isSupportedLocale('sa-IN'), true)
  assert.equal(isSupportedLocale('fr-FR'), false)

  // Available locales
  const available = getAvailableLocales()
  assert.equal(available.length, 3)
  assert.equal(available.every((l) => l.isAvailable), true)

  // Normalization
  assert.equal(normalizeLocale(null), 'en-IN')
  assert.equal(normalizeLocale(undefined), 'en-IN')
  assert.equal(normalizeLocale(''), 'en-IN')
  assert.equal(normalizeLocale('en'), 'en-IN')
  assert.equal(normalizeLocale('en-US'), 'en-IN')
  assert.equal(normalizeLocale('english'), 'en-IN')
  assert.equal(normalizeLocale('hi'), 'hi-IN')
  assert.equal(normalizeLocale('hi_in'), 'hi-IN')
  assert.equal(normalizeLocale('hindi'), 'hi-IN')
  assert.equal(normalizeLocale('hinglish'), 'hi-Latn')
  assert.equal(normalizeLocale('hi-latn'), 'hi-Latn')
  assert.equal(normalizeLocale('hi-en'), 'hi-Latn')
  assert.equal(normalizeLocale('bengali'), 'bn-IN')
  assert.equal(normalizeLocale('sanskrit'), 'sa-IN')
  assert.equal(normalizeLocale('unknown-foo'), 'en-IN')
}

function testFormatters() {
  console.log('Testing locale-aware formatters...')

  // Number formatting
  const numStr = formatNumber(100000, 'en-IN')
  assert.ok(numStr.includes('1,00,000') || numStr.includes('100,000'))

  // Currency formatting
  const currEn = formatCurrency(499, 'en-IN')
  assert.ok(currEn.includes('499'))
  assert.ok(currEn.includes('₹') || currEn.includes('INR'))

  const currHi = formatCurrency(1499, 'hi-IN')
  assert.ok(currHi.includes('₹') || currHi.includes('INR'))

  // Date formatting
  const testDate = new Date(2026, 8, 7) // Sept 7, 2026
  const dateStr = formatDate(testDate, 'en-IN')
  assert.ok(dateStr.includes('2026'))
  assert.ok(dateStr.includes('Sep') || dateStr.includes('September') || dateStr.includes('7'))

  // DateTime formatting
  const dtStr = formatDateTime(testDate, 'en-IN')
  assert.ok(dtStr.includes('2026'))
}

function testServerLocaleResolution() {
  console.log('Testing server-side locale resolution...')

  // Fallback
  assert.equal(resolveServerLocale(), 'en-IN')
  assert.equal(resolveServerLocale({}), 'en-IN')

  // Explicit preference
  assert.equal(resolveServerLocale({ userPreferredLocale: 'hi-IN' }), 'hi-IN')
  assert.equal(resolveServerLocale({ userPreferredLocale: 'hinglish' }), 'hi-Latn')

  // Query parameter
  assert.equal(resolveServerLocale({ query: { lang: 'hi-IN' } }), 'hi-IN')
  assert.equal(resolveServerLocale({ query: { locale: 'hinglish' } }), 'hi-Latn')
  assert.equal(
    resolveServerLocale({ query: new URLSearchParams('locale=hi-IN') }),
    'hi-IN'
  )

  // Cookies
  assert.equal(resolveServerLocale({ cookies: { jyoti_locale: 'hi-IN' } }), 'hi-IN')
  assert.equal(resolveServerLocale({ cookies: { NEXT_LOCALE: 'hi-Latn' } }), 'hi-Latn')
  assert.equal(
    resolveServerLocale({
      cookies: {
        get: (name: string) => (name === 'NEXT_LOCALE' ? { value: 'hi-IN' } : undefined),
      },
    }),
    'hi-IN'
  )

  // Accept-Language header
  assert.equal(
    resolveServerLocale({
      headers: { 'accept-language': 'hi-IN,hi;q=0.9,en;q=0.8' },
    }),
    'hi-IN'
  )
  assert.equal(
    resolveServerLocale({
      headers: { 'accept-language': 'en-GB,en;q=0.9' },
    }),
    'en-IN'
  )
}

function testScriptDetection() {
  console.log('Testing script detection...')

  assert.equal(detectScript(''), 'latin')
  assert.equal(detectScript('Hello World'), 'latin')
  assert.equal(detectScript('नमस्ते दुनिया'), 'devanagari')
  assert.equal(detectScript('আমার নাম জ্যোতি'), 'bengali')
  assert.equal(detectScript('வணக்கம் உலகம்'), 'tamil')
  assert.equal(detectScript('నమస్కారం ప్రపంచం'), 'telugu')
  assert.equal(detectScript('નમસ્તે'), 'gujarati')
}

function testLanguageDetectionAndCodeMixing() {
  console.log('Testing language and code-mix detection...')

  // Pure English
  const resEn = detectLanguage('What is the effect of Jupiter in the 10th house?')
  assert.equal(resEn.primaryLocale, 'en-IN')
  assert.equal(resEn.script, 'latin')
  assert.equal(resEn.isCodeMixed, false)
  assert.equal(isCodeMixedHinglish('What is the effect of Jupiter?'), false)

  // Pure Hindi (Devanagari)
  const resHi = detectLanguage('मेरी कुण्डली में गुरु की स्थिति कैसी है?')
  assert.equal(resHi.primaryLocale, 'hi-IN')
  assert.equal(resHi.script, 'devanagari')
  assert.equal(resHi.isCodeMixed, false)

  // Hinglish / Romanized Hindi
  const resHinglish1 = detectLanguage('mera kundali batao kaisa hai')
  assert.equal(resHinglish1.primaryLocale, 'hi-Latn')
  assert.equal(resHinglish1.script, 'latin')

  const resHinglish2 = detectLanguage('shani ki sade sati kab khatam hogi mera career kaisa rahega')
  assert.equal(resHinglish2.primaryLocale, 'hi-Latn')
  assert.equal(resHinglish2.script, 'latin')
  assert.equal(isCodeMixedHinglish('shani ki sade sati kab hogi'), true)
}

function testAstrologyGlossary() {
  console.log('Testing Vedic astrology glossary...')

  assert.ok(ASTROLOGY_GLOSSARY.length >= 25)
  assert.equal(getAllGlossaryEntries().length, ASTROLOGY_GLOSSARY.length)

  const surya = getGlossaryEntry('surya')
  assert.ok(surya)
  assert.equal(surya?.canonicalEnglish, 'Sun')
  assert.equal(surya?.devanagari, 'सूर्य')
  assert.equal(surya?.doNotTranslate, true)
  assert.equal(surya?.category, 'graha')

  const sadeSati = getGlossaryEntry('sade_sati')
  assert.ok(sadeSati)
  assert.equal(sadeSati?.category, 'dosha_yoga')
  assert.equal(sadeSati?.doNotTranslate, true)

  // Entity recognition in Romanized text
  const terms1 = findAstrologyTerms('kya meri kundli me manglik dosha aur shani sade sati hai?')
  assert.ok(terms1.some((t) => t.canonicalKey === 'kundali'))
  assert.ok(terms1.some((t) => t.canonicalKey === 'manglik_dosha'))
  assert.ok(terms1.some((t) => t.canonicalKey === 'sade_sati'))
  assert.ok(terms1.some((t) => t.canonicalKey === 'shani'))

  // Entity recognition in Devanagari text
  const terms2 = findAstrologyTerms('मेरी कुंडली में शनि साढ़े साती का क्या प्रभाव होगा?')
  assert.ok(terms2.some((t) => t.canonicalKey === 'sade_sati'))
  assert.ok(terms2.some((t) => t.canonicalKey === 'shani'))

  // Non-matching text
  const termsEmpty = findAstrologyTerms('what is the weather in Delhi tomorrow?')
  assert.equal(termsEmpty.length, 0)
}

function testLanguageGatewayTurn() {
  console.log('Testing Language Gateway turn processor...')

  // 1. Hinglish Turn
  const hinglishTurn = processLanguageGatewayTurn({
    text: 'guru ji mera mangal dosha check karke batao',
  })

  assert.equal(hinglishTurn.turn.primaryLocale, 'hi-Latn')
  assert.equal(hinglishTurn.turn.responseLocale, 'hi-Latn')
  assert.equal(hinglishTurn.turn.responseScriptPreference, 'latin')
  assert.ok(hinglishTurn.turn.astrologyEntities)
  assert.ok(hinglishTurn.turn.astrologyEntities.some((e) => e.canonicalKey === 'manglik_dosha'))
  assert.ok(hinglishTurn.systemPromptInstructions?.includes('Hinglish'))
  assert.ok(hinglishTurn.systemPromptInstructions?.includes('mangal dosha'))

  // 2. English Turn with preference override
  const englishTurn = processLanguageGatewayTurn({
    text: 'Tell me about my Saturn transit',
    userPreferredLocale: 'en-IN',
    responseStyle: 'spiritual',
  })

  assert.equal(englishTurn.turn.responseLocale, 'en-IN')
  assert.equal(englishTurn.turn.responseScriptPreference, 'latin')
  assert.ok(englishTurn.systemPromptInstructions?.includes('English'))
  assert.ok(englishTurn.systemPromptInstructions?.includes('spiritual'))

  // 3. Devanagari Hindi Turn
  const hindiTurn = processLanguageGatewayTurn({
    text: 'मेरी जन्म कुण्डली में बृहस्पति की क्या स्थिति है?',
  })

  assert.equal(hindiTurn.turn.primaryLocale, 'hi-IN')
  assert.equal(hindiTurn.turn.responseLocale, 'hi-IN')
  assert.equal(hindiTurn.turn.responseScriptPreference, 'devanagari')
  assert.ok(hindiTurn.systemPromptInstructions?.includes('Devanagari'))
}

function testMessageCatalogsParity() {
  console.log('Testing message catalogs parity...')

  const enRaw = readFileSync(resolve(__dirname, '../messages/en-IN.json'), 'utf-8')
  const hiRaw = readFileSync(resolve(__dirname, '../messages/hi-IN.json'), 'utf-8')
  const latnRaw = readFileSync(resolve(__dirname, '../messages/hi-Latn.json'), 'utf-8')

  const en = JSON.parse(enRaw)
  const hi = JSON.parse(hiRaw)
  const latn = JSON.parse(latnRaw)

  const enKeys = Object.keys(en).sort()
  const hiKeys = Object.keys(hi).sort()
  const latnKeys = Object.keys(latn).sort()

  assert.deepEqual(enKeys, hiKeys)
  assert.deepEqual(enKeys, latnKeys)

  // Verify essential sections exist
  const expectedSections = ['common', 'nav', 'guru', 'kundali', 'predictions', 'pricing', 'errors']
  for (const sec of expectedSections) {
    assert.ok(enKeys.includes(sec), `Section ${sec} missing in en-IN`)
    assert.ok(hiKeys.includes(sec), `Section ${sec} missing in hi-IN`)
    assert.ok(latnKeys.includes(sec), `Section ${sec} missing in hi-Latn`)
  }

  // Check subkeys match for common and nav
  assert.deepEqual(Object.keys(en.common).sort(), Object.keys(hi.common).sort())
  assert.deepEqual(Object.keys(en.common).sort(), Object.keys(latn.common).sort())
  assert.deepEqual(Object.keys(en.nav).sort(), Object.keys(hi.nav).sort())
  assert.deepEqual(Object.keys(en.nav).sort(), Object.keys(latn.nav).sort())
}

async function runAllTests() {
  console.log('========================================')
  console.log('Running JyotiAI Multilingual Foundation Tests')
  console.log('========================================')

  testLocaleRegistryAndNormalization()
  testFormatters()
  testServerLocaleResolution()
  testScriptDetection()
  testLanguageDetectionAndCodeMixing()
  testAstrologyGlossary()
  testLanguageGatewayTurn()
  testMessageCatalogsParity()

  console.log('========================================')
  console.log('✅ ALL MULTILINGUAL FOUNDATION TESTS PASSED')
  console.log('========================================')
}

runAllTests().catch((err) => {
  console.error('❌ Multilingual Foundation Tests FAILED:', err)
  process.exit(1)
})

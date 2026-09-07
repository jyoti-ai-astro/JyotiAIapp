/**
 * Vedic Astrology Glossary & Entity Recognition Engine
 * 
 * Curates canonical Jyotish terminology across Grahas, Rashis, Nakshatras,
 * Dashas, Bhavas, Doshas/Yogas, and Muhurtas.
 * 
 * Preserves sacred astrological terms from destructive machine translation
 * (e.g. ensures "Sade Sati" is never translated to "seven and a half",
 * and "Manglik Dosha" maintains its sacred domain context).
 */

import type {
  AstrologyGlossaryCategory,
  AstrologyGlossaryEntry,
  RecognizedAstrologyTerm,
} from './types'

export const ASTROLOGY_GLOSSARY: readonly AstrologyGlossaryEntry[] = [
  // --- GRAHAS (Planets) ---
  {
    key: 'surya',
    canonicalEnglish: 'Sun',
    devanagari: 'सूर्य',
    iast: 'Sūrya',
    commonVariants: ['surya', 'soorya', 'suraj', 'ravi', 'bhanu', 'ark'],
    category: 'graha',
    meaning: 'The soul, self-realization, vitality, father, authority, royal planet.',
    doNotTranslate: true,
  },
  {
    key: 'chandra',
    canonicalEnglish: 'Moon',
    devanagari: 'चन्द्र',
    iast: 'Candra',
    commonVariants: ['chandra', 'chandrama', 'chandr', 'chanda', 'soma'],
    category: 'graha',
    meaning: 'Mind, emotions, mother, peace of mind, consciousness, intuition.',
    doNotTranslate: true,
  },
  {
    key: 'mangal',
    canonicalEnglish: 'Mars',
    devanagari: 'मंगल',
    iast: 'Maṅgala',
    commonVariants: ['mangal', 'kuja', 'angarak', 'bhauma', 'chevvai'],
    category: 'graha',
    meaning: 'Energy, courage, younger siblings, physical strength, property.',
    doNotTranslate: true,
  },
  {
    key: 'budha',
    canonicalEnglish: 'Mercury',
    devanagari: 'बुध',
    iast: 'Budha',
    commonVariants: ['budha', 'budh', 'soumya'],
    category: 'graha',
    meaning: 'Intellect, speech, analytical capability, commerce, communication.',
    doNotTranslate: true,
  },
  {
    key: 'guru',
    canonicalEnglish: 'Jupiter',
    devanagari: 'गुरु',
    iast: 'Guru',
    commonVariants: ['guru', 'brihaspati', 'brahaspati', 'devaguru'],
    category: 'graha',
    meaning: 'Wisdom, spirituality, progeny, mentor, fortune, dharma.',
    doNotTranslate: true,
  },
  {
    key: 'shukra',
    canonicalEnglish: 'Venus',
    devanagari: 'शुक्र',
    iast: 'Śukra',
    commonVariants: ['shukra', 'shukracharya', 'bhrigu', 'sukra'],
    category: 'graha',
    meaning: 'Love, beauty, creative arts, luxuries, vehicles, marital harmony.',
    doNotTranslate: true,
  },
  {
    key: 'shani',
    canonicalEnglish: 'Saturn',
    devanagari: 'शनि',
    iast: 'Śani',
    commonVariants: ['shani', 'sani', 'shanaishchara', 'mand', 'manda'],
    category: 'graha',
    meaning: 'Discipline, karma, perseverance, longevity, delays, justice.',
    doNotTranslate: true,
  },
  {
    key: 'rahu',
    canonicalEnglish: 'Rahu (North Lunar Node)',
    devanagari: 'राहु',
    iast: 'Rāhu',
    commonVariants: ['rahu', 'swarbhanu', 'chhaya grah'],
    category: 'graha',
    meaning: 'Ambition, illusion, worldly desires, foreign travel, obsessive drive.',
    doNotTranslate: true,
  },
  {
    key: 'ketu',
    canonicalEnglish: 'Ketu (South Lunar Node)',
    devanagari: 'केतु',
    iast: 'Ketu',
    commonVariants: ['ketu', 'dhwaja', 'mokshakaraka'],
    category: 'graha',
    meaning: 'Liberation (Moksha), detachment, spiritual insight, intuition.',
    doNotTranslate: true,
  },

  // --- RASHIS (Zodiac Signs) ---
  {
    key: 'mesha',
    canonicalEnglish: 'Aries',
    devanagari: 'मेष',
    iast: 'Meṣa',
    commonVariants: ['mesha', 'mesh'],
    category: 'rashi',
    meaning: 'First zodiac sign, fire element, ruled by Mars.',
    doNotTranslate: true,
  },
  {
    key: 'vrishabha',
    canonicalEnglish: 'Taurus',
    devanagari: 'वृषभ',
    iast: 'Vṛṣabha',
    commonVariants: ['vrishabha', 'vrishabh', 'vrushabh', 'vrish'],
    category: 'rashi',
    meaning: 'Second zodiac sign, earth element, ruled by Venus.',
    doNotTranslate: true,
  },
  {
    key: 'mithuna',
    canonicalEnglish: 'Gemini',
    devanagari: 'मिथुन',
    iast: 'Mithuna',
    commonVariants: ['mithuna', 'mithun'],
    category: 'rashi',
    meaning: 'Third zodiac sign, air element, ruled by Mercury.',
    doNotTranslate: true,
  },
  {
    key: 'karka',
    canonicalEnglish: 'Cancer',
    devanagari: 'कर्क',
    iast: 'Karka',
    commonVariants: ['karka', 'kark', 'karkat'],
    category: 'rashi',
    meaning: 'Fourth zodiac sign, water element, ruled by Moon.',
    doNotTranslate: true,
  },
  {
    key: 'simha',
    canonicalEnglish: 'Leo',
    devanagari: 'सिंह',
    iast: 'Siṃha',
    commonVariants: ['simha', 'singh', 'sinh'],
    category: 'rashi',
    meaning: 'Fifth zodiac sign, fire element, ruled by Sun.',
    doNotTranslate: true,
  },
  {
    key: 'kanya',
    canonicalEnglish: 'Virgo',
    devanagari: 'कन्या',
    iast: 'Kanyā',
    commonVariants: ['kanya'],
    category: 'rashi',
    meaning: 'Sixth zodiac sign, earth element, ruled by Mercury.',
    doNotTranslate: true,
  },
  {
    key: 'tula',
    canonicalEnglish: 'Libra',
    devanagari: 'तुला',
    iast: 'Tulā',
    commonVariants: ['tula'],
    category: 'rashi',
    meaning: 'Seventh zodiac sign, air element, ruled by Venus.',
    doNotTranslate: true,
  },
  {
    key: 'vrishchika',
    canonicalEnglish: 'Scorpio',
    devanagari: 'वृश्चिक',
    iast: 'Vṛścika',
    commonVariants: ['vrishchika', 'vrishchik', 'vrushchik'],
    category: 'rashi',
    meaning: 'Eighth zodiac sign, water element, ruled by Mars.',
    doNotTranslate: true,
  },
  {
    key: 'dhanu',
    canonicalEnglish: 'Sagittarius',
    devanagari: 'धनु',
    iast: 'Dhanu',
    commonVariants: ['dhanu', 'dhanus'],
    category: 'rashi',
    meaning: 'Ninth zodiac sign, fire element, ruled by Jupiter.',
    doNotTranslate: true,
  },
  {
    key: 'makara',
    canonicalEnglish: 'Capricorn',
    devanagari: 'मकर',
    iast: 'Makara',
    commonVariants: ['makara', 'makar'],
    category: 'rashi',
    meaning: 'Tenth zodiac sign, earth element, ruled by Saturn.',
    doNotTranslate: true,
  },
  {
    key: 'kumbha',
    canonicalEnglish: 'Aquarius',
    devanagari: 'कुम्भ',
    iast: 'Kumbha',
    commonVariants: ['kumbha', 'kumbh'],
    category: 'rashi',
    meaning: 'Eleventh zodiac sign, air element, ruled by Saturn.',
    doNotTranslate: true,
  },
  {
    key: 'meena',
    canonicalEnglish: 'Pisces',
    devanagari: 'मीन',
    iast: 'Mīna',
    commonVariants: ['meena', 'meen'],
    category: 'rashi',
    meaning: 'Twelfth zodiac sign, water element, ruled by Jupiter.',
    doNotTranslate: true,
  },

  // --- NAKSHATRAS (Lunar Mansions) ---
  {
    key: 'ashwini',
    canonicalEnglish: 'Ashwini',
    devanagari: 'अश्विनी',
    iast: 'Aśvinī',
    commonVariants: ['ashwini', 'aswini'],
    category: 'nakshatra',
    meaning: 'First nakshatra, 0° - 13°20\' Aries, deity Ashvini Kumaras, ruled by Ketu.',
    doNotTranslate: true,
  },
  {
    key: 'bharani',
    canonicalEnglish: 'Bharani',
    devanagari: 'भरणी',
    iast: 'Bharaṇī',
    commonVariants: ['bharani'],
    category: 'nakshatra',
    meaning: 'Second nakshatra, 13°20\' - 26°40\' Aries, deity Yama, ruled by Venus.',
    doNotTranslate: true,
  },
  {
    key: 'krittika',
    canonicalEnglish: 'Krittika',
    devanagari: 'कृत्तिका',
    iast: 'Kṛttikā',
    commonVariants: ['krittika', 'kritika'],
    category: 'nakshatra',
    meaning: 'Third nakshatra, deity Agni, ruled by Sun.',
    doNotTranslate: true,
  },
  {
    key: 'rohini',
    canonicalEnglish: 'Rohini',
    devanagari: 'रोहिणी',
    iast: 'Rohiṇī',
    commonVariants: ['rohini'],
    category: 'nakshatra',
    meaning: 'Fourth nakshatra, deity Brahma/Prajapati, ruled by Moon.',
    doNotTranslate: true,
  },
  {
    key: 'mrigashira',
    canonicalEnglish: 'Mrigashira',
    devanagari: 'मृगशिरा',
    iast: 'Mṛgaśirā',
    commonVariants: ['mrigashira', 'mrigasira'],
    category: 'nakshatra',
    meaning: 'Fifth nakshatra, deity Soma, ruled by Mars.',
    doNotTranslate: true,
  },
  {
    key: 'ardra',
    canonicalEnglish: 'Ardra',
    devanagari: 'आर्द्रा',
    iast: 'Ārdrā',
    commonVariants: ['ardra', 'aarudra'],
    category: 'nakshatra',
    meaning: 'Sixth nakshatra, deity Rudra, ruled by Rahu.',
    doNotTranslate: true,
  },
  {
    key: 'punarvasu',
    canonicalEnglish: 'Punarvasu',
    devanagari: 'पुनर्वसु',
    iast: 'Punarvasu',
    commonVariants: ['punarvasu'],
    category: 'nakshatra',
    meaning: 'Seventh nakshatra, deity Aditi, ruled by Jupiter.',
    doNotTranslate: true,
  },
  {
    key: 'pushya',
    canonicalEnglish: 'Pushya',
    devanagari: 'पुष्य',
    iast: 'Puṣya',
    commonVariants: ['pushya', 'pooyam'],
    category: 'nakshatra',
    meaning: 'Eighth nakshatra, deity Brihaspati, ruled by Saturn.',
    doNotTranslate: true,
  },
  {
    key: 'ashlesha',
    canonicalEnglish: 'Ashlesha',
    devanagari: 'आश्लेषा',
    iast: 'Āśleṣā',
    commonVariants: ['ashlesha', 'aslesha', 'ayilyam'],
    category: 'nakshatra',
    meaning: 'Ninth nakshatra, deity Sarpa/Nagas, ruled by Mercury.',
    doNotTranslate: true,
  },
  {
    key: 'magha',
    canonicalEnglish: 'Magha',
    devanagari: 'मघा',
    iast: 'Maghā',
    commonVariants: ['magha', 'makha'],
    category: 'nakshatra',
    meaning: 'Tenth nakshatra, deity Pitris (ancestors), ruled by Ketu.',
    doNotTranslate: true,
  },

  // --- DASHAS (Planetary Periods) ---
  {
    key: 'vimshottari',
    canonicalEnglish: 'Vimshottari Dasha',
    devanagari: 'विंशोत्तरी दशा',
    iast: 'Viṃśottarī Daśā',
    commonVariants: ['vimshottari', 'vimsottari'],
    category: 'dasha',
    meaning: 'The 120-year cycle planetary period system of Vedic astrology.',
    doNotTranslate: true,
  },
  {
    key: 'mahadasha',
    canonicalEnglish: 'Mahadasha',
    devanagari: 'महादशा',
    iast: 'Mahādaśā',
    commonVariants: ['mahadasha', 'maha dasha', 'mahadasa'],
    category: 'dasha',
    meaning: 'Major planetary period governing a multi-year phase of life.',
    doNotTranslate: true,
  },
  {
    key: 'antardasha',
    canonicalEnglish: 'Antardasha',
    devanagari: 'अन्तर्दशा',
    iast: 'Antardaśā',
    commonVariants: ['antardasha', 'antar dasha', 'bhukti', 'antardasa'],
    category: 'dasha',
    meaning: 'Sub-period operating within a major Mahadasha.',
    doNotTranslate: true,
  },
  {
    key: 'pratyantardasha',
    canonicalEnglish: 'Pratyantardasha',
    devanagari: 'प्रत्यन्तर्दशा',
    iast: 'Pratyantardaśā',
    commonVariants: ['pratyantardasha', 'pratyantar dasha'],
    category: 'dasha',
    meaning: 'Sub-sub-period operating within an Antardasha.',
    doNotTranslate: true,
  },

  // --- BHAVAS (Houses) & CHARTS ---
  {
    key: 'kundali',
    canonicalEnglish: 'Kundali (Birth Chart)',
    devanagari: 'कुण्डली',
    iast: 'Kuṇḍalī',
    commonVariants: ['kundali', 'kundli', 'janampatri', 'patrika', 'horoscope'],
    category: 'bhava',
    meaning: 'Vedic natal birth chart mapping the 12 houses and planetary positions.',
    doNotTranslate: true,
  },
  {
    key: 'lagna',
    canonicalEnglish: 'Ascendant (Lagna)',
    devanagari: 'लग्न',
    iast: 'Lagna',
    commonVariants: ['lagna', 'lagn', 'ascendant'],
    category: 'bhava',
    meaning: 'The rising zodiac sign on the eastern horizon at the moment of birth.',
    doNotTranslate: true,
  },
  {
    key: 'navamsha',
    canonicalEnglish: 'Navamsha (D9 Chart)',
    devanagari: 'नवांश',
    iast: 'Navāṃśa',
    commonVariants: ['navamsha', 'navamsa', 'navmansh', 'd9'],
    category: 'bhava',
    meaning: 'The 9th harmonic divisional chart reflecting marriage, destiny, and soul purpose.',
    doNotTranslate: true,
  },
  {
    key: 'dashamsha',
    canonicalEnglish: 'Dashamsha (D10 Chart)',
    devanagari: 'दशांश',
    iast: 'Daśāṃśa',
    commonVariants: ['dashamsha', 'dasamsa', 'd10'],
    category: 'bhava',
    meaning: 'The 10th harmonic divisional chart reflecting career, status, and profession.',
    doNotTranslate: true,
  },

  // --- DOSHAS & YOGAS ---
  {
    key: 'manglik_dosha',
    canonicalEnglish: 'Manglik Dosha (Kuja Dosha)',
    devanagari: 'मांगलिक दोष',
    iast: 'Māṅgalika Doṣa',
    commonVariants: ['manglik dosha', 'mangal dosha', 'kuja dosha', 'manglik'],
    category: 'dosha_yoga',
    meaning: 'Astrological combination caused by Mars in 1st, 4th, 7th, 8th, or 12th house.',
    doNotTranslate: true,
  },
  {
    key: 'sade_sati',
    canonicalEnglish: 'Sade Sati',
    devanagari: 'साढ़े साती',
    iast: 'Sāṛhe Sātī',
    commonVariants: ['sade sati', 'sadesati', 'saade saati', 'shani sade sati'],
    category: 'dosha_yoga',
    meaning: 'The 7.5-year transit of Saturn through the 12th, 1st, and 2nd houses from natal Moon.',
    doNotTranslate: true,
  },
  {
    key: 'kaal_sarp_dosha',
    canonicalEnglish: 'Kaal Sarp Dosha',
    devanagari: 'काल सर्प दोष',
    iast: 'Kāla Sarpa Doṣa',
    commonVariants: ['kaal sarp', 'kaalsarp', 'kaal sarp dosha', 'kala sarpa'],
    category: 'dosha_yoga',
    meaning: 'Configuration where all seven planets are hemmed between Rahu and Ketu.',
    doNotTranslate: true,
  },
  {
    key: 'gajakesari_yoga',
    canonicalEnglish: 'Gajakesari Yoga',
    devanagari: 'गजकेसरी योग',
    iast: 'Gajakesarī Yoga',
    commonVariants: ['gajakesari', 'gaja kesari yoga', 'gajkesari'],
    category: 'dosha_yoga',
    meaning: 'Auspicious yoga formed when Jupiter is in a Kendra from the Moon.',
    doNotTranslate: true,
  },
  {
    key: 'raja_yoga',
    canonicalEnglish: 'Raja Yoga',
    devanagari: 'राज योग',
    iast: 'Rāja Yoga',
    commonVariants: ['raja yoga', 'raj yoga', 'rajayoga'],
    category: 'dosha_yoga',
    meaning: 'Benefic combination of Kendra and Trikona lords conferring power and respect.',
    doNotTranslate: true,
  },

  // --- MUHURTA (Auspicious Timings) ---
  {
    key: 'brahma_muhurta',
    canonicalEnglish: 'Brahma Muhurta',
    devanagari: 'ब्रह्म मुहूर्त',
    iast: 'Brahma Muhūrta',
    commonVariants: ['brahma muhurta', 'brahmamuhurta', 'brahma muhurat'],
    category: 'muhurta',
    meaning: 'Sacred period 1 hour 36 minutes before sunrise, ideal for meditation and spiritual practices.',
    doNotTranslate: true,
  },
  {
    key: 'rahu_kaal',
    canonicalEnglish: 'Rahu Kaal',
    devanagari: 'राहु काल',
    iast: 'Rāhu Kāla',
    commonVariants: ['rahu kaal', 'rahukal', 'rahu kalam', 'rahukaal'],
    category: 'muhurta',
    meaning: 'Inauspicious 90-minute daily period ruled by Rahu, avoided for auspicious beginnings.',
    doNotTranslate: true,
  },
  {
    key: 'abhijit_muhurta',
    canonicalEnglish: 'Abhijit Muhurta',
    devanagari: 'अभिजित मुहूर्त',
    iast: 'Abhijita Muhūrta',
    commonVariants: ['abhijit muhurta', 'abhijith muhurat'],
    category: 'muhurta',
    meaning: 'Auspicious midday window that neutralizes minor astrological afflictions.',
    doNotTranslate: true,
  },
] as const

/**
 * Fast lookup map from canonical key to glossary entry
 */
const GLOSSARY_BY_KEY = new Map<string, AstrologyGlossaryEntry>(
  ASTROLOGY_GLOSSARY.map((entry) => [entry.key, entry])
)

/**
 * Returns an entry by its canonical key
 */
export function getGlossaryEntry(key: string): AstrologyGlossaryEntry | undefined {
  return GLOSSARY_BY_KEY.get(key)
}

/**
 * Returns all glossary entries
 */
export function getAllGlossaryEntries(): readonly AstrologyGlossaryEntry[] {
  return ASTROLOGY_GLOSSARY
}

/**
 * Identifies recognized Vedic astrology entities within arbitrary user input text.
 * Matches both Romanized variants (case-insensitive) and Devanagari script.
 */
export function findAstrologyTerms(text: string): RecognizedAstrologyTerm[] {
  if (!text || !text.trim()) return []

  const normalized = text.toLowerCase()
  const detectedMap = new Map<string, RecognizedAstrologyTerm>()

  for (const entry of ASTROLOGY_GLOSSARY) {
    // Check Devanagari match
    if (text.includes(entry.devanagari)) {
      detectedMap.set(entry.key, {
        canonicalKey: entry.key,
        originalToken: entry.devanagari,
        category: entry.category,
        devanagari: entry.devanagari,
        iast: entry.iast,
        doNotTranslate: entry.doNotTranslate,
      })
      continue
    }

    // Check Romanized variants match with word boundaries
    for (const variant of entry.commonVariants) {
      // Use boundary-safe regex for multi-word or single-word terms
      const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i')
      const match = regex.exec(normalized)

      if (match) {
        detectedMap.set(entry.key, {
          canonicalKey: entry.key,
          originalToken: variant,
          category: entry.category,
          devanagari: entry.devanagari,
          iast: entry.iast,
          doNotTranslate: entry.doNotTranslate,
        })
        break
      }
    }
  }

  return Array.from(detectedMap.values())
}

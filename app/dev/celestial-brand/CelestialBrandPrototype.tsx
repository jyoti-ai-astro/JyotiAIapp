'use client'

import dynamic from 'next/dynamic'
import { CheckCircle2, Flame, Moon, Orbit, ShieldCheck, Sun, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import styles from './celestial-brand.module.css'

const CelestialScene = dynamic(() => import('./CelestialScene'), {
  ssr: false,
  loading: () => <div className={styles.staticSolarCore} aria-hidden="true" />,
})

type Palette = {
  name: string
  note: string
  recommended?: boolean
  colors: Record<
    | 'primary'
    | 'deep background'
    | 'light background'
    | 'accent'
    | 'metallic/gold'
    | 'text primary'
    | 'text secondary'
    | 'border'
    | 'success'
    | 'warning'
    | 'danger',
    string
  >
}

const palettes: Palette[] = [
  {
    name: 'Solar Observatory',
    note: 'Best balance of sacred warmth, premium contrast, and product trust.',
    recommended: true,
    colors: {
      primary: '#F28C28',
      'deep background': '#07131F',
      'light background': '#FFF8E6',
      accent: '#2F7D7E',
      'metallic/gold': '#C9A24A',
      'text primary': '#FFF7E8',
      'text secondary': '#B9C2BF',
      border: '#D8B56A',
      success: '#3D9B72',
      warning: '#D9962E',
      danger: '#C04A3A',
    },
  },
  {
    name: 'Sacred Saffron + Midnight',
    note: 'More devotional and vivid, useful for ritual-led surfaces.',
    colors: {
      primary: '#E06B1E',
      'deep background': '#081020',
      'light background': '#FFF4D8',
      accent: '#1B6F6A',
      'metallic/gold': '#B88A32',
      'text primary': '#FFF9EC',
      'text secondary': '#B7B8B0',
      border: '#C18B3B',
      success: '#41966B',
      warning: '#D48A1F',
      danger: '#B84236',
    },
  },
  {
    name: 'Ivory + Deep Cosmos + Ember',
    note: 'Quietest and most editorial; strongest for reports and long reading.',
    colors: {
      primary: '#C9552B',
      'deep background': '#0B1220',
      'light background': '#FFF9ED',
      accent: '#516F73',
      'metallic/gold': '#BFA45A',
      'text primary': '#FAF3E4',
      'text secondary': '#AEB9BA',
      border: '#9E8549',
      success: '#4A8F68',
      warning: '#C9872D',
      danger: '#A9463A',
    },
  },
]

const colorOrder = [
  'primary',
  'deep background',
  'light background',
  'accent',
  'metallic/gold',
  'text primary',
  'text secondary',
  'border',
  'success',
  'warning',
  'danger',
] as const

const typePairs = [
  {
    name: 'Marcellus + Inter',
    className: styles.typeMarcellus,
    verdict: 'Recommended',
    note: 'Calm Vedic authority with excellent product readability.',
  },
  {
    name: 'Playfair Display + Inter',
    className: styles.typePlayfair,
    verdict: 'Alternate',
    note: 'Elegant and editorial, but more luxury magazine than observatory tool.',
  },
  {
    name: 'Cormorant Garamond + Inter',
    className: styles.typeCormorant,
    verdict: 'Fallback exploration',
    note: 'Sacred and classical where available locally, less robust for UI labels.',
  },
]

function LogoMark({ small = false, mono = false }: { small?: boolean; mono?: boolean }) {
  return (
    <svg
      className={small ? styles.logoMarkSmall : styles.logoMark}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Solar Jyoti flame orbit mark"
    >
      <circle className={styles.logoOrbit} cx="32" cy="32" r="23" fill="none" strokeWidth="3" />
      <circle className={styles.logoOrbitThin} cx="32" cy="32" r="15" fill="none" strokeWidth="1.5" />
      <path
        className={mono ? styles.logoMono : styles.logoFlame}
        d="M33 9c7 8 13 15 13 26 0 10-6 18-14 18S18 45 18 35c0-7 4-12 9-18-1 8 2 12 6 15 4-6 3-13 0-23Z"
      />
      <path
        className={mono ? styles.logoMonoCore : styles.logoCore}
        d="M32 28c4 5 6 8 6 13 0 4-3 8-6 8s-6-4-6-8c0-5 3-8 6-13Z"
      />
      <circle className={styles.logoPlanet} cx="50" cy="20" r="3" />
    </svg>
  )
}

function Wordmark({ stacked = false, mono = false }: { stacked?: boolean; mono?: boolean }) {
  return (
    <div className={stacked ? styles.wordmarkStacked : styles.wordmark}>
      <LogoMark mono={mono} />
      <div>
        <span>JyotiAI</span>
        <small>Solar clarity for life decisions</small>
      </div>
    </div>
  )
}

function PaletteBoard() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionIntro}>
        <p className={styles.kicker}>01 / Color</p>
        <h2>Brand Color Board</h2>
      </div>
      <div className={styles.paletteGrid}>
        {palettes.map((palette) => (
          <article
            className={`${styles.paletteCard} ${palette.recommended ? styles.recommendedPalette : ''}`}
            key={palette.name}
          >
            <div className={styles.paletteHeader}>
              <div>
                <h3>{palette.name}</h3>
                <p>{palette.note}</p>
              </div>
              {palette.recommended && <span className={styles.recommendedBadge}>Recommended</span>}
            </div>
            <div className={styles.swatchGrid}>
              {colorOrder.map((label) => (
                <div className={styles.swatch} key={label}>
                  <span style={{ background: palette.colors[label] }} />
                  <div>
                    <strong>{label}</strong>
                    <code>{palette.colors[label]}</code>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function LogoSystem() {
  const previews = [
    ['master horizontal logo', <Wordmark key="horizontal" />],
    ['stacked logo', <Wordmark key="stacked" stacked />],
    ['emblem only', <LogoMark key="emblem" />],
    ['monochrome dark', <Wordmark key="mono-dark" mono />],
    ['monochrome light', <Wordmark key="mono-light" mono />],
    ['app icon / favicon', <LogoMark key="app-icon" />],
    ['small 24px nav mark', <LogoMark key="nav-mark" small />],
  ] as const

  return (
    <section className={styles.section}>
      <div className={styles.sectionIntro}>
        <p className={styles.kicker}>02 / Identity</p>
        <h2>Logo System Preview</h2>
      </div>
      <div className={styles.logoGrid}>
        {previews.map(([label, preview]) => (
          <article className={styles.logoTile} key={label}>
            <div className={styles.logoStage}>{preview}</div>
            <p>{label}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function HeroDirection() {
  const [canUseScene, setCanUseScene] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 768px)').matches
    setCanUseScene(!reduceMotion && !mobile)
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.sectionIntro}>
        <p className={styles.kicker}>03 / Art Direction</p>
        <h2>Homepage Hero Variants</h2>
      </div>
      <div className={styles.heroGrid}>
        <article className={styles.heroVariant}>
          <div className={styles.heroVisual}>
            <div className={styles.heroSceneShell}>
              <div className={styles.staticSolarCore} aria-hidden="true" />
              {canUseScene && <CelestialScene />}
            </div>
            <div className={styles.heroCopy}>
              <p>Variant A</p>
              <h3>Luminous solar core with slow orbital planets</h3>
              <span>Recommended for homepage hero</span>
            </div>
          </div>
        </article>
        <article className={styles.heroVariant}>
          <div className={`${styles.heroVisual} ${styles.horizonHero}`}>
            <div className={styles.horizonSun} />
            <div className={styles.horizonRings} />
            <div className={styles.heroCopy}>
              <p>Variant B</p>
              <h3>Sacred solar horizon with subtle celestial rings</h3>
              <span>Best for report covers and calm onboarding</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function UiSamples() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionIntro}>
        <p className={styles.kicker}>04 / Product UI</p>
        <h2>Recommended Palette Applied</h2>
      </div>
      <div className={styles.uiLab}>
        <nav className={styles.sampleNav}>
          <div className={styles.navBrand}>
            <LogoMark small />
            <span>JyotiAI</span>
          </div>
          <div className={styles.navLinks}>
            <span>Guru</span>
            <span>Kundali</span>
            <span>Reports</span>
          </div>
          <button className={styles.navButton} type="button">Open Lab</button>
        </nav>
        <div className={styles.buttonRow}>
          <button className={styles.primaryButton} type="button"><Sun size={16} /> Generate Reading</button>
          <button className={styles.secondaryButton} type="button"><Moon size={16} /> View Report</button>
        </div>
        <div className={styles.sampleGrid}>
          <article className={styles.pricingCard}>
            <p>Premium</p>
            <h3>Solar Guide</h3>
            <strong>₹299</strong>
            <span>Full kundali reading, Guru follow-up, and yearly timing map.</span>
            <button className={styles.primaryButton} type="button">Choose</button>
          </article>
          <article className={styles.profileCard}>
            <div className={styles.avatar}>JO</div>
            <div>
              <p>Profile</p>
              <h3>Diptanshu Ojha</h3>
              <span>Moon: Vrishabha / Lagna: Simha</span>
            </div>
          </article>
          <article className={styles.chatBubble}>
            <p>Guru</p>
            <span>Your current dasha favors disciplined expansion. Begin with one clear professional sankalpa.</span>
          </article>
          <article className={styles.reportCard}>
            <Flame size={20} />
            <div>
              <p>Report</p>
              <h3>Career Timing Window</h3>
              <span>Strongest momentum: late September to November.</span>
            </div>
          </article>
          <article className={styles.kundaliCard}>
            <p>Kundali Summary</p>
            <div className={styles.kundaliWheel}>
              <span>Su</span>
              <span>Mo</span>
              <span>Ma</span>
            </div>
            <strong>Fire ascendant, earth moon, steady wealth yogas.</strong>
          </article>
        </div>
      </div>
    </section>
  )
}

function Typography() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionIntro}>
        <p className={styles.kicker}>05 / Typography</p>
        <h2>Type Pair Comparison</h2>
      </div>
      <div className={styles.typeGrid}>
        {typePairs.map((pair) => (
          <article className={`${styles.typeCard} ${pair.verdict === 'Recommended' ? styles.typeRecommended : ''}`} key={pair.name}>
            <p>{pair.verdict}</p>
            <h3>{pair.name}</h3>
            <div className={pair.className}>
              <h4>Ancient wisdom. Personal clarity.</h4>
              <h5>Celestial report summary</h5>
              <span className={styles.typeBody}>Your reading combines Vedic timing, planetary strength, and plain-language guidance.</span>
              <button type="button">Begin reading</button>
              <small>Caption: refined, legible, restrained</small>
            </div>
            <span>{pair.note}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function RulesAndPerformance() {
  const doItems = ['celestial depth', 'solar warmth', 'deep navy/ink contrast', 'restrained gold', 'sacred geometry', 'clean spacing']
  const dontItems = ['neon gradients', 'purple SaaS glow', 'too many stars', 'gold everywhere', 'black-on-black sections', 'AI-looking glassmorphism']

  return (
    <section className={styles.section}>
      <div className={styles.rulesGrid}>
        <article className={styles.ruleCard}>
          <p className={styles.kicker}>06 / Rules</p>
          <h2>Do</h2>
          {doItems.map((item) => (
            <span key={item}><CheckCircle2 size={16} /> {item}</span>
          ))}
        </article>
        <article className={styles.ruleCard}>
          <p className={styles.kicker}>06 / Rules</p>
          <h2>Don&apos;t</h2>
          {dontItems.map((item) => (
            <span key={item}><XCircle size={16} /> {item}</span>
          ))}
        </article>
        <article className={styles.performanceCard}>
          <p className={styles.kicker}>07 / Performance</p>
          <h2>Performance Panel</h2>
          <dl>
            <div><dt>WebGL context count</dt><dd>1 maximum, Variant A only</dd></div>
            <div><dt>Particles</dt><dd>180 stars + 48 solar motes</dd></div>
            <div><dt>Desktop behavior</dt><dd>Lazy-loaded Three.js canvas, low orbital motion</dd></div>
            <div><dt>Mobile behavior</dt><dd>CSS/static hero fallback</dd></div>
            <div><dt>Reduced motion</dt><dd>No WebGL animation, static solar core</dd></div>
            <div><dt>Fallback mode</dt><dd>Pure CSS sun, rings, and sacred geometry</dd></div>
          </dl>
        </article>
      </div>
    </section>
  )
}

function DeliverableSummary() {
  return (
    <section className={styles.summary}>
      <p className={styles.kicker}>08 / Deliverable Summary</p>
      <h2>Recommended System</h2>
      <div className={styles.summaryGrid}>
        <span><ShieldCheck size={18} /> Logo direction: simple Solar Jyoti flame, sun core, single orbit, readable at 24px.</span>
        <span><Sun size={18} /> Palette: Solar Observatory.</span>
        <span><Orbit size={18} /> Typography: Marcellus + Inter.</span>
        <span><Flame size={18} /> Hero direction: Variant A for homepage, Variant B for quieter report/onboarding surfaces.</span>
        <span><Moon size={18} /> Motion policy: observatory-slow, optional, reduced-motion safe, mobile static.</span>
        <span><LogoMark small /> Favicon direction: flame inside orbit with one solar dot, no detailed crest.</span>
      </div>
    </section>
  )
}

export function CelestialBrandPrototype() {
  return (
    <main className={styles.lab}>
      <section className={styles.labHero}>
        <div className={styles.labHeroArt} aria-hidden="true">
          <div className={styles.labHeroSun} />
          <div className={styles.labHeroOrbit} />
        </div>
        <div className={styles.labHeroCopy}>
          <p className={styles.kicker}>JyotiAI Celestial Brand Lab / Phase 2</p>
          <h1>Solar Jyoti, sacred flame, celestial observatory.</h1>
          <p>
            A premium visual system for Indian/Vedic-inspired guidance: warm, trustworthy,
            restrained, and alive without drifting into generic neon AI styling.
          </p>
        </div>
      </section>
      <PaletteBoard />
      <LogoSystem />
      <HeroDirection />
      <UiSamples />
      <Typography />
      <RulesAndPerformance />
      <DeliverableSummary />
    </main>
  )
}

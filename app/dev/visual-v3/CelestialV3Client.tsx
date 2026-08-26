'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  CircleDot,
  MessageCircle,
  Orbit,
  Sparkles,
} from 'lucide-react'

import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark'
import styles from './visual-v3.module.css'

const CelestialV3Scene = dynamic(() => import('./CelestialV3Scene'), {
  ssr: false,
  loading: () => <div className={styles.sceneFallback} />,
})

function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      cancelAnimationFrame(frame)

      frame = requestAnimationFrame(() => {
        const max = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1
        )

        setProgress(Math.min(Math.max(window.scrollY / max, 0), 1))
      })
    }

    update()

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return progress
}

export function CelestialV3Client() {
  const progress = useScrollProgress()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className={styles.page}>
      <div className={styles.sceneLayer}>
        <CelestialV3Scene progress={progress} />
      </div>

      <div className={styles.vignette} />
      <div className={styles.grain} />

      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>
            <SolarJyotiMark />
          </span>
          <span>JyotiAI</span>
        </Link>

        <nav className={styles.desktopNav}>
          <div
            className={styles.explore}
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              className={styles.navItem}
              onClick={() => setMenuOpen((current) => !current)}
            >
              Explore
              <ChevronDown size={14} />
            </button>

            <div
              className={`${styles.megaMenu} ${
                menuOpen ? styles.megaMenuOpen : ''
              }`}
            >
              <div>
                <span className={styles.menuLabel}>Your astrology</span>
                <Link href="/kundali">Kundali</Link>
                <Link href="/dashboard">Today</Link>
                <Link href="/timeline">Timeline</Link>
              </div>

              <div>
                <span className={styles.menuLabel}>Intelligence</span>
                <Link href="/guru">Jyoti Guru</Link>
                <Link href="/predictions">Predictions</Link>
                <Link href="/reports">Reports</Link>
              </div>

              <div className={styles.menuStatement}>
                <span className={styles.menuLabel}>Celestial OS</span>
                <p>
                  One verified birth chart powering every personal experience.
                </p>
              </div>
            </div>
          </div>

          <Link className={styles.navItem} href="/kundali">
            Kundali
          </Link>

          <Link className={styles.navItem} href="/guru">
            Guru
          </Link>

          <Link className={styles.navItem} href="/pricing">
            Pricing
          </Link>
        </nav>

        <div className={styles.headerActions}>
          <Link className={styles.signIn} href="/login">
            Sign in
          </Link>

          <Link className={styles.headerCta} href="/onboarding">
            Begin
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className={`${styles.chapter} ${styles.heroChapter}`}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span />
            Personal Vedic Intelligence
          </div>

          <h1>
            Your chart is not
            <br />
            a picture.
            <strong> It is a universe.</strong>
          </h1>

          <p>
            Enter a living celestial model built from your verified birth data —
            where planetary timing, Kundali, Guru and future cycles belong to one
            connected system.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/onboarding">
              Enter my chart
              <ArrowRight size={18} />
            </Link>

            <Link className={styles.secondaryAction} href="/guru">
              Ask Jyoti Guru
            </Link>
          </div>
        </div>

        <div className={styles.heroMeta}>
          <span>09 Grahas</span>
          <i />
          <span>12 Bhavas</span>
          <i />
          <span>27 Nakshatras</span>
        </div>

        <div className={styles.scrollMarker}>
          <span>Scroll to enter</span>
          <b />
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.kundaliChapter}`}>
        <div className={styles.copyBlock}>
          <span className={styles.chapterNumber}>01</span>

          <div className={styles.kicker}>
            <Orbit size={17} />
            Living Kundali
          </div>

          <h2>
            Move through your
            <em> celestial architecture.</em>
          </h2>

          <p>
            Houses are no longer trapped inside a flat card. The same canonical
            chart can become a traditional Kundali, analytical wheel, or spatial
            celestial map.
          </p>

          <Link className={styles.inlineLink} href="/kundali">
            Open Kundali
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.dataRail}>
          <div>
            <small>Lagna</small>
            <strong>Ascendant</strong>
            <span>Point of emergence</span>
          </div>

          <div>
            <small>Grahas</small>
            <strong>Planetary field</strong>
            <span>Active forces</span>
          </div>

          <div>
            <small>Dasha</small>
            <strong>Timing layer</strong>
            <span>Periods unfolding</span>
          </div>
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.intelligenceChapter}`}>
        <div className={styles.copyBlock}>
          <span className={styles.chapterNumber}>02</span>

          <div className={styles.kicker}>
            <MessageCircle size={17} />
            Contextual intelligence
          </div>

          <h2>
            Ask the chart,
            <em> not a generic chatbot.</em>
          </h2>

          <p>
            Jyoti Guru should understand the celestial object you are looking at:
            a house, graha, Dasha period, transit or relationship between them.
          </p>
        </div>

        <div className={styles.questionStack}>
          <button type="button">
            <CircleDot size={17} />
            What is Jupiter activating for me?
          </button>

          <button type="button">
            <Sparkles size={17} />
            Why does this period feel different?
          </button>

          <button type="button">
            <Orbit size={17} />
            Show the strongest timing window
          </button>
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.timelineChapter}`}>
        <div className={styles.timelineCopy}>
          <span className={styles.chapterNumber}>03</span>

          <div className={styles.kicker}>
            <Sparkles size={17} />
            Time becomes visible
          </div>

          <h2>
            Your astrology should
            <em> move through time.</em>
          </h2>

          <p>
            The celestial system transitions from birth chart to current timing
            to longer cycles without losing the personal context underneath it.
          </p>
        </div>

        <div className={styles.timelineRail}>
          <span>Birth</span>
          <b />
          <span>Now</span>
          <b />
          <span>2027</span>
          <b />
          <span>2030</span>
        </div>
      </section>

      <section className={`${styles.chapter} ${styles.finalChapter}`}>
        <div className={styles.finalCopy}>
          <span className={styles.chapterNumber}>04</span>
          <h2>
            One birth chart.
            <em> An entire personal universe.</em>
          </h2>

          <p>
            This is the direction: serious astrology underneath, cinematic
            interaction above it, and no separation between beauty and utility.
          </p>

          <Link className={styles.primaryAction} href="/onboarding">
            Create my celestial map
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div className={styles.progress}>
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </main>
  )
}

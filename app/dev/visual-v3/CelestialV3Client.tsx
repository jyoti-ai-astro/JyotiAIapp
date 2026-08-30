'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleDot,
  FileText,
  Fingerprint,
  LockKeyhole,
  Menu,
  MessageCircle,
  Orbit,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark'
import { useUserStore } from '@/store/user-store'
import styles from './visual-v3.module.css'

const CelestialV3Scene = dynamic(() => import('./CelestialV3Scene'), {
  ssr: false,
  loading: () => <div className={styles.sceneFallback} />,
})

type SceneProgress = {
  cinematicProgress: number
  extensionProgress: number
  extensionActive: boolean
  pageProgress: number
}

function useSceneProgress(): SceneProgress {
  const [state, setState] = useState<SceneProgress>({
    cinematicProgress: 0,
    extensionProgress: 0,
    extensionActive: false,
    pageProgress: 0,
  })

  useEffect(() => {
    let frame = 0

    const update = () => {
      cancelAnimationFrame(frame)

      frame = requestAnimationFrame(() => {
        const viewport = Math.max(window.innerHeight, 1)
        const scrollY = window.scrollY

        const pageMax = Math.max(
          document.documentElement.scrollHeight - viewport,
          1
        )

        const cinematicEnd =
          document.querySelector<HTMLElement>('[data-v3-cinematic-end]')

        const cinematicMax = cinematicEnd
          ? Math.max(
              cinematicEnd.offsetTop +
                cinematicEnd.offsetHeight -
                viewport,
              1
            )
          : pageMax

        const cinematicProgress = Math.min(
          Math.max(scrollY / cinematicMax, 0),
          1
        )

        const stops = Array.from(
          document.querySelectorAll<HTMLElement>('[data-v3-scene-stop]')
        )

        const anchor = scrollY + viewport * 0.52

        let extensionProgress = 0
        let extensionActive = false

        if (stops.length > 0) {
          const points = stops.map(
            (element) =>
              element.getBoundingClientRect().top +
              scrollY +
              element.offsetHeight * 0.36
          )

          extensionActive =
            anchor >= points[0] - viewport * 0.55

          if (extensionActive && points.length === 1) {
            extensionProgress = 1
          } else if (extensionActive) {
            let segment = 0

            while (
              segment < points.length - 2 &&
              anchor >= points[segment + 1]
            ) {
              segment += 1
            }

            if (anchor <= points[0]) {
              extensionProgress = 0
            } else if (anchor >= points[points.length - 1]) {
              extensionProgress = 1
            } else {
              const start = points[segment]
              const end = points[segment + 1]
              const local = Math.min(
                Math.max(
                  (anchor - start) /
                    Math.max(end - start, 1),
                  0
                ),
                1
              )

              extensionProgress =
                (segment + local) /
                (points.length - 1)
            }
          }
        }

        setState({
          cinematicProgress,
          extensionProgress,
          extensionActive,
          pageProgress: Math.min(
            Math.max(scrollY / pageMax, 0),
            1
          ),
        })
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

  return state
}

export function CelestialV3Client() {
  const {
    cinematicProgress,
    extensionProgress,
    extensionActive,
    pageProgress,
  } = useSceneProgress()

  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = useUserStore((state) => state.user)

  const chartEntryHref = user
    ? user.onboarded
      ? '/kundali'
      : '/onboarding'
    : '/signup?redirect=/onboarding'

  const chartEntryLabel = user?.onboarded
    ? 'Enter my chart'
    : user
      ? 'Complete my chart'
      : 'Begin my chart'

  return (
    <main className={styles.page}>
      <div className={styles.sceneLayer}>
        <CelestialV3Scene
          progress={cinematicProgress}
          extensionProgress={extensionProgress}
          extensionActive={extensionActive}
        />
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
            onFocusCapture={() => setMenuOpen(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setMenuOpen(false)
              }
            }}
          >
            <button
              type="button"
              className={styles.navItem}
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
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
          {user ? (
            <>
              <Link className={styles.signIn} href="/profile">
                Account
              </Link>

              <Link className={styles.headerCta} href="/dashboard">
                Open Dashboard
                <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <Link className={styles.signIn} href="/login">
                Sign in
              </Link>

              <Link className={styles.headerCta} href={chartEntryHref}>
                Begin
                <ArrowRight size={15} />
              </Link>
            </>
          )}

          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div
          className={`${styles.mobileMenu} ${
            mobileMenuOpen ? styles.mobileMenuOpen : ''
          }`}
        >
          <span className={styles.menuLabel}>Explore JyotiAI</span>

          <Link href="/kundali" onClick={() => setMobileMenuOpen(false)}>
            Kundali
          </Link>
          <Link href="/guru" onClick={() => setMobileMenuOpen(false)}>
            Jyoti Guru
          </Link>
          <Link href="/predictions" onClick={() => setMobileMenuOpen(false)}>
            Predictions
          </Link>
          <Link href="/timeline" onClick={() => setMobileMenuOpen(false)}>
            Timeline
          </Link>
          <Link href="/calendar" onClick={() => setMobileMenuOpen(false)}>
            Calendar
          </Link>
          <Link href="/reports" onClick={() => setMobileMenuOpen(false)}>
            Reports
          </Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
            Pricing
          </Link>

          <div className={styles.mobileMenuActions}>
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  Account
                </Link>

                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Open Dashboard
                  <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>

                <Link href={chartEntryHref} onClick={() => setMobileMenuOpen(false)}>
                  Begin my chart
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
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
            <Link className={styles.primaryAction} href={chartEntryHref}>
              {chartEntryLabel}
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

      <section
        className={`${styles.chapter} ${styles.finalChapter}`}
        data-v3-cinematic-end
      >
        <div className={styles.finalCopy}>
          <span className={styles.chapterNumber}>04</span>
          <h2>
            One birth chart.
            <em> An entire personal universe.</em>
          </h2>

          <p>
            Serious Vedic astrology underneath. A connected intelligence layer
            above it. Every experience begins with the same verified celestial
            foundation.
          </p>

          <Link className={styles.primaryAction} href={chartEntryHref}>
            Create my celestial map
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div className={styles.siteContent}>
        <section className={styles.productUniverse} data-v3-scene-stop="products">
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>The JyotiAI universe</span>
            <h2>
              Astrology becomes more useful when
              <em> everything speaks to everything else.</em>
            </h2>
            <p>
              Your Kundali is the foundation. From it, JyotiAI connects daily
              guidance, questions, predictions, timing, reports and deeper life
              modules into one personal system.
            </p>
          </div>

          <div className={styles.productGrid}>
            {[
              {
                icon: <Orbit size={22} />,
                title: 'Kundali',
                copy: 'Your canonical Vedic chart — the celestial source used across personalized experiences.',
                href: '/kundali',
              },
              {
                icon: <MessageCircle size={22} />,
                title: 'Jyoti Guru',
                copy: 'Ask questions with chart and timing context instead of starting from a generic AI conversation.',
                href: '/guru',
              },
              {
                icon: <Sparkles size={22} />,
                title: 'Predictions',
                copy: 'Explore deeper forecasts built around the same verified astrology context.',
                href: '/predictions',
              },
              {
                icon: <CalendarDays size={22} />,
                title: 'Timeline',
                copy: 'Move from the present into longer cycles and important windows without losing chart context.',
                href: '/timeline',
              },
              {
                icon: <CalendarDays size={22} />,
                title: 'Cosmic Calendar',
                copy: 'Bring astrological timing into a practical calendar and guidance experience.',
                href: '/calendar',
              },
              {
                icon: <FileText size={22} />,
                title: 'Reports',
                copy: 'Keep generated Kundali, prediction and timeline reports available inside your account.',
                href: '/reports',
              },
            ].map((item) => (
              <Link className={styles.productCard} href={item.href} key={item.title}>
                <span className={styles.productIcon}>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <span className={styles.cardLink}>
                  Explore
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>

          <div className={styles.moduleRail}>
            <span>Career</span>
            <span>Business</span>
            <span>Compatibility</span>
            <span>Numerology</span>
            <span>Palmistry</span>
            <span>Face Reading</span>
            <span>Aura</span>
          </div>
        </section>

        <section className={styles.howItWorks} data-v3-scene-stop="identity">
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>How it becomes yours</span>
            <h2>
              From birth details to
              <em> living personal intelligence.</em>
            </h2>
          </div>

          <div className={styles.stepsGrid}>
            <article>
              <span>01</span>
              <Fingerprint size={24} />
              <h3>Verify your birth profile</h3>
              <p>
                Start with your date, time and place of birth so personalized
                astrology has a real foundation.
              </p>
            </article>

            <article>
              <span>02</span>
              <Orbit size={24} />
              <h3>Generate your Kundali</h3>
              <p>
                Your canonical chart becomes the shared celestial context used
                across the connected product.
              </p>
            </article>

            <article>
              <span>03</span>
              <MessageCircle size={24} />
              <h3>Explore and ask</h3>
              <p>
                Move between guidance, Guru, predictions and timing while
                keeping the same underlying chart context.
              </p>
            </article>

            <article>
              <span>04</span>
              <FileText size={24} />
              <h3>Go deeper over time</h3>
              <p>
                Generate reports, explore timelines and return to saved
                experiences as your questions evolve.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.trustSection} data-v3-scene-stop="trust">
          <div className={styles.trustCopy}>
            <span className={styles.sectionEyebrow}>Trust architecture</span>
            <h2>
              Personal astrology should never be
              <em> built on invented personal data.</em>
            </h2>
            <p>
              JyotiAI's personalized experiences are designed around a verified
              birth profile and canonical Kundali. When the underlying birth
              information changes, chart-derived experiences should be refreshed
              rather than silently pretending nothing changed.
            </p>

            <Link className={styles.inlineLink} href="/legal/privacy">
              Read about privacy
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.trustCards}>
            <article>
              <ShieldCheck size={22} />
              <div>
                <h3>Verified foundation</h3>
                <p>Personalized astrology begins with saved birth information and chart state.</p>
              </div>
            </article>

            <article>
              <LockKeyhole size={22} />
              <div>
                <h3>Account-based context</h3>
                <p>Your personal astrology context belongs to your account experience.</p>
              </div>
            </article>

            <article>
              <Orbit size={22} />
              <div>
                <h3>One celestial source</h3>
                <p>Connected surfaces can use the same canonical Kundali instead of conflicting local charts.</p>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.conversionSection} data-v3-scene-stop="convergence">
          <div>
            <span className={styles.sectionEyebrow}>Begin with your chart</span>
            <h2>
              The universe is already there.
              <em> JyotiAI helps you read it.</em>
            </h2>
            <p>
              Create your birth profile, generate your first chart experience,
              and choose how deeply you want to explore.
            </p>
          </div>

          <div className={styles.conversionActions}>
            <Link className={styles.primaryAction} href={chartEntryHref}>
              Begin my chart
              <ArrowRight size={18} />
            </Link>
            <Link className={styles.secondaryAction} href="/pricing">
              Explore pricing
            </Link>
          </div>
        </section>

        <section className={styles.faqSection} data-v3-scene-stop="quiet">
          <div className={styles.sectionIntro}>
            <span className={styles.sectionEyebrow}>Before you begin</span>
            <h2>Questions, answered clearly.</h2>
          </div>

          <div className={styles.faqGrid}>
            {[
              [
                'What makes JyotiAI personal?',
                'Personalized experiences are designed to use your verified birth profile and canonical Kundali as shared context.',
              ],
              [
                'Is Jyoti Guru just a generic chatbot?',
                'The product direction is for Guru to use available chart and timing context when answering personalized questions.',
              ],
              [
                'What happens when my birth details change?',
                'Chart-derived state can become stale and should be refreshed before relying on personalized guidance again.',
              ],
              [
                'Can I keep my generated reports?',
                'JyotiAI includes account-based report experiences for returning to generated Kundali, prediction and timeline material.',
              ],
            ].map(([question, answer]) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer} data-v3-scene-stop="horizon">
          <div className={styles.footerLead}>
            <Link className={styles.brand} href="/">
              <span className={styles.brandMark}>
                <SolarJyotiMark />
              </span>
              <span>JyotiAI</span>
            </Link>

            <p>
              A personal celestial intelligence system built around your
              verified Vedic chart.
            </p>
          </div>

          <div className={styles.footerLinks}>
            <div>
              <span className={styles.menuLabel}>Astrology</span>
              <Link href="/kundali">Kundali</Link>
              <Link href="/guru">Jyoti Guru</Link>
              <Link href="/predictions">Predictions</Link>
              <Link href="/timeline">Timeline</Link>
              <Link href="/calendar">Calendar</Link>
            </div>

            <div>
              <span className={styles.menuLabel}>JyotiAI</span>
              <Link href="/company/about">About</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/reports">Reports</Link>
              <Link href="/support">Support</Link>
              <Link href="/company/contact">Contact</Link>
            </div>

            <div>
              <span className={styles.menuLabel}>Legal</span>
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/terms">Terms</Link>
              <Link href="/legal/security">Security</Link>
              <Link href="/legal/cookies">Cookies</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} JyotiAI. All rights reserved.</span>
            <span>Personal Vedic Intelligence</span>
          </div>
        </footer>
      </div>

      <div className={styles.progress}>
        <span style={{ transform: `scaleX(${pageProgress})` }} />
      </div>
    </main>
  )
}

/**
 * Timeline Report
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Generates PDF report for 12-month timeline
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { BaseTemplate } from './templates/BaseTemplate'
import { SectionHeader } from './templates/SectionHeader'
import { styles } from './templates/PageStyles'
import type { AstroContext } from '@/lib/engines/astro-types'
import type { TimelineEngineResult } from '@/lib/engines/timeline-engine-v2'
import { formatDateForReport } from './pdf-utils'

interface TimelineReportProps {
  user: {
    name?: string
    email?: string
  }
  astroContext: AstroContext | null
  timelineResult: TimelineEngineResult
}

export function generateTimelineReportDoc({
  user,
  astroContext,
  timelineResult,
}: TimelineReportProps) {
  const userName = user.name || 'Seeker'
  const today = new Date()
  const nextYear = new Date(today)
  nextYear.setFullYear(nextYear.getFullYear() + 1)

  // Group events by intensity for highlights
  const highIntensityMonths = timelineResult.events.filter((e) => e.intensity === 'high')
  const challengingMonths = timelineResult.events.filter((e) => e.intensity === 'low')

  return (
    <BaseTemplate
      title="12-Month Timeline Report"
      subtitle="Month-by-Month Cosmic Journey"
      userName={userName}
      meta={{
        'Period': `${formatDateForReport(today)} - ${formatDateForReport(nextYear)}`,
        'Status': timelineResult.status === 'degraded' ? 'Limited Context' : 'Full Analysis',
      }}
    >
      {/* Overview */}
      <View>
        <Text style={styles.bodyText}>{timelineResult.overview}</Text>
      </View>

      {/* Key Highlights */}
      <View style={styles.highlightBox}>
        <Text style={[styles.bodyText, { fontWeight: 'bold' }]}>Key Highlights:</Text>
        {highIntensityMonths.length > 0 && (
          <Text style={styles.bodyText}>
            • High energy months: {highIntensityMonths.slice(0, 3).map((e) => e.monthLabel).join(', ')}
          </Text>
        )}
        {challengingMonths.length > 0 && (
          <Text style={styles.bodyText}>
            • Months requiring extra care: {challengingMonths.slice(0, 3).map((e) => e.monthLabel).join(', ')}
          </Text>
        )}
      </View>

      {/* Status Notice */}
      {timelineResult.status === 'degraded' && (
        <View style={styles.highlightBox}>
          <Text style={styles.smallText}>
            Note: This timeline was generated with limited astrological context. For more detailed month-by-month
            insights, please ensure your birth chart is complete in your profile.
          </Text>
        </View>
      )}

      {/* Month-by-Month Timeline */}
      <SectionHeader title="Month-by-Month Timeline" />
      {timelineResult.events.map((event, idx) => (
        <View key={event.id} style={{ marginBottom: 20, marginTop: idx > 0 ? 15 : 0 }}>
          <View style={styles.highlightBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={[styles.bodyText, { fontWeight: 'bold', fontSize: 14 }]}>
                {event.monthLabel}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.smallText}>
                  {event.intensity.toUpperCase()} INTENSITY
                </Text>
              </View>
            </View>

            <Text style={[styles.bodyText, { fontWeight: 'bold', color: '#D4AF37' }]}>
              Theme: {event.theme}
            </Text>

            <Text style={styles.bodyText}>{event.description}</Text>

            {event.focusAreas.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold' }]}>Focus Areas:</Text>
                <Text style={styles.smallText}>
                  {event.focusAreas.map((area, i) => (
                    <Text key={i}>
                      {area}
                      {i < event.focusAreas.length - 1 ? ' · ' : ''}
                    </Text>
                  ))}
                </Text>
              </View>
            )}

            {event.recommendedActions.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold', color: '#10B981' }]}>
                  Recommended Actions:
                </Text>
                {event.recommendedActions.slice(0, 3).map((action, actionIdx) => (
                  <Text key={actionIdx} style={styles.smallText}>
                    • {action}
                  </Text>
                ))}
              </View>
            )}

            {event.cautions.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold', color: '#F59E0B' }]}>
                  Cautions:
                </Text>
                {event.cautions.slice(0, 2).map((caution, cautionIdx) => (
                  <Text key={cautionIdx} style={styles.smallText}>
                    • {caution}
                  </Text>
                ))}
              </View>
            )}

            {event.astroSignals.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold' }]}>Astrological Influences:</Text>
                {event.astroSignals.map((signal, signalIdx) => (
                  <Text key={signalIdx} style={styles.smallText}>
                    • {signal.label}: {signal.description}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Disclaimers */}
      {timelineResult.disclaimers.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Important Disclaimers</Text>
          {timelineResult.disclaimers.map((disclaimer, idx) => (
            <Text key={idx} style={styles.disclaimer}>
              {disclaimer}
            </Text>
          ))}
        </View>
      )}
    </BaseTemplate>
  )
}


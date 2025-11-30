/**
 * Predictions Report
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Generates PDF report for 12-month predictions
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { BaseTemplate } from './templates/BaseTemplate'
import { SectionHeader } from './templates/SectionHeader'
import { styles } from './templates/PageStyles'
import type { AstroContext } from '@/lib/engines/astro-types'
import type { PredictionEngineResult } from '@/lib/engines/prediction-engine-v2'
import { formatDateForReport } from './pdf-utils'

interface PredictionsReportProps {
  user: {
    name?: string
    email?: string
  }
  astroContext: AstroContext | null
  predictionResult: PredictionEngineResult
}

export function generatePredictionsReportDoc({
  user,
  astroContext,
  predictionResult,
}: PredictionsReportProps) {
  const userName = user.name || 'Seeker'
  const today = new Date()
  const nextYear = new Date(today)
  nextYear.setFullYear(nextYear.getFullYear() + 1)

  return (
    <BaseTemplate
      title="12-Month Prediction Report"
      subtitle="Your Cosmic Forecast for the Next Year"
      userName={userName}
      meta={{
        'Period': `${formatDateForReport(today)} - ${formatDateForReport(nextYear)}`,
        'Status': predictionResult.status === 'degraded' ? 'Limited Context' : 'Full Analysis',
      }}
    >
      {/* Overview */}
      <View>
        <Text style={styles.bodyText}>{predictionResult.overview}</Text>
      </View>

      {/* Status Notice */}
      {predictionResult.status === 'degraded' && (
        <View style={styles.highlightBox}>
          <Text style={styles.smallText}>
            Note: This report was generated with limited astrological context. For more detailed predictions,
            please ensure your birth chart is complete in your profile.
          </Text>
        </View>
      )}

      {/* Sections */}
      {predictionResult.sections.map((section, idx) => (
        <View key={section.id} style={{ marginTop: 20 }}>
          <SectionHeader title={section.title} index={idx + 1} />
          
          <View style={styles.highlightBox}>
            <Text style={styles.bodyText}>{section.summary}</Text>
            {section.score && (
              <Text style={styles.smallText}>
                Intensity Score: {section.score}/10
              </Text>
            )}
            {section.timeframe && (
              <Text style={styles.smallText}>Timeframe: {section.timeframe}</Text>
            )}
          </View>

          {section.opportunities.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.bodyText, { fontWeight: 'bold', color: '#10B981' }]}>
                Opportunities:
              </Text>
              {section.opportunities.map((opp, oppIdx) => (
                <Text key={oppIdx} style={styles.bulletPoint}>
                  • {opp}
                </Text>
              ))}
            </View>
          )}

          {section.cautions.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.bodyText, { fontWeight: 'bold', color: '#F59E0B' }]}>
                Cautions:
              </Text>
              {section.cautions.map((caution, cautionIdx) => (
                <Text key={cautionIdx} style={styles.bulletPoint}>
                  • {caution}
                </Text>
              ))}
            </View>
          )}

          {section.recommendedActions.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.bodyText, { fontWeight: 'bold', color: '#D4AF37' }]}>
                Recommended Actions:
              </Text>
              {section.recommendedActions.map((action, actionIdx) => (
                <Text key={actionIdx} style={styles.bulletPoint}>
                  • {action}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Astro Signals */}
      {predictionResult.astroSignals.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Astrological Signals Influencing This Period" />
          {predictionResult.astroSignals.map((signal, idx) => (
            <View key={idx} style={[styles.highlightBox, { marginBottom: 10 }]}>
              <Text style={[styles.bodyText, { fontWeight: 'bold' }]}>
                {signal.label}
              </Text>
              <Text style={styles.bodyText}>{signal.description}</Text>
              {signal.strength && (
                <Text style={styles.smallText}>
                  Strength: {signal.strength} · Category: {signal.category}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Disclaimers */}
      {predictionResult.disclaimers.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Important Disclaimers</Text>
          {predictionResult.disclaimers.map((disclaimer, idx) => (
            <Text key={idx} style={styles.disclaimer}>
              {disclaimer}
            </Text>
          ))}
        </View>
      )}
    </BaseTemplate>
  )
}


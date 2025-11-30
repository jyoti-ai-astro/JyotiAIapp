/**
 * Kundali Report
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Generates PDF report for Kundali analysis
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { BaseTemplate } from './templates/BaseTemplate'
import { SectionHeader } from './templates/SectionHeader'
import { styles } from './templates/PageStyles'
import type { AstroContext } from '@/lib/engines/astro-types'
import { formatDateForReport } from './pdf-utils'

interface KundaliReportProps {
  user: {
    name?: string
    email?: string
  }
  astroContext: AstroContext
}

export function generateKundaliReportDoc({ user, astroContext }: KundaliReportProps) {
  const userName = user.name || 'Seeker'
  const dobString = astroContext.birthData
    ? formatDateForReport(astroContext.birthData.dateOfBirth)
    : undefined

  return (
    <BaseTemplate
      title="JyotiAI · Full Kundali Report"
      subtitle="Complete Birth Chart Analysis"
      userName={userName}
      dobString={dobString}
      meta={{
        'Generated': new Date().toLocaleDateString(),
        'Report Type': 'Full Kundali Analysis',
      }}
    >
      {/* Page 1: Introduction */}
      <View>
        <Text style={styles.bodyText}>
          Welcome to your comprehensive Kundali report. This document provides detailed insights into your birth chart,
          planetary positions, and their influences on your life path.
        </Text>

        <View style={styles.highlightBox}>
          <Text style={styles.bodyText}>
            <Text style={{ fontWeight: 'bold' }}>How to Read This Report:</Text>
            {'\n\n'}
            • Planetary positions indicate your natural tendencies and strengths
            {'\n'}
            • House placements show areas of life focus
            {'\n'}
            • Dasha periods reveal timing of major life events
            {'\n'}
            • Life themes highlight key areas for growth and attention
          </Text>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={styles.disclaimer}>
            IMPORTANT: This report provides spiritual guidance based on Vedic astrology principles. It is not a substitute
            for medical, legal, or financial advice. These insights are for personal growth and spiritual understanding only.
            We do not predict exact dates of death, provide medical diagnoses, or guarantee financial outcomes.
          </Text>
        </View>
      </View>

      {/* Birth Data Section */}
      <SectionHeader title="Birth Information" index={1} />
      {astroContext.birthData && (
        <View>
          <Text style={styles.bodyText}>
            <Text style={{ fontWeight: 'bold' }}>Date of Birth:</Text> {formatDateForReport(astroContext.birthData.dateOfBirth)}
            {'\n'}
            <Text style={{ fontWeight: 'bold' }}>Time of Birth:</Text> {astroContext.birthData.timeOfBirth}
            {'\n'}
            <Text style={{ fontWeight: 'bold' }}>Place of Birth:</Text> {astroContext.birthData.placeName}
            {'\n'}
            {astroContext.birthData.timezone && (
              <>
                <Text style={{ fontWeight: 'bold' }}>Timezone:</Text> {astroContext.birthData.timezone}
              </>
            )}
          </Text>
        </View>
      )}

      {/* Chart Core Section */}
      <SectionHeader title="Core Chart Elements" index={2} />
      {astroContext.coreChart && (
        <View>
          <Text style={styles.bodyText}>
            <Text style={{ fontWeight: 'bold' }}>Ascendant (Lagna):</Text> {astroContext.coreChart.ascendantSign || 'N/A'}
            {'\n'}
            <Text style={{ fontWeight: 'bold' }}>Sun Sign:</Text> {astroContext.coreChart.sunSign || 'N/A'}
            {'\n'}
            <Text style={{ fontWeight: 'bold' }}>Moon Sign:</Text> {astroContext.coreChart.moonSign || 'N/A'}
          </Text>

          {/* Planetary Positions Table */}
          {astroContext.coreChart.planets && astroContext.coreChart.planets.length > 0 && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.sectionTitle}>Planetary Positions</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableHeaderCell}>Planet</Text>
                  <Text style={styles.tableHeaderCell}>Sign</Text>
                  <Text style={styles.tableHeaderCell}>House</Text>
                  <Text style={styles.tableHeaderCell}>Degree</Text>
                </View>
                {astroContext.coreChart.planets.slice(0, 9).map((planet, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{planet.planet}</Text>
                    <Text style={styles.tableCell}>{planet.sign}</Text>
                    <Text style={styles.tableCell}>{planet.house}</Text>
                    <Text style={styles.tableCell}>
                      {planet.degree?.toFixed(2) || 'N/A'}°
                      {planet.retrograde ? ' (R)' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Dasha Summary Section */}
      <SectionHeader title="Current Dasha Period" index={3} />
      {astroContext.dasha && (
        <View>
          {astroContext.dasha.currentMahadasha && (
            <View style={styles.highlightBox}>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: 'bold' }}>Current Mahadasha:</Text> {astroContext.dasha.currentMahadasha.planet}
                {'\n'}
                <Text style={{ fontWeight: 'bold' }}>Period:</Text>{' '}
                {formatDateForReport(astroContext.dasha.currentMahadasha.startDate)} -{' '}
                {formatDateForReport(astroContext.dasha.currentMahadasha.endDate)}
                {'\n'}
                <Text style={{ fontWeight: 'bold' }}>Theme:</Text> {astroContext.dasha.currentMahadasha.theme || 'Major life period'}
              </Text>
            </View>
          )}

          {astroContext.dasha.currentAntardasha && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: 'bold' }}>Current Antardasha:</Text> {astroContext.dasha.currentAntardasha.planet}
                {'\n'}
                <Text style={{ fontWeight: 'bold' }}>Period:</Text>{' '}
                {formatDateForReport(astroContext.dasha.currentAntardasha.startDate)} -{' '}
                {formatDateForReport(astroContext.dasha.currentAntardasha.endDate)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Life Themes Section */}
      <SectionHeader title="Life Themes" index={4} />
      {astroContext.lifeThemes && astroContext.lifeThemes.length > 0 ? (
        <View>
          {astroContext.lifeThemes.map((theme, idx) => (
            <View key={idx} style={styles.highlightBox}>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{theme.area}:</Text> {theme.summary}
                {'\n'}
                <Text style={styles.smallText}>Confidence: {theme.confidence}%</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.bodyText}>
          Life themes are being calculated based on your chart. Focus areas include career, relationships, health, finances, and spiritual growth.
        </Text>
      )}

      {/* Strengths & Focus Areas */}
      <SectionHeader title="Key Strengths & Focus Areas" index={5} />
      <View>
        {astroContext.personalityTags && astroContext.personalityTags.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.bodyText}>
              <Text style={{ fontWeight: 'bold' }}>Personality Traits:</Text>
            </Text>
            {astroContext.personalityTags.map((tag, idx) => (
              <Text key={idx} style={styles.bulletPoint}>
                • {tag}
              </Text>
            ))}
          </View>
        )}

        {astroContext.riskFlags && astroContext.riskFlags.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.bodyText}>
              <Text style={{ fontWeight: 'bold' }}>Areas to Watch:</Text>
            </Text>
            {astroContext.riskFlags.map((flag, idx) => (
              <Text key={idx} style={styles.bulletPoint}>
                • {flag.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Closing Note */}
      <View style={{ marginTop: 30 }}>
        <Text style={styles.bodyText}>
          This Kundali report is a comprehensive analysis of your birth chart. Use these insights as guidance for personal
          growth and spiritual understanding. Remember that astrology provides possibilities, not certainties, and your free
          will plays a crucial role in shaping your destiny.
        </Text>
      </View>
    </BaseTemplate>
  )
}


/**
 * Base Template
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Base document template with header and footer
 */

import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { styles } from './PageStyles'
import { PageFooter } from './PageFooter'

interface BaseTemplateProps {
  title: string
  subtitle?: string
  userName?: string
  dobString?: string
  meta?: Record<string, string>
  children: React.ReactNode
}

export function BaseTemplate({
  title,
  subtitle,
  userName,
  dobString,
  meta,
  children,
}: BaseTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          {userName && (
            <Text style={styles.smallText}>
              Generated for: {userName}
              {dobString && ` · Born: ${dobString}`}
            </Text>
          )}
          {meta && Object.keys(meta).length > 0 && (
            <View style={{ marginTop: 5 }}>
              {Object.entries(meta).map(([key, value]) => (
                <Text key={key} style={styles.smallText}>
                  {key}: {value}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View>{children}</View>

        {/* Footer */}
        <PageFooter
          disclaimer="These insights are for spiritual guidance only, not absolute certainty. Consult professionals for medical, legal, or financial advice."
        />
      </Page>
    </Document>
  )
}


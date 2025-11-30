/**
 * Page Footer
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Footer component with page number and branding
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from './PageStyles'

interface PageFooterProps {
  pageNumber?: number
  totalPages?: number
  disclaimer?: string
}

export function PageFooter({ pageNumber, totalPages, disclaimer }: PageFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.smallText} render={({ pageNumber: pn, totalPages: tp }) => 
        `${pn && tp ? `Page ${pn} of ${tp}` : ''} · JyotiAI · Spiritual OS · Powered by Guru Brain`
      } />
      {disclaimer && (
        <Text style={styles.disclaimer}>
          {disclaimer}
        </Text>
      )}
    </View>
  )
}


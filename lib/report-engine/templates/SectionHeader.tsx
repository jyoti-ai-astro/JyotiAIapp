/**
 * Section Header
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * Reusable section header component
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from './PageStyles'

interface SectionHeaderProps {
  title: string
  index?: number
  emoji?: string
}

export function SectionHeader({ title, index, emoji }: SectionHeaderProps) {
  const prefix = index !== undefined ? `${index}. ` : emoji ? `${emoji} ` : ''
  
  return (
    <View style={styles.sectionTitle}>
      <Text>{prefix}{title}</Text>
    </View>
  )
}


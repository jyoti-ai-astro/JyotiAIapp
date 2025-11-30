/**
 * Page Styles
 * 
 * Mega Build 3 - Report Engine + PDF Generator
 * StyleSheet for React-PDF components
 */

import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    backgroundColor: '#020617', // Cosmic dark background
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37', // Gold
    borderBottomStyle: 'solid',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37', // Gold
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF', // Gray
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#6B7280', // Dark gray
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#374151', // Dark border
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37', // Gold
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB', // Light gray
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37', // Gold
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },
  bodyText: {
    fontSize: 12,
    color: '#E5E7EB', // Light gray
    lineHeight: 1.6,
    marginBottom: 10,
  },
  smallText: {
    fontSize: 10,
    color: '#9CA3AF', // Gray
    lineHeight: 1.4,
  },
  highlightBox: {
    backgroundColor: '#1F2937', // Dark gray box
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37', // Gold accent
  },
  bulletPoint: {
    fontSize: 12,
    color: '#E5E7EB',
    marginBottom: 5,
    marginLeft: 10,
  },
  table: {
    width: '100%',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#1F2937',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: '#E5E7EB',
    paddingHorizontal: 5,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    color: '#D4AF37', // Gold
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
  badge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    color: '#E5E7EB',
    marginRight: 5,
  },
  disclaimer: {
    fontSize: 9,
    color: '#6B7280', // Dark gray
    fontStyle: 'italic',
    marginTop: 20,
    lineHeight: 1.4,
  },
})


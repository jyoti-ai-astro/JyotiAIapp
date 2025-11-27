/**
 * Report Generator (Structured Output)
 * Part B - Section 6: Reports Engine
 * Milestone 6 - Step 3
 * 
 * Converts prediction output into structured report sections
 */

import type { PredictionReport } from './prediction-engine'

export interface ReportSection {
  title: string
  icon: string
  content: string
  subsections?: Array<{
    title: string
    content: string
  }>
}

export interface StructuredReport {
  type: 'basic' | 'premium' | 'marriage' | 'business' | 'child'
  title: string
  sections: ReportSection[]
  metadata: {
    generatedAt: Date
    includesPalmistry: boolean
    includesAura: boolean
  }
}

/**
 * Generate structured report from predictions
 */
export function generateStructuredReport(
  predictions: PredictionReport,
  type: 'basic' | 'premium' | 'marriage' | 'business' | 'child',
  includePalmistry: boolean = false,
  includeAura: boolean = false
): StructuredReport {
  const sections: ReportSection[] = []

  // Personality Section
  sections.push({
    title: 'Personality Analysis',
    icon: '🌟',
    content: predictions.personality.overview,
    subsections: [
      {
        title: 'Key Traits',
        content: predictions.personality.traits.join(', '),
      },
      {
        title: 'Characteristics',
        content: predictions.personality.characteristics,
      },
    ],
  })

  // Strengths & Weaknesses
  sections.push({
    title: 'Strengths & Weaknesses',
    icon: '⚖️',
    content: '',
    subsections: [
      {
        title: 'Strengths',
        content: predictions.strengths.join('\n• '),
      },
      {
        title: 'Areas for Growth',
        content: predictions.weaknesses.join('\n• '),
      },
    ],
  })

  // Career Section
  sections.push({
    title: 'Career Insights',
    icon: '💼',
    content: predictions.career.insights,
    subsections: [
      {
        title: 'Suitable Fields',
        content: predictions.career.suitableFields.join(', '),
      },
      {
        title: 'Recommendations',
        content: predictions.career.recommendations.join('\n• '),
      },
    ],
  })

  // Love/Marriage Section
  sections.push({
    title: 'Love & Relationships',
    icon: '💕',
    content: predictions.love.insights,
    subsections: [
      {
        title: 'Compatibility',
        content: predictions.love.compatibility,
      },
      {
        title: 'Recommendations',
        content: predictions.love.recommendations.join('\n• '),
      },
    ],
  })

  // Wealth Section
  sections.push({
    title: 'Wealth & Finances',
    icon: '💰',
    content: predictions.wealth.insights,
    subsections: [
      {
        title: 'Opportunities',
        content: predictions.wealth.opportunities.join('\n• '),
      },
      {
        title: 'Precautions',
        content: predictions.wealth.precautions.join('\n• '),
      },
    ],
  })

  // Health Section
  sections.push({
    title: 'Health & Well-being',
    icon: '🏥',
    content: predictions.health.insights,
    subsections: [
      {
        title: 'Physical Health',
        content: predictions.health.recommendations.join('\n• '),
      },
      {
        title: 'Emotional Well-being',
        content: predictions.health.emotional,
      },
    ],
  })

  // Remedies Section
  sections.push({
    title: 'Remedies & Rituals',
    icon: '🕉️',
    content: '',
    subsections: predictions.remedies.map((remedy) => ({
      title: `${remedy.type}: ${remedy.description}`,
      content: `Ritual: ${remedy.ritual}\nTiming: ${remedy.timing}`,
    })),
  })

  // Timeline Section (Premium only)
  if (type === 'premium' || type === 'business') {
    sections.push({
      title: '12-Month Forecast',
      icon: '📅',
      content: '',
      subsections: predictions.timeline.map((item) => ({
        title: `${item.month}: ${item.event}`,
        content: `Significance: ${item.significance}\nRecommendation: ${item.recommendation}`,
      })),
    })
  }

  // Add Palmistry section if included
  if (includePalmistry) {
    sections.push({
      title: 'Palmistry Insights',
      icon: '✋',
      content: 'Your palmistry analysis has been integrated into this report.',
    })
  }

  // Add Aura section if included
  if (includeAura) {
    sections.push({
      title: 'Aura Reading',
      icon: '✨',
      content: 'Your aura analysis has been integrated into this report.',
    })
  }

  return {
    type,
    title: getReportTitle(type),
    sections,
    metadata: {
      generatedAt: new Date(),
      includesPalmistry: includePalmistry,
      includesAura: includeAura,
    },
  }
}

/**
 * Get report title based on type
 */
function getReportTitle(type: string): string {
  const titles: Record<string, string> = {
    basic: 'Basic Astrological Report',
    premium: 'Premium Comprehensive Report',
    marriage: 'Marriage Compatibility Report',
    business: 'Business & Career Report',
    child: 'Child Astrological Report',
  }
  return titles[type] || 'Astrological Report'
}

/**
 * Convert structured report to HTML
 */
export function reportToHTML(report: StructuredReport, userName: string): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${report.title}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #8B4513;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #8B4513;
      margin: 0;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 24px;
      color: #8B4513;
      border-bottom: 2px solid #D4AF37;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .subsection {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    .subsection-title {
      font-weight: bold;
      color: #654321;
      margin-bottom: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${report.title}</h1>
    <p>Generated for: ${userName}</p>
    <p>Date: ${report.metadata.generatedAt.toLocaleDateString()}</p>
  </div>
`

  report.sections.forEach((section) => {
    html += `
  <div class="section">
    <div class="section-title">${section.icon} ${section.title}</div>
    ${section.content ? `<p>${section.content}</p>` : ''}
`

    if (section.subsections) {
      section.subsections.forEach((subsection) => {
        html += `
    <div class="subsection">
      <div class="subsection-title">${subsection.title}</div>
      <div>${subsection.content.replace(/\n/g, '<br>')}</div>
    </div>
`
      })
    }

    html += `
  </div>
`
  })

  html += `
  <div class="footer">
    <p>This report is generated by Jyoti.ai - Your Spiritual Guide</p>
    <p>© ${new Date().getFullYear()} Jyoti.ai. All rights reserved.</p>
  </div>
</body>
</html>
`

  return html
}


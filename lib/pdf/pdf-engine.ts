/**
 * PDF Engine
 * 
 * Phase 3 — Section 39: PAGES PHASE 24 (F39)
 * 
 * Wrapper around pdf-lib for cosmic PDF generation
 */

import { PDFDocument, PDFPage, rgb, PDFFont } from 'pdf-lib';
import { PDFColors, PDFFonts, PDFLayout, PDFWatermark } from './pdf-styles';

export interface PDFTextOptions {
  fontSize?: number;
  font?: PDFFont;
  color?: [number, number, number];
  x: number;
  y: number;
  maxWidth?: number;
}

export interface PDFImageOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
}

export class PDFEngine {
  private doc: PDFDocument;
  private currentPage: PDFPage | null = null;
  private fonts: { [key: string]: PDFFont } = {};
  private yPosition: number = 0;
  private pageHeight: number = PDFLayout.page.height;
  private pageWidth: number = PDFLayout.page.width;
  private marginTop: number = PDFLayout.page.margin.top;
  private marginBottom: number = PDFLayout.page.margin.bottom;
  private marginLeft: number = PDFLayout.page.margin.left;
  private contentWidth: number = PDFLayout.content.width;

  constructor() {
    this.doc = PDFDocument.create();
    this.yPosition = this.pageHeight - this.marginTop;
  }

  /**
   * Initialize fonts
   */
  async initializeFonts(): Promise<void> {
    // Embed standard fonts
    this.fonts.helvetica = await this.doc.embedFont('Helvetica');
    this.fonts.helveticaBold = await this.doc.embedFont('Helvetica-Bold');
  }

  /**
   * Create new PDF document
   */
  static async create(): Promise<PDFEngine> {
    const engine = new PDFEngine();
    await engine.initializeFonts();
    return engine;
  }

  /**
   * Add new page
   */
  addPage(): PDFPage {
    const page = this.doc.addPage([this.pageWidth, this.pageHeight]);
    this.currentPage = page;
    this.yPosition = this.pageHeight - this.marginTop;
    return page;
  }

  /**
   * Get current page (create if needed)
   */
  private getCurrentPage(): PDFPage {
    if (!this.currentPage) {
      return this.addPage();
    }
    return this.currentPage;
  }

  /**
   * Check if we need a new page
   */
  private checkPageBreak(requiredHeight: number): void {
    if (this.yPosition - requiredHeight < this.marginBottom) {
      this.addPage();
    }
  }

  /**
   * Add header
   */
  addHeader(text: string, subtitle?: string): void {
    const page = this.getCurrentPage();
    const font = this.fonts.helveticaBold;
    const fontSize = PDFFonts.title.size;

    // Title
    page.drawText(text, {
      x: this.marginLeft,
      y: this.yPosition,
      size: fontSize,
      font: font,
      color: rgb(
        parseInt(PDFColors.gold.slice(1, 3), 16) / 255,
        parseInt(PDFColors.gold.slice(3, 5), 16) / 255,
        parseInt(PDFColors.gold.slice(5, 7), 16) / 255,
      ),
    });

    this.yPosition -= fontSize + 10;

    // Subtitle
    if (subtitle) {
      const subtitleFont = this.fonts.helvetica;
      const subtitleSize = PDFFonts.subtitle.size;
      page.drawText(subtitle, {
        x: this.marginLeft,
        y: this.yPosition,
        size: subtitleSize,
        font: subtitleFont,
        color: rgb(0.8, 0.8, 0.8),
      });
      this.yPosition -= subtitleSize + 20;
    } else {
      this.yPosition -= 20;
    }
  }

  /**
   * Add footer
   */
  addFooter(text: string): void {
    const page = this.getCurrentPage();
    const font = this.fonts.helvetica;
    const fontSize = PDFFonts.small.size;

    page.drawText(text, {
      x: this.marginLeft,
      y: this.marginBottom - 20,
      size: fontSize,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  /**
   * Add mandala watermark
   */
  async addMandalaWatermark(imagePath?: string): Promise<void> {
    const page = this.getCurrentPage();
    
    // For now, draw a simple circle as placeholder
    // In production, load actual mandala image
    const centerX = PDFWatermark.position.x;
    const centerY = PDFWatermark.position.y;
    const radius = PDFWatermark.size / 2;

    // Draw watermark circle
    page.drawCircle({
      x: centerX,
      y: centerY,
      size: radius,
      color: rgb(
        parseInt(PDFColors.gold.slice(1, 3), 16) / 255,
        parseInt(PDFColors.gold.slice(3, 5), 16) / 255,
        parseInt(PDFColors.gold.slice(5, 7), 16) / 255,
      ),
      opacity: PDFWatermark.opacity,
    });
  }

  /**
   * Add section title
   */
  addSectionTitle(text: string, icon?: string): void {
    this.checkPageBreak(40);
    const page = this.getCurrentPage();
    const font = this.fonts.helveticaBold;
    const fontSize = PDFFonts.sectionTitle.size;

    const titleText = icon ? `${icon} ${text}` : text;

    page.drawText(titleText, {
      x: this.marginLeft,
      y: this.yPosition,
      size: fontSize,
      font: font,
      color: rgb(
        parseInt(PDFColors.gold.slice(1, 3), 16) / 255,
        parseInt(PDFColors.gold.slice(3, 5), 16) / 255,
        parseInt(PDFColors.gold.slice(5, 7), 16) / 255,
      ),
    });

    this.yPosition -= fontSize + 10;

    // Add divider line
    page.drawLine({
      start: { x: this.marginLeft, y: this.yPosition },
      end: { x: this.marginLeft + this.contentWidth, y: this.yPosition },
      thickness: PDFLayout.section.dividerHeight,
      color: rgb(
        parseInt(PDFColors.gold.slice(1, 3), 16) / 255,
        parseInt(PDFColors.gold.slice(3, 5), 16) / 255,
        parseInt(PDFColors.gold.slice(5, 7), 16) / 255,
      ),
      opacity: 0.5,
    });

    this.yPosition -= 15;
  }

  /**
   * Add paragraph
   */
  addParagraph(text: string, options?: { fontSize?: number; color?: [number, number, number] }): void {
    this.checkPageBreak(30);
    const page = this.getCurrentPage();
    const font = this.fonts.helvetica;
    const fontSize = options?.fontSize || PDFFonts.body.size;
    const color = options?.color || [1, 1, 1];

    // Simple text wrapping (basic implementation)
    const words = text.split(' ');
    let line = '';
    let lineY = this.yPosition;

    words.forEach((word) => {
      const testLine = line + word + ' ';
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > this.contentWidth && line.length > 0) {
        page.drawText(line, {
          x: this.marginLeft,
          y: lineY,
          size: fontSize,
          font: font,
          color: rgb(color[0], color[1], color[2]),
        });
        line = word + ' ';
        lineY -= fontSize * PDFLayout.content.lineSpacing;
        
        // Check if we need a new page
        if (lineY < this.marginBottom) {
          this.addPage();
          lineY = this.yPosition;
        }
      } else {
        line = testLine;
      }
    });

    // Draw remaining text
    if (line.length > 0) {
      page.drawText(line, {
        x: this.marginLeft,
        y: lineY,
        size: fontSize,
        font: font,
        color: rgb(color[0], color[1], color[2]),
      });
      this.yPosition = lineY - fontSize * PDFLayout.content.lineSpacing - 10;
    }
  }

  /**
   * Add image
   */
  async addImage(imageBytes: Uint8Array, options: PDFImageOptions): Promise<void> {
    this.checkPageBreak(options.height + 20);
    const page = this.getCurrentPage();
    
    try {
      // Try to embed as PNG/JPG image
      const image = await this.doc.embedPng(imageBytes).catch(() => 
        this.doc.embedJpg(imageBytes).catch(() => null)
      );
      
      if (image) {
        page.drawImage(image, {
          x: options.x,
          y: options.y,
          width: options.width,
          height: options.height,
          opacity: options.opacity || 1,
        });
      } else {
        // Fallback: draw placeholder rectangle
        page.drawRectangle({
          x: options.x,
          y: options.y,
          width: options.width,
          height: options.height,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
          opacity: options.opacity || 1,
        });
      }
      
      this.yPosition -= options.height + 20;
    } catch (error) {
      console.error('Failed to embed image:', error);
      // Draw placeholder
      page.drawRectangle({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1,
      });
      this.yPosition -= options.height + 20;
    }
  }

  /**
   * Add chakra bars
   */
  addChakraBars(chakras: Array<{ name: string; strength: number }>): void {
    this.checkPageBreak(chakras.length * 40 + 20);
    const page = this.getCurrentPage();
    const font = this.fonts.helvetica;
    const fontSize = PDFFonts.body.size;
    const barWidth = 200;
    const barHeight = 15;
    const startY = this.yPosition;

    chakras.forEach((chakra, index) => {
      const yPos = startY - (index * 40);
      const chakraColor = PDFColors.chakras[chakra.name.toLowerCase().replace(' ', '') as keyof typeof PDFColors.chakras] || PDFColors.gold;
      const colorRgb = [
        parseInt(chakraColor.slice(1, 3), 16) / 255,
        parseInt(chakraColor.slice(3, 5), 16) / 255,
        parseInt(chakraColor.slice(5, 7), 16) / 255,
      ] as [number, number, number];

      // Chakra name
      page.drawText(chakra.name, {
        x: this.marginLeft,
        y: yPos,
        size: fontSize,
        font: font,
        color: rgb(1, 1, 1),
      });

      // Bar background
      page.drawRectangle({
        x: this.marginLeft + 100,
        y: yPos - 5,
        width: barWidth,
        height: barHeight,
        borderColor: rgb(0.3, 0.3, 0.3),
        borderWidth: 1,
      });

      // Bar fill
      const fillWidth = (chakra.strength / 10) * barWidth;
      page.drawRectangle({
        x: this.marginLeft + 100,
        y: yPos - 5,
        width: fillWidth,
        height: barHeight,
        color: rgb(colorRgb[0], colorRgb[1], colorRgb[2]),
      });

      // Strength value
      page.drawText(`${chakra.strength}/10`, {
        x: this.marginLeft + 100 + barWidth + 10,
        y: yPos,
        size: fontSize,
        font: font,
        color: rgb(0.8, 0.8, 0.8),
      });
    });

    this.yPosition = startY - (chakras.length * 40) - 20;
  }

  /**
   * Add timeline grid
   */
  addTimelineGrid(months: Array<{ month: string; energy: number; color: string }>): void {
    this.checkPageBreak(months.length * 30 + 40);
    const page = this.getCurrentPage();
    const font = this.fonts.helvetica;
    const fontSize = PDFFonts.body.size;
    const startY = this.yPosition;

    months.forEach((month, index) => {
      const yPos = startY - (index * 30);
      
      // Month name
      page.drawText(month.month, {
        x: this.marginLeft,
        y: yPos,
        size: fontSize,
        font: font,
        color: rgb(1, 1, 1),
      });

      // Energy bar
      const barWidth = 150;
      const barHeight = 10;
      const fillWidth = (month.energy / 10) * barWidth;
      
      const colorRgb = month.color === 'gold' 
        ? [parseInt(PDFColors.gold.slice(1, 3), 16) / 255, parseInt(PDFColors.gold.slice(3, 5), 16) / 255, parseInt(PDFColors.gold.slice(5, 7), 16) / 255]
        : month.color === 'violet'
        ? [parseInt(PDFColors.violet.slice(1, 3), 16) / 255, parseInt(PDFColors.violet.slice(3, 5), 16) / 255, parseInt(PDFColors.violet.slice(5, 7), 16) / 255]
        : [1, 0, 0];

      page.drawRectangle({
        x: this.marginLeft + 80,
        y: yPos - 5,
        width: fillWidth,
        height: barHeight,
        color: rgb(colorRgb[0], colorRgb[1], colorRgb[2]),
      });

      // Energy value
      page.drawText(`${month.energy.toFixed(1)}/10`, {
        x: this.marginLeft + 80 + barWidth + 10,
        y: yPos,
        size: fontSize,
        font: font,
        color: rgb(0.8, 0.8, 0.8),
      });
    });

    this.yPosition = startY - (months.length * 30) - 20;
  }

  /**
   * Generate PDF bytes
   */
  async generatePDF(): Promise<Uint8Array> {
    return await this.doc.save();
  }
}


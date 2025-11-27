/**
 * Cosmic Content Section Component
 * 
 * Phase 3 — Section 22: PAGES PHASE 7 (F22)
 * 
 * Container for multiple content blocks with dividers
 */

'use client';

import React from 'react';
import { CosmicContentBlock, CosmicContentBlockProps } from './CosmicContentBlock';
import { CosmicSectionDivider } from './CosmicSectionDivider';

export interface ContentBlockData extends Omit<CosmicContentBlockProps, 'delay'> {
  id: string;
}

export interface CosmicContentSectionProps {
  /** Content blocks to display */
  blocks: ContentBlockData[];
  
  /** Show dividers between blocks */
  showDividers?: boolean;
  
  /** Additional className */
  className?: string;
}

export function CosmicContentSection({
  blocks,
  showDividers = true,
  className = '',
}: CosmicContentSectionProps) {
  return (
    <section className={`relative ${className}`}>
      {blocks.map((block, index) => (
        <React.Fragment key={block.id}>
          <CosmicContentBlock
            {...block}
            delay={index * 0.2}
          />
          {showDividers && index < blocks.length - 1 && (
            <CosmicSectionDivider />
          )}
        </React.Fragment>
      ))}
    </section>
  );
}


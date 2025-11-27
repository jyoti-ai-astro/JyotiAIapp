/**
 * DashaTree Organism
 * 
 * Phase 3 — Section 3.5: Dasha Engine Organism
 * Display major, minor, sub-minor dashas in tree structure
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface DashaNode {
  id: string;
  planet: string;
  startDate: string;
  endDate: string;
  level: 'major' | 'minor' | 'sub-minor';
  children?: DashaNode[];
  active?: boolean;
}

export interface DashaTreeProps {
  /** Root dasha nodes */
  dashas: DashaNode[];
  
  /** Custom class */
  className?: string;
}

const DashaNodeComponent: React.FC<{
  node: DashaNode;
  level: number;
  onToggle: (id: string) => void;
  expanded: Set<string>;
}> = ({ node, level, onToggle, expanded }) => {
  const [isExpanded, setIsExpanded] = useState(expanded.has(node.id));
  const hasChildren = node.children && node.children.length > 0;
  
  const levelColors = {
    major: '#9D4EDD',
    minor: '#7B2CBF',
    'sub-minor': '#493B8A',
  };
  
  return (
    <div className="space-y-2">
      <motion.div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg',
          'bg-white/5 border border-white/10',
          node.active && 'bg-white/10 border-[#F4CE65]/50',
          'hover:bg-white/10 transition-colors',
          hasChildren && 'cursor-pointer'
        )}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
            onToggle(node.id);
          }
        }}
        whileHover={{ x: 4 }}
        style={{
          marginLeft: `${level * 20}px`,
          borderLeft: `3px solid ${levelColors[node.level]}`,
        }}
        animate={
          node.active
            ? {
                boxShadow: [
                  '0 0 0px rgba(244,206,101,0)',
                  '0 0 16px rgba(244,206,101,0.4)',
                  '0 0 8px rgba(244,206,101,0.2)',
                ],
              }
            : {}
        }
        transition={{ duration: 0.4, repeat: node.active ? Infinity : 0, repeatDelay: 1 }}
      >
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon size="sm" className="w-4 h-4 text-white/60">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </Icon>
          </motion.div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{node.planet}</span>
            <Badge
              size="sm"
              style={{
                backgroundColor: `${levelColors[node.level]}20`,
                borderColor: `${levelColors[node.level]}40`,
                color: levelColors[node.level],
              }}
            >
              {node.level}
            </Badge>
            {node.active && (
              <Badge variant="premium" size="sm">
                Active
              </Badge>
            )}
          </div>
          <div className="text-xs text-white/60">
            {node.startDate} - {node.endDate}
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {node.children!.map((child) => (
              <DashaNodeComponent
                key={child.id}
                node={child}
                level={level + 1}
                onToggle={onToggle}
                expanded={expanded}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DashaTree: React.FC<DashaTreeProps> = ({
  dashas,
  className,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  
  const handleToggle = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };
  
  return (
    <Card variant="gradient" className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-white">Dasha Timeline</h3>
      
      <div className="space-y-2">
        {dashas.map((dasha) => (
          <DashaNodeComponent
            key={dasha.id}
            node={dasha}
            level={0}
            onToggle={handleToggle}
            expanded={expanded}
          />
        ))}
      </div>
    </Card>
  );
};


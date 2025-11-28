#!/usr/bin/env node

/**
 * Check for firebase-admin imports in client-side files
 * 
 * This script ensures firebase-admin is only used in:
 * - app/api routes (API routes)
 * - Server-side utilities
 * 
 * And NOT in:
 * - Components ('use client')
 * - Hooks
 * - Cosmos/Postfx
 * - Client-side utils
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const projectRoot = process.cwd();

// Directories to check (client-side)
const clientDirs = [
  'components',
  'hooks',
  'cosmos',
  'postfx',
  'providers',
  'store',
];

// Directories to exclude (server-side only)
const serverDirs = [
  'app/api',
  'lib/services',
  'lib/workers',
  'lib/admin',
  'lib/logging',
  'lib/security',
  'scripts',
];

// Files to check
const filesToCheck = [];

function walkDir(dir, baseDir = '') {
  const fullPath = join(projectRoot, baseDir, dir);
  
  try {
    const entries = readdirSync(fullPath);
    
    for (const entry of entries) {
      const entryPath = join(fullPath, entry);
      const relativePath = join(baseDir, dir, entry);
      const stat = statSync(entryPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (entry.startsWith('.') || entry === 'node_modules') {
          continue;
        }
        
        // Check if this is a server-only directory
        const isServerDir = serverDirs.some(serverDir => 
          relativePath.startsWith(serverDir)
        );
        
        if (!isServerDir) {
          walkDir(entry, join(baseDir, dir));
        }
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          // Skip API routes
          if (!relativePath.startsWith('app/api')) {
            filesToCheck.push(relativePath);
          }
        }
      }
    }
  } catch (error) {
    // Skip if directory doesn't exist or can't be read
  }
}

// Walk client directories
for (const dir of clientDirs) {
  walkDir(dir);
}

// Check app directory (excluding API routes)
walkDir('app');

// Check for firebase-admin imports
const violations = [];

for (const file of filesToCheck) {
  const fullPath = join(projectRoot, file);
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    
    // Check if it's a client component
    const isClient = content.includes("'use client'") || content.includes('"use client"');
    
    // Check for firebase-admin imports
    const hasAdminImport = /from\s+['"]firebase-admin|import\s+.*\s+from\s+['"]firebase-admin|from\s+['"]@\/lib\/firebase\/admin|import\s+.*\s+from\s+['"]@\/lib\/firebase\/admin/.test(content);
    
    if (hasAdminImport) {
      violations.push({
        file,
        isClient,
        reason: isClient 
          ? 'Client component importing firebase-admin' 
          : 'Non-API file importing firebase-admin',
      });
    }
  } catch (error) {
    // Skip if file can't be read
  }
}

// Report results
if (violations.length > 0) {
  console.error('❌ Found firebase-admin imports in client-side files:\n');
  violations.forEach(({ file, reason }) => {
    console.error(`  - ${file}`);
    console.error(`    Reason: ${reason}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ No firebase-admin imports found in client-side files');
  process.exit(0);
}


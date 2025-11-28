#!/usr/bin/env node

/**
 * Convert Firebase Private Key from escaped \n format to multiline PEM
 * 
 * This script helps convert FIREBASE_ADMIN_PRIVATE_KEY from:
 * "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
 * 
 * To proper multiline format:
 * -----BEGIN PRIVATE KEY-----
 * MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
 * -----END PRIVATE KEY-----
 * 
 * Usage:
 *   node scripts/convert-firebase-key.mjs
 * 
 * Or with environment variable:
 *   FIREBASE_ADMIN_PRIVATE_KEY="..." node scripts/convert-firebase-key.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env.local if it exists
const envLocalPath = join(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

// Get the private key from environment
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

if (!privateKey) {
  console.error('❌ FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_PRIVATE_KEY not found in environment');
  console.error('\nPlease set the environment variable:');
  console.error('  export FIREBASE_ADMIN_PRIVATE_KEY="your-key-here"');
  console.error('\nOr run:');
  console.error('  FIREBASE_ADMIN_PRIVATE_KEY="your-key" node scripts/convert-firebase-key.mjs');
  process.exit(1);
}

console.log('📋 Original Key (first 50 chars, masked):');
console.log(`   ${privateKey.substring(0, 50)}...${privateKey.substring(privateKey.length - 30)}`);
console.log(`   Length: ${privateKey.length} characters\n`);

// Check if it contains escaped newlines
const hasEscapedNewlines = privateKey.includes('\\n');
const hasRealNewlines = privateKey.includes('\n') && !privateKey.includes('\\n');

console.log('🔍 Analysis:');
console.log(`   Contains escaped \\n: ${hasEscapedNewlines ? '✅ YES' : '❌ NO'}`);
console.log(`   Contains real newlines: ${hasRealNewlines ? '✅ YES' : '❌ NO'}\n`);

// Convert escaped newlines to real newlines
let convertedKey = privateKey;
if (hasEscapedNewlines) {
  console.log('🔄 Converting escaped \\n to real newlines...\n');
  convertedKey = privateKey.replace(/\\n/g, '\n');
}

// Ensure proper PEM format
if (!convertedKey.includes('-----BEGIN PRIVATE KEY-----')) {
  console.error('❌ Key does not contain "-----BEGIN PRIVATE KEY-----"');
  console.error('   This may not be a valid PEM private key');
  process.exit(1);
}

if (!convertedKey.includes('-----END PRIVATE KEY-----')) {
  console.error('❌ Key does not contain "-----END PRIVATE KEY-----"');
  console.error('   This may not be a valid PEM private key');
  process.exit(1);
}

// Extract and format the key
const beginMarker = '-----BEGIN PRIVATE KEY-----';
const endMarker = '-----END PRIVATE KEY-----';

const beginIndex = convertedKey.indexOf(beginMarker);
const endIndex = convertedKey.indexOf(endMarker);

if (beginIndex === -1 || endIndex === -1) {
  console.error('❌ Could not find BEGIN/END markers in key');
  process.exit(1);
}

const keyContent = convertedKey.substring(beginIndex + beginMarker.length, endIndex).trim();
const formattedKey = `${beginMarker}\n${keyContent}\n${endMarker}`;

console.log('✅ Converted Key (multiline format):');
console.log('─'.repeat(60));
console.log(formattedKey);
console.log('─'.repeat(60));
console.log(`\n📏 Formatted key length: ${formattedKey.length} characters`);
console.log(`   Lines: ${formattedKey.split('\n').length}\n`);

// Show Vercel format
console.log('📝 For Vercel Environment Variable:');
console.log('─'.repeat(60));
console.log('Copy the entire formatted key above (including BEGIN/END markers)');
console.log('and paste it into Vercel Environment Variables as:');
console.log('\n  Variable Name: FIREBASE_ADMIN_PRIVATE_KEY');
console.log('  Value: (paste the multiline key above)\n');
console.log('⚠️  Important:');
console.log('   - Vercel supports multiline values');
console.log('   - Make sure BEGIN and END markers are on separate lines');
console.log('   - Do NOT escape the newlines');
console.log('   - The key should look exactly like the formatted output above\n');

// Generate a single-line escaped version (for reference, but not recommended)
const singleLineEscaped = formattedKey.replace(/\n/g, '\\n');
console.log('📌 Single-line escaped version (for reference only):');
console.log('─'.repeat(60));
console.log('⚠️  This format works but multiline is preferred in Vercel');
console.log(`   ${singleLineEscaped.substring(0, 80)}...`);
console.log('─'.repeat(60));


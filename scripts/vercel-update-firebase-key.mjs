#!/usr/bin/env node

/**
 * Vercel Firebase Key Update Script
 * 
 * This script helps update FIREBASE_ADMIN_PRIVATE_KEY in Vercel
 * by converting escaped \n to multiline format.
 * 
 * Prerequisites:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Login: vercel login
 * 3. Link project: vercel link (or set VERCEL_PROJECT_ID and VERCEL_ORG_ID)
 * 
 * Usage:
 *   node scripts/vercel-update-firebase-key.mjs
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_NAME = 'jyoti-a-iapp';
const ENV_VAR_NAME = 'FIREBASE_ADMIN_PRIVATE_KEY';

console.log('🔍 Checking Vercel CLI...\n');

// Check if vercel CLI is available
try {
  const version = execSync('npx vercel --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ Vercel CLI: ${version}\n`);
} catch (error) {
  console.error('❌ Vercel CLI not found. Please install it:');
  console.error('   npm i -g vercel');
  console.error('   vercel login');
  process.exit(1);
}

console.log('📋 Instructions for updating FIREBASE_ADMIN_PRIVATE_KEY in Vercel:\n');
console.log('─'.repeat(70));
console.log('\n1. Get the current key value:');
console.log('   npx vercel env pull .env.vercel');
console.log('   cat .env.vercel | grep FIREBASE_ADMIN_PRIVATE_KEY\n');

console.log('\n2. Check if it contains escaped \\n:');
console.log('   If the key looks like: "-----BEGIN PRIVATE KEY-----\\nMII...\\n-----END PRIVATE KEY-----"');
console.log('   Then it needs to be converted to multiline format.\n');

console.log('\n3. Convert the key using our script:');
console.log('   node scripts/convert-firebase-key.mjs\n');

console.log('\n4. Update in Vercel Dashboard:');
console.log('   a. Go to: https://vercel.com/jyoti-ais-projects/jyoti-a-iapp/settings/environment-variables');
console.log('   b. Find FIREBASE_ADMIN_PRIVATE_KEY');
console.log('   c. Click Edit');
console.log('   d. Paste the multiline format from step 3');
console.log('   e. Make sure BEGIN and END markers are on separate lines');
console.log('   f. Save\n');

console.log('\n5. Or use Vercel CLI (if authenticated):');
console.log('   # First, get the formatted key');
console.log('   export FIREBASE_ADMIN_PRIVATE_KEY="your-key-here"');
console.log('   node scripts/convert-firebase-key.mjs');
console.log('   # Then copy the formatted output and use:');
console.log('   npx vercel env add FIREBASE_ADMIN_PRIVATE_KEY production');
console.log('   # Paste the multiline key when prompted\n');

console.log('\n6. Redeploy:');
console.log('   npx vercel --prod');
console.log('   # Or trigger via GitHub push\n');

console.log('─'.repeat(70));
console.log('\n⚠️  Note: Vercel CLI environment variable management requires authentication.');
console.log('   For security, it\'s recommended to update via Vercel Dashboard.\n');

// Try to check if project is linked
try {
  const projectJsonPath = join(process.cwd(), '.vercel', 'project.json');
  if (existsSync(projectJsonPath)) {
    const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
    console.log('✅ Vercel project linked:');
    console.log(`   Project ID: ${projectJson.projectId}`);
    console.log(`   Org ID: ${projectJson.orgId}\n`);
  } else {
    console.log('ℹ️  Project not linked. Run: vercel link\n');
  }
} catch (error) {
  // Ignore
}


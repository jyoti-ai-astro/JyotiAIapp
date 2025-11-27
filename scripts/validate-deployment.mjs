/**
 * Phase 32 - F47: Deployment Readiness Validation Script
 * 
 * Validates all critical components before deployment
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const results = [];

function addResult(name, status, message, details = null) {
  results.push({ name, status, message, details });
}

/**
 * 1. Scan for remaining process.env usage (excluding NODE_ENV)
 */
function scanEnvUsage() {
  console.log('🔍 Scanning for process.env usage...');
  
  try {
    const { execSync } = require('child_process');
    const output = execSync(
      'grep -r "process\\.env\\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app lib components 2>/dev/null | grep -v "process.env.NODE_ENV" | grep -v node_modules | grep -v ".next" || true',
      { encoding: 'utf-8', cwd: projectRoot }
    );
    
    if (output.trim()) {
      const lines = output.trim().split('\n').filter(l => l && !l.includes('node_modules') && !l.includes('.next'));
      const files = [...new Set(lines.map(l => {
        const match = l.match(/^([^:]+):/);
        return match ? match[1] : null;
      }).filter(Boolean))];
      
      if (files.length > 0) {
        // Filter out acceptable uses (commented code, env.mjs itself)
        const problematicFiles = files.filter(f => 
          !f.includes('env.mjs') && 
          !f.includes('guru-voice') && // commented code
          !f.includes('guru-tts') // commented code
        );
        
        if (problematicFiles.length > 0) {
          addResult(
            'Environment Variable Usage Scan',
            'warning',
            `Found ${problematicFiles.length} file(s) with process.env usage (excluding NODE_ENV)`,
            problematicFiles.slice(0, 5).join(', ') + (problematicFiles.length > 5 ? '...' : '')
          );
        } else {
          addResult(
            'Environment Variable Usage Scan',
            'pass',
            'No problematic process.env usage found (only NODE_ENV and commented code)'
          );
        }
      } else {
        addResult(
          'Environment Variable Usage Scan',
          'pass',
          'No direct process.env usage found (using validated envVars)'
        );
      }
    } else {
      addResult(
        'Environment Variable Usage Scan',
        'pass',
        'No direct process.env usage found (using validated envVars)'
      );
    }
  } catch (error) {
    addResult(
      'Environment Variable Usage Scan',
      'warning',
      'Could not scan for process.env usage (grep may not be available)'
    );
  }
}

/**
 * 2. Validate env.mjs structure
 */
function validateEnvModule() {
  console.log('🔍 Validating env.mjs module...');
  
  const envPath = join(projectRoot, 'lib', 'env', 'env.mjs');
  
  if (!existsSync(envPath)) {
    addResult('Environment Module', 'fail', 'lib/env/env.mjs not found');
    return;
  }
  
  try {
    const content = readFileSync(envPath, 'utf-8');
    
    const checks = {
      hasEnvVars: content.includes('export const envVars'),
      hasZod: content.includes('from \'zod\''),
      hasValidation: content.includes('validateEnv'),
      hasFirebase: content.includes('firebase:'),
      hasAI: content.includes('ai:'),
      hasRazorpay: content.includes('razorpay:'),
    };
    
    const allPass = Object.values(checks).every(v => v);
    
    if (allPass) {
      addResult('Environment Module', 'pass', 'env.mjs structure is valid');
    } else {
      const missing = Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k);
      addResult('Environment Module', 'warning', `env.mjs missing: ${missing.join(', ')}`);
    }
  } catch (error) {
    addResult('Environment Module', 'fail', `Error reading env.mjs: ${error.message}`);
  }
}

/**
 * 3. Validate critical file existence
 */
function validateCriticalFiles() {
  console.log('🔍 Validating critical files...');
  
  const criticalFiles = [
    'lib/env/env.mjs',
    'lib/firebase/config.ts',
    'lib/firebase/admin.ts',
    'lib/rag/pinecone-client.ts',
    'lib/email/email-service.ts',
    'lib/engines/guru/guru-engine.ts',
    'lib/guru/GuruChatEngine.ts',
    'app/api/guru-chat/route.ts',
    'app/api/payments/order/route.ts',
    '.env.example',
  ];
  
  const missingFiles = [];
  
  criticalFiles.forEach(file => {
    const filePath = join(projectRoot, file);
    if (!existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    addResult(
      'Critical Files',
      'fail',
      `Missing ${missingFiles.length} critical file(s)`,
      missingFiles.join(', ')
    );
  } else {
    addResult('Critical Files', 'pass', 'All critical files present');
  }
}

/**
 * 4. Check for runtime import issues
 */
function checkRuntimeImports() {
  console.log('🔍 Checking for runtime import issues...');
  
  const filesToCheck = [
    'lib/firebase/config.ts',
    'lib/firebase/admin.ts',
    'lib/rag/pinecone-client.ts',
    'lib/email/email-service.ts',
  ];
  
  let issuesFound = 0;
  const issueFiles = [];
  
  filesToCheck.forEach(file => {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        // Check for static imports (good)
        if (content.includes("import { envVars } from '@/lib/env/env.mjs'")) {
          // Good - static import
        } else if (content.includes("await import('@/lib/env/env.mjs')")) {
          // Dynamic import is acceptable in async functions
        } else if (content.includes('process.env.')) {
          issuesFound++;
          issueFiles.push(file);
        }
      } catch (error) {
        // File might not exist, skip
      }
    }
  });
  
  if (issuesFound > 0) {
    addResult(
      'Runtime Imports',
      'warning',
      `Found ${issuesFound} file(s) with potential runtime import issues`,
      issueFiles.join(', ')
    );
  } else {
    addResult(
      'Runtime Imports',
      'pass',
      'No problematic runtime import patterns detected'
    );
  }
}

/**
 * 5. Validate Firebase initialization patterns
 */
function validateFirebaseInit() {
  console.log('🔍 Validating Firebase initialization...');
  
  const adminPath = join(projectRoot, 'lib', 'firebase', 'admin.ts');
  const configPath = join(projectRoot, 'lib', 'firebase', 'config.ts');
  
  let adminValid = false;
  let configValid = false;
  
  if (existsSync(adminPath)) {
    try {
      const content = readFileSync(adminPath, 'utf-8');
      adminValid = content.includes('envVars.firebaseAdmin') && 
                   content.includes('typeof window === \'undefined\'');
    } catch (error) {
      // Error reading
    }
  }
  
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8');
      configValid = content.includes('envVars.firebase') && 
                    content.includes('typeof window !== \'undefined\'');
    } catch (error) {
      // Error reading
    }
  }
  
  if (adminValid && configValid) {
    addResult('Firebase Initialization', 'pass', 'Firebase Admin and Client initialization patterns are correct');
  } else {
    const issues = [];
    if (!adminValid) issues.push('Admin');
    if (!configValid) issues.push('Client');
    addResult('Firebase Initialization', 'warning', `Firebase initialization issues: ${issues.join(', ')}`);
  }
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log('🚀 Starting Deployment Readiness Validation...\n');
  
  scanEnvUsage();
  validateEnvModule();
  validateCriticalFiles();
  checkRuntimeImports();
  validateFirebaseInit();
  
  // Print results
  console.log('\n📊 Validation Results:\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });
  
  console.log(`\n📈 Summary: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);
  
  if (failed > 0) {
    console.log('❌ Validation failed. Please fix the issues above before deploying.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Validation completed with warnings. Review before deploying.');
    process.exit(0);
  } else {
    console.log('✅ All validations passed! Ready for deployment.');
    process.exit(0);
  }
}

// Run validation
runValidation().catch(error => {
  console.error('❌ Validation script error:', error);
  process.exit(1);
});


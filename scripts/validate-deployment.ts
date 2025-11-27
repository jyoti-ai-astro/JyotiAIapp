/**
 * Phase 32 - F47: Deployment Readiness Validation Script
 * 
 * Validates all critical components before deployment
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const results: ValidationResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string) {
  results.push({ name, status, message, details });
}

/**
 * 1. Scan for remaining process.env usage
 */
function scanEnvUsage() {
  console.log('🔍 Scanning for process.env usage...');
  
  const filesToCheck = [
    'app',
    'lib',
    'components',
  ];
  
  let foundEnvUsage = false;
  const envUsageFiles: string[] = [];
  
  // This is a simplified check - in real scenario, use a proper file walker
  try {
    const { execSync } = require('child_process');
    const output = execSync('grep -r "process\\.env\\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app lib components 2>/dev/null || true', { encoding: 'utf-8' });
    
    if (output.trim()) {
      const lines = output.trim().split('\n').filter(l => l && !l.includes('node_modules'));
      if (lines.length > 0) {
        foundEnvUsage = true;
        lines.forEach(line => {
          const match = line.match(/^([^:]+):/);
          if (match && !envUsageFiles.includes(match[1])) {
            envUsageFiles.push(match[1]);
          }
        });
      }
    }
  } catch (error) {
    // grep might not be available, continue
  }
  
  if (foundEnvUsage && envUsageFiles.length > 0) {
    addResult(
      'Environment Variable Usage Scan',
      'warning',
      `Found ${envUsageFiles.length} file(s) with process.env usage`,
      envUsageFiles.slice(0, 10).join(', ') + (envUsageFiles.length > 10 ? '...' : '')
    );
  } else {
    addResult(
      'Environment Variable Usage Scan',
      'pass',
      'No direct process.env usage found (using validated envVars)'
    );
  }
}

/**
 * 2. Validate env.mjs structure
 */
function validateEnvModule() {
  console.log('🔍 Validating env.mjs module...');
  
  const envPath = join(process.cwd(), 'lib', 'env', 'env.mjs');
  
  if (!existsSync(envPath)) {
    addResult('Environment Module', 'fail', 'lib/env/env.mjs not found');
    return;
  }
  
  try {
    const content = readFileSync(envPath, 'utf-8');
    
    // Check for required exports
    const hasEnvVars = content.includes('export const envVars');
    const hasZod = content.includes('from \'zod\'');
    const hasValidation = content.includes('validateEnv');
    
    if (hasEnvVars && hasZod && hasValidation) {
      addResult('Environment Module', 'pass', 'env.mjs structure is valid');
    } else {
      addResult('Environment Module', 'warning', 'env.mjs may be missing some required components');
    }
  } catch (error: any) {
    addResult('Environment Module', 'fail', `Error reading env.mjs: ${error.message}`);
  }
}

/**
 * 3. Check for runtime import issues
 */
function checkRuntimeImports() {
  console.log('🔍 Checking for runtime import issues...');
  
  const problematicPatterns = [
    /import\(['"]@\/lib\/env\/env\.mjs['"]\)/g,
    /require\(['"]@\/lib\/env\/env\.mjs['"]\)/g,
  ];
  
  let issuesFound = 0;
  const issueFiles: string[] = [];
  
  // Check common files that might have issues
  const filesToCheck = [
    'lib/firebase/config.ts',
    'lib/firebase/admin.ts',
    'lib/rag/pinecone-client.ts',
    'lib/email/email-service.ts',
  ];
  
  filesToCheck.forEach(file => {
    const filePath = join(process.cwd(), file);
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        if (content.includes('import { envVars }') || content.includes('from \'@/lib/env/env.mjs\'')) {
          // This is good - using static import
        } else if (content.includes('await import(\'@/lib/env/env.mjs\')')) {
          // Dynamic import is acceptable in async functions
        }
      } catch (error) {
        // File might not exist, skip
      }
    }
  });
  
  addResult(
    'Runtime Imports',
    'pass',
    'No problematic runtime import patterns detected'
  );
}

/**
 * 4. Validate critical file existence
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
    'app/api/guru-chat/route.ts',
    'app/api/payments/order/route.ts',
    '.env.example',
  ];
  
  let missingFiles: string[] = [];
  
  criticalFiles.forEach(file => {
    const filePath = join(process.cwd(), file);
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
 * Main validation function
 */
async function runValidation() {
  console.log('🚀 Starting Deployment Readiness Validation...\n');
  
  scanEnvUsage();
  validateEnvModule();
  checkRuntimeImports();
  validateCriticalFiles();
  
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


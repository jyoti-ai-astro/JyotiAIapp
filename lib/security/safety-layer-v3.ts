/**
 * Safety Layer V3 (Phase 28 - F43)
 * 
 * Enhanced safety filters for Guru responses
 */

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  sanitized?: string;
}

/**
 * Check for medical predictions
 */
function checkMedicalContent(text: string): SafetyCheckResult {
  const medicalKeywords = [
    'diagnose', 'diagnosis', 'cure', 'treatment', 'medicine', 'prescription',
    'surgery', 'disease', 'illness', 'symptom', 'medical advice', 'doctor',
    'hospital', 'clinic', 'medication', 'drug', 'therapy'
  ];
  
  const lowerText = text.toLowerCase();
  const found = medicalKeywords.some(keyword => lowerText.includes(keyword));
  
  if (found) {
    return {
      safe: false,
      reason: 'Medical content detected',
      sanitized: text.replace(
        new RegExp(medicalKeywords.join('|'), 'gi'),
        '[medical term]'
      ),
    };
  }
  
  return { safe: true };
}

/**
 * Check for legal advice
 */
function checkLegalContent(text: string): SafetyCheckResult {
  const legalKeywords = [
    'legal advice', 'lawsuit', 'sue', 'contract', 'lawyer', 'attorney',
    'court', 'judge', 'legal action', 'litigation', 'legal counsel'
  ];
  
  const lowerText = text.toLowerCase();
  const found = legalKeywords.some(keyword => lowerText.includes(keyword));
  
  if (found) {
    return {
      safe: false,
      reason: 'Legal advice detected',
      sanitized: text.replace(
        new RegExp(legalKeywords.join('|'), 'gi'),
        '[legal term]'
      ),
    };
  }
  
  return { safe: true };
}

/**
 * Check for financial instructions
 */
function checkFinancialContent(text: string): SafetyCheckResult {
  const financialKeywords = [
    'invest in', 'buy stock', 'sell stock', 'trading advice', 'financial advice',
    'guaranteed return', 'risk-free investment', 'get rich quick', 'crypto investment',
    'bitcoin investment', 'forex trading'
  ];
  
  const lowerText = text.toLowerCase();
  const found = financialKeywords.some(keyword => lowerText.includes(keyword));
  
  if (found) {
    return {
      safe: false,
      reason: 'Financial advice detected',
      sanitized: text.replace(
        new RegExp(financialKeywords.join('|'), 'gi'),
        '[financial term]'
      ),
    };
  }
  
  return { safe: true };
}

/**
 * Check for exact dates in predictions
 */
function checkExactDates(text: string): SafetyCheckResult {
  // Match dates like "January 15, 2025" or "15/01/2025"
  const datePatterns = [
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
  ];
  
  const found = datePatterns.some(pattern => pattern.test(text));
  
  if (found) {
    return {
      safe: false,
      reason: 'Exact date prediction detected',
      sanitized: text.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[date]')
        .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[date]')
        .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, '[date]'),
    };
  }
  
  return { safe: true };
}

/**
 * Check for fatalistic statements
 */
function checkFatalisticContent(text: string): SafetyCheckResult {
  const fatalisticPatterns = [
    /you will (never|always|definitely|certainly) (die|fail|suffer|be cursed)/gi,
    /your destiny is (sealed|fixed|unchangeable|predetermined)/gi,
    /nothing can (change|prevent|stop) (this|it|your fate)/gi,
    /you are (doomed|cursed|fated) to/gi,
  ];
  
  const found = fatalisticPatterns.some(pattern => pattern.test(text));
  
  if (found) {
    return {
      safe: false,
      reason: 'Fatalistic statement detected',
      sanitized: text.replace(
        /(you will (never|always|definitely|certainly)|your destiny is (sealed|fixed)|nothing can (change|prevent|stop)|you are (doomed|cursed|fated))/gi,
        '[fatalistic phrase]'
      ),
    };
  }
  
  return { safe: true };
}

/**
 * Detect emotional state from text
 */
export function detectEmotionalState(text: string): 'calm' | 'concerned' | 'distressed' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  const distressedKeywords = ['worried', 'anxious', 'stressed', 'depressed', 'hopeless', 'desperate'];
  const concernedKeywords = ['concerned', 'uncertain', 'confused', 'unsure', 'questioning'];
  
  if (distressedKeywords.some(kw => lowerText.includes(kw))) {
    return 'distressed';
  }
  
  if (concernedKeywords.some(kw => lowerText.includes(kw))) {
    return 'concerned';
  }
  
  if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('grateful')) {
    return 'calm';
  }
  
  return 'neutral';
}

/**
 * Apply safety layer V3 to Guru response
 */
export function safetyLayerV3(
  text: string,
  emotionalState: 'calm' | 'concerned' | 'distressed' | 'neutral' = 'neutral'
): SafetyCheckResult {
  if (!text || typeof text !== 'string') {
    return { safe: false, reason: 'Invalid input' };
  }
  
  // Run all safety checks
  const checks = [
    checkMedicalContent(text),
    checkLegalContent(text),
    checkFinancialContent(text),
    checkExactDates(text),
    checkFatalisticContent(text),
  ];
  
  // Find first unsafe check
  const unsafeCheck = checks.find(check => !check.safe);
  if (unsafeCheck) {
    // If user is distressed, soften the response
    if (emotionalState === 'distressed' && unsafeCheck.sanitized) {
      return {
        safe: true, // Allow but sanitized
        reason: unsafeCheck.reason,
        sanitized: unsafeCheck.sanitized + '\n\n*Note: This is spiritual guidance, not professional advice. Please consult qualified professionals for medical, legal, or financial matters.*',
      };
    }
    
    return unsafeCheck;
  }
  
  // If emotional state is distressed, add supportive message
  if (emotionalState === 'distressed') {
    return {
      safe: true,
      sanitized: text + '\n\n*Remember, you have the power to shape your destiny. This guidance is meant to support, not limit you.*',
    };
  }
  
  return { safe: true };
}


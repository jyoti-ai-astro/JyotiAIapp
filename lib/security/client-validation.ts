/**
 * Client Validation Layer (Phase 28 - F43)
 * 
 * Client-side validation before sending to server
 */

import { detectSuspiciousPattern, sanitizeMessage } from './xss-protection';
import { validateImageFile, validateAudioFile, checkFileCorruption } from './file-validation';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

// Track message history for spam detection
const messageHistory: Array<{ content: string; timestamp: number }> = [];
const MAX_HISTORY = 10;

/**
 * Validate chat message before sending
 */
export function validateChatMessage(message: string): ValidationResult {
  // Check empty
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  // Check length
  if (message.length > 5000) {
    return { valid: false, error: 'Message too long (max 5000 characters)' };
  }

  // Check for repeated message spam
  const now = Date.now();
  const recentMessages = messageHistory.filter(m => now - m.timestamp < 60000); // Last minute
  const identicalCount = recentMessages.filter(m => m.content === message.trim()).length;
  
  if (identicalCount >= 3) {
    return { valid: false, error: 'Please do not send the same message repeatedly.' };
  }

  // Check suspicious patterns
  const suspiciousCheck = detectSuspiciousPattern(message);
  if (suspiciousCheck.isSuspicious) {
    return { valid: false, error: 'Message contains suspicious content. Please try again.' };
  }

  // Sanitize message
  const sanitized = sanitizeMessage(message);

  // Add to history
  messageHistory.push({ content: message.trim(), timestamp: now });
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }

  return { valid: true, sanitized };
}

/**
 * Validate audio file before upload
 */
export async function validateAudioFileClient(file: File): Promise<ValidationResult> {
  // Validate file
  const validation = validateAudioFile(file);
  if (!validation.valid) {
    return validation;
  }

  // Check corruption
  const corruptionCheck = await checkFileCorruption(file);
  if (corruptionCheck.corrupted) {
    return { valid: false, error: corruptionCheck.error || 'Audio file appears corrupted' };
  }

  return { valid: true };
}

/**
 * Validate image file before upload
 */
export async function validateImageFileClient(file: File): Promise<ValidationResult> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return validation;
  }

  // Check corruption
  const corruptionCheck = await checkFileCorruption(file);
  if (corruptionCheck.corrupted) {
    return { valid: false, error: corruptionCheck.error || 'Image file appears corrupted' };
  }

  return { valid: true };
}

/**
 * Handle video stream errors gracefully
 */
export function handleVideoStreamError(error: Error): string {
  if (error.name === 'NotAllowedError') {
    return 'Camera access denied. Please allow camera permissions and try again.';
  }
  if (error.name === 'NotFoundError') {
    return 'No camera found. Please connect a camera and try again.';
  }
  if (error.name === 'NotReadableError') {
    return 'Camera is already in use. Please close other applications using the camera.';
  }
  if (error.name === 'OverconstrainedError') {
    return 'Camera does not support required settings. Please try a different camera.';
  }
  
  return 'Video stream error. Please try again.';
}

/**
 * Retry logic for uploads
 */
export async function retryUpload<T>(
  uploadFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError || new Error('Upload failed after retries');
}


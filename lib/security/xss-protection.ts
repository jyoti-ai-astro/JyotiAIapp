/**
 * XSS + HTML Injection Protection (Phase 28 - F43)
 * 
 * Sanitization utilities for user input
 */

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize text input - removes HTML tags and dangerous characters
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove dangerous unicode characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width characters
  
  // Trim and limit length
  sanitized = sanitized.trim().slice(0, 5000);
  
  return sanitized;
}

/**
 * Sanitize message content for chat display
 */
export function sanitizeMessage(message: string): string {
  // First escape HTML
  let sanitized = escapeHtml(message);
  
  // Remove markdown code blocks that could contain scripts
  sanitized = sanitized.replace(/```[\s\S]*?```/g, '[code block removed]');
  sanitized = sanitized.replace(/`[^`]*`/g, '[code removed]');
  
  // Remove URLs that could be malicious (keep display text)
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[link removed]');
  
  return sanitized;
}

/**
 * Validate and sanitize markdown (allow only safe markdown)
 */
export function sanitizeMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Allow only safe markdown: bold, italic, lists
  const safeMarkdown = text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^\+ (.+)$/gm, '<li>$1</li>');
  
  // Escape any remaining HTML
  return escapeHtml(safeMarkdown);
}

/**
 * Check for suspicious patterns (bot-like behavior, spam)
 */
export function detectSuspiciousPattern(text: string): {
  isSuspicious: boolean;
  reason?: string;
} {
  if (!text || typeof text !== 'string') {
    return { isSuspicious: false };
  }
  
  // Check for repeated characters (spam)
  if (/(.)\1{10,}/.test(text)) {
    return { isSuspicious: true, reason: 'Repeated characters detected' };
  }
  
  // Check for excessive special characters
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
  if (specialCharRatio > 0.5) {
    return { isSuspicious: true, reason: 'Excessive special characters' };
  }
  
  // Check for suspicious unicode
  if (/[\u200B-\u200D\uFEFF]/.test(text)) {
    return { isSuspicious: true, reason: 'Suspicious unicode characters' };
  }
  
  return { isSuspicious: false };
}


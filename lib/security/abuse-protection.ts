/**
 * Abuse Protection (Phase 28 - F43)
 * 
 * Bot detection, fingerprinting, and abuse prevention
 */

interface UserFingerprint {
  ip?: string;
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution?: string;
  platform: string;
}

interface MessageHistory {
  messages: Array<{ content: string; timestamp: number }>;
  lastMessageTime: number;
}

// In-memory store (in production, use Redis or database)
const messageHistoryStore: Map<string, MessageHistory> = new Map();
const cooldownStore: Map<string, number> = new Map();

/**
 * Generate user fingerprint (stateless)
 */
export function generateFingerprint(request: {
  ip?: string;
  userAgent?: string;
  headers?: Headers;
}): string {
  const parts: string[] = [];
  
  // IP (if available)
  if (request.ip) {
    parts.push(request.ip);
  }
  
  // User agent
  const ua = request.userAgent || request.headers?.get('user-agent') || 'unknown';
  parts.push(ua);
  
  // Accept language
  const lang = request.headers?.get('accept-language') || 'unknown';
  parts.push(lang);
  
  // Create hash (simple hash for demo, use crypto in production)
  const fingerprint = parts.join('|');
  return btoa(fingerprint).slice(0, 32); // Base64 encode and truncate
}

/**
 * Detect bot-like behavior
 */
export function detectBotBehavior(
  fingerprint: string,
  message: string,
  currentTime: number = Date.now()
): { isBot: boolean; reason?: string } {
  const history = messageHistoryStore.get(fingerprint);
  
  if (!history) {
    // First message, initialize
    messageHistoryStore.set(fingerprint, {
      messages: [{ content: message, timestamp: currentTime }],
      lastMessageTime: currentTime,
    });
    return { isBot: false };
  }
  
  // Check for too many messages too fast
  const timeSinceLastMessage = currentTime - history.lastMessageTime;
  const messagesInLastMinute = history.messages.filter(
    m => currentTime - m.timestamp < 60000
  ).length;
  
  if (timeSinceLastMessage < 1000 && messagesInLastMinute > 5) {
    return {
      isBot: true,
      reason: 'Too many messages too quickly',
    };
  }
  
  // Check for repeated identical messages
  const recentMessages = history.messages.slice(-5);
  const identicalCount = recentMessages.filter(m => m.content === message).length;
  if (identicalCount >= 3) {
    return {
      isBot: true,
      reason: 'Repeated identical messages',
    };
  }
  
  // Check for very short messages sent rapidly
  if (message.length < 10 && timeSinceLastMessage < 2000) {
    const shortMessages = history.messages.filter(
      m => m.content.length < 10 && currentTime - m.timestamp < 10000
    ).length;
    if (shortMessages > 10) {
      return {
        isBot: true,
        reason: 'Too many short messages',
      };
    }
  }
  
  // Update history
  history.messages.push({ content: message, timestamp: currentTime });
  history.lastMessageTime = currentTime;
  
  // Keep only last 20 messages
  if (history.messages.length > 20) {
    history.messages = history.messages.slice(-20);
  }
  
  messageHistoryStore.set(fingerprint, history);
  
  return { isBot: false };
}

/**
 * Check if user is in cooldown
 */
export function checkCooldown(fingerprint: string, cooldownMs: number = 5000): {
  inCooldown: boolean;
  remainingMs?: number;
} {
  const cooldownEnd = cooldownStore.get(fingerprint);
  const now = Date.now();
  
  if (!cooldownEnd || now >= cooldownEnd) {
    return { inCooldown: false };
  }
  
  return {
    inCooldown: true,
    remainingMs: cooldownEnd - now,
  };
}

/**
 * Set cooldown for user
 */
export function setCooldown(fingerprint: string, durationMs: number): void {
  cooldownStore.set(fingerprint, Date.now() + durationMs);
  
  // Cleanup old cooldowns
  const now = Date.now();
  for (const [key, endTime] of cooldownStore.entries()) {
    if (endTime < now) {
      cooldownStore.delete(key);
    }
  }
}

/**
 * Get cooldown message
 */
export function getCooldownMessage(remainingMs: number): string {
  const seconds = Math.ceil(remainingMs / 1000);
  if (seconds < 60) {
    return `Guru is meditating... Please wait ${seconds} second${seconds > 1 ? 's' : ''}.`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `Guru is meditating... Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`;
}

/**
 * Cleanup old history entries (call periodically)
 */
export function cleanupHistory(maxAgeMs: number = 3600000): void {
  const now = Date.now();
  for (const [key, history] of messageHistoryStore.entries()) {
    const oldestMessage = history.messages[0]?.timestamp || now;
    if (now - oldestMessage > maxAgeMs) {
      messageHistoryStore.delete(key);
    }
  }
}


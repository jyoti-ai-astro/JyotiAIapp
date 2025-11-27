/**
 * Security Logging Layer (Phase 28 - F43)
 * 
 * Server-level security logging with sanitization
 */

export type SecurityEventType =
  | 'rate_limit_hit'
  | 'validation_failure'
  | 'suspicious_activity'
  | 'orchestrator_error'
  | 'file_validation_failure'
  | 'abuse_detection'
  | 'safety_layer_triggered';

export interface SecurityLog {
  timestamp: number;
  type: SecurityEventType;
  fingerprint?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// In-memory log store (in production, send to logging service)
const securityLogs: SecurityLog[] = [];
const MAX_LOGS = 1000;

/**
 * Sanitize log data (never log raw user data)
 */
function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return typeof data === 'string' && data.length > 100
      ? data.substring(0, 100) + '...'
      : data;
  }
  
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Never log sensitive fields
    if (['password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn'].includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Truncate long strings
    if (typeof value === 'string' && value.length > 200) {
      sanitized[key] = value.substring(0, 200) + '...';
      continue;
    }
    
    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
      continue;
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Log security event
 */
export function logSecurityEvent(
  type: SecurityEventType,
  details: Record<string, any>,
  severity: SecurityLog['severity'] = 'medium',
  context?: {
    fingerprint?: string;
    ip?: string;
    userAgent?: string;
  }
): void {
  const log: SecurityLog = {
    timestamp: Date.now(),
    type,
    fingerprint: context?.fingerprint,
    ip: context?.ip ? context.ip.split('.').slice(0, 2).join('.') + '.x.x' : undefined, // Partial IP
    userAgent: context?.userAgent ? context.userAgent.substring(0, 100) : undefined,
    details: sanitizeLogData(details),
    severity,
  };
  
  securityLogs.push(log);
  
  // Keep only last MAX_LOGS
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.shift();
  }
  
  // In production, send to logging service (e.g., Sentry, CloudWatch, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to logging service
    // sendToLoggingService(log);
  } else {
    // In development, log to console
    console.warn(`[Security] ${type}:`, log);
  }
}

/**
 * Get recent security logs
 */
export function getRecentLogs(
  type?: SecurityEventType,
  severity?: SecurityLog['severity'],
  limit: number = 100
): SecurityLog[] {
  let filtered = securityLogs;
  
  if (type) {
    filtered = filtered.filter(log => log.type === type);
  }
  
  if (severity) {
    filtered = filtered.filter(log => log.severity === severity);
  }
  
  return filtered.slice(-limit);
}

/**
 * Get security statistics
 */
export function getSecurityStats(): {
  totalEvents: number;
  byType: Record<SecurityEventType, number>;
  bySeverity: Record<SecurityLog['severity'], number>;
  recentCritical: number;
} {
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let recentCritical = 0;
  
  const oneHourAgo = Date.now() - 3600000;
  
  for (const log of securityLogs) {
    byType[log.type] = (byType[log.type] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
    
    if (log.severity === 'critical' && log.timestamp > oneHourAgo) {
      recentCritical++;
    }
  }
  
  return {
    totalEvents: securityLogs.length,
    byType: byType as Record<SecurityEventType, number>,
    bySeverity: bySeverity as Record<SecurityLog['severity'], number>,
    recentCritical,
  };
}


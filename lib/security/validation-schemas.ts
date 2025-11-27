/**
 * Security Validation Schemas (Phase 28 - F43)
 * 
 * Zod schemas for API route validation
 */

import { z } from 'zod';

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long (max 5000 characters)')
    .refine((msg) => msg.trim().length > 0, 'Message cannot be only whitespace'),
  context: z.object({
    kundali: z.any().optional(),
    numerology: z.any().optional(),
    aura: z.any().optional(),
  }).optional(),
  messageHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(40, 'Message history too long').optional(),
  memorySummary: z.string().max(2000).optional(),
  pastLifeSummary: z.string().max(2000).optional(),
  synergySummary: z.string().max(2000).optional(),
  predictionSummary: z.string().max(2000).optional(),
  compatibilitySummary: z.string().max(2000).optional(),
  reportSummary: z.string().max(2000).optional(),
  unifiedContext: z.any().optional(),
  orchestratedSummary: z.any().optional(),
  intent: z.string().optional(),
});

// Voice message validation
export const voiceMessageSchema = z.object({
  audio: z.instanceof(File)
    .refine((file) => file.size <= 15 * 1024 * 1024, 'Audio file too large (max 15MB)')
    .refine(
      (file) => ['audio/ogg', 'audio/wav', 'audio/m4a', 'audio/mpeg'].includes(file.type),
      'Invalid audio format (only OGG, WAV, M4A, MPEG allowed)'
    ),
  transcript: z.string().max(5000).optional(),
});

// Vision/image validation
export const visionImageSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Image file too large (max 10MB)')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Invalid image format (only JPEG, PNG, WebP allowed)'
    ),
  type: z.enum(['palm', 'aura', 'emotion', 'kundali', 'document']).optional(),
});

// Video frame validation
export const videoFrameSchema = z.object({
  frame: z.string().refine((data) => {
    // Base64 validation
    const base64Regex = /^data:image\/(jpeg|png|webp);base64,/;
    return base64Regex.test(data) || data.length < 10 * 1024 * 1024; // Max 10MB
  }, 'Invalid video frame format'),
  timestamp: z.number().optional(),
});

// PDF report validation
export const pdfReportSchema = z.object({
  type: z.enum(['kundali', 'numerology', 'aura-chakra', 'past-life', 'prediction', 'compatibility', 'guru']),
  contextData: z.any().optional(),
});

// Rate limit configuration
export const rateLimitConfig = {
  chat: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 req/min
  vision: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 req/min
  video: { windowMs: 60 * 1000, maxRequests: 15 }, // 15 req/min
  pdf: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 req/min
  voice: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 req/min
};

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type VoiceMessageInput = z.infer<typeof voiceMessageSchema>;
export type VisionImageInput = z.infer<typeof visionImageSchema>;
export type VideoFrameInput = z.infer<typeof videoFrameSchema>;
export type PDFReportInput = z.infer<typeof pdfReportSchema>;


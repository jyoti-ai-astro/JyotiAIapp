/**
 * Secure File Handling (Phase 28 - F43)
 * 
 * File validation and sanitization utilities
 */

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_AUDIO_TYPES = ['audio/ogg', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFile?: File;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image file too large (max ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
    };
  }
  
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid image format. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }
  
  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
  };
  
  if (extension && mimeExtensionMap[file.type] && !mimeExtensionMap[file.type].includes(extension)) {
    return {
      valid: false,
      error: 'File extension does not match MIME type',
    };
  }
  
  return { valid: true, sanitizedFile: file };
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_AUDIO_SIZE) {
    return {
      valid: false,
      error: `Audio file too large (max ${MAX_AUDIO_SIZE / 1024 / 1024}MB)`,
    };
  }
  
  // Check MIME type
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid audio format. Allowed: ${ALLOWED_AUDIO_TYPES.join(', ')}`,
    };
  }
  
  return { valid: true, sanitizedFile: file };
}

/**
 * Validate video file
 */
export function validateVideoFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video file too large (max ${MAX_VIDEO_SIZE / 1024 / 1024}MB)`,
    };
  }
  
  // Check MIME type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid video format. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
    };
  }
  
  return { valid: true, sanitizedFile: file };
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and dangerous characters
  let sanitized = fileName
    .replace(/[\/\\]/g, '_') // Replace path separators
    .replace(/[<>:"|?*]/g, '_') // Replace dangerous characters
    .replace(/\.\./g, '_') // Replace parent directory references
    .trim();
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 255 - (ext ? ext.length + 1 : 0));
    sanitized = ext ? `${name}.${ext}` : name;
  }
  
  return sanitized;
}

/**
 * Check if file is corrupted (basic check)
 */
export async function checkFileCorruption(file: File): Promise<{ corrupted: boolean; error?: string }> {
  try {
    // For images, try to load as image
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ corrupted: false });
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve({ corrupted: true, error: 'Image file appears corrupted' });
        };
        
        img.src = url;
      });
    }
    
    // For audio/video, check if file can be read
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return { corrupted: true, error: 'File is empty' };
    }
    
    return { corrupted: false };
  } catch (error) {
    return { corrupted: true, error: 'Failed to validate file' };
  }
}


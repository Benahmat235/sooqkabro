/**
 * Security utilities for SooqKabro
 * Provides input sanitization, phone masking, and rate limiting
 */

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize user input by removing potentially dangerous characters
 * Prevents XSS attacks in user-generated content
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

/**
 * Sanitize HTML content - strips all HTML tags
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize for display in HTML - escapes special characters
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return input.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

// =============================================================================
// PHONE NUMBER SECURITY
// =============================================================================

/**
 * Mask phone number for privacy - shows only first 3 and last 2 digits
 * Example: +235 66 12 34 56 -> +23******56
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove spaces and formatting
  const cleaned = phone.replace(/\s/g, '');
  
  if (cleaned.length < 6) return '******';
  
  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-2);
  const maskedLength = Math.max(cleaned.length - 6, 4);
  
  return `${prefix}${'*'.repeat(maskedLength)}${suffix}`;
}

/**
 * Check if current user is authorized to see full phone number
 * User can see phone if: they own the listing, or are in a conversation with the seller
 */
export function canViewPhone(
  currentUserId: string | undefined,
  ownerId: string,
  conversationParticipants?: string[]
): boolean {
  if (!currentUserId) return false;
  
  // Owner can always see their own phone
  if (currentUserId === ownerId) return true;
  
  // Conversation participants can see each other's phone
  if (conversationParticipants?.includes(currentUserId)) return true;
  
  return false;
}

// =============================================================================
// RATE LIMITING (Client-side)
// =============================================================================

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple client-side rate limiter
 * Returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute default
): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return { allowed: true };
  }
  
  // Window expired, reset
  if (now - entry.firstRequest > windowMs) {
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return { allowed: true };
  }
  
  // Within window, check count
  if (entry.count >= maxRequests) {
    const remainingTime = windowMs - (now - entry.firstRequest);
    return { allowed: false, remainingTime };
  }
  
  // Increment count
  entry.count++;
  return { allowed: true };
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// =============================================================================
// PASSWORD VALIDATION
// =============================================================================

export interface PasswordStrength {
  score: number; // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
}

/**
 * Validate password strength
 * Requirements: 8+ chars, uppercase, lowercase, number, special char
 */
export function validatePassword(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    suggestions.push('Utilisez au moins 8 caracteres');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Ajoutez une majuscule');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Ajoutez une minuscule');
  }
  
  // Number check
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push('Ajoutez un chiffre');
  }
  
  // Special character check (bonus)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score = Math.min(score + 1, 4);
  } else if (score === 4) {
    suggestions.push('Ajoutez un caractere special pour plus de securite');
  }
  
  const labels: Record<number, 'weak' | 'fair' | 'good' | 'strong'> = {
    0: 'weak',
    1: 'weak',
    2: 'fair',
    3: 'good',
    4: 'strong',
  };
  
  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    suggestions,
  };
}

/**
 * Check if password meets minimum requirements
 */
export function isPasswordValid(password: string): boolean {
  return validatePassword(password).score >= 3;
}

// =============================================================================
// SESSION SECURITY
// =============================================================================

/**
 * Get device fingerprint for session tracking
 * Note: This is a simple implementation for basic device identification
 */
export function getDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ];
  
  // Simple hash
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

// =============================================================================
// CONTENT SECURITY
// =============================================================================

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

/**
 * Validate image file size (max 5MB default)
 */
export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Validate file for upload
 */
export function validateImageUpload(file: File): { valid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return { valid: false, error: 'Type de fichier non autorise. Utilisez JPG, PNG, GIF ou WebP.' };
  }
  
  if (!isValidImageSize(file)) {
    return { valid: false, error: 'Fichier trop volumineux. Maximum 5 Mo.' };
  }
  
  return { valid: true };
}

// =============================================================================
// URL VALIDATION
// =============================================================================

/**
 * Validate URL to prevent SSRF and malicious redirects
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize URL for safe usage
 */
export function sanitizeUrl(url: string): string {
  if (!isValidUrl(url)) return '';
  return url;
}

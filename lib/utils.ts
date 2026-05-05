// ============================================================
// CyberShield AI — Utility Functions
// ============================================================

import { ThreatType, SeverityLabel } from '@/types';

/**
 * Format a date string to a relative "time ago" format
 */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get severity color CSS variable
 */
export function getSeverityColor(severity: number): string {
  const colors: Record<number, string> = {
    1: 'var(--sev-1)',
    2: 'var(--sev-2)',
    3: 'var(--sev-3)',
    4: 'var(--sev-4)',
    5: 'var(--sev-5)',
  };
  return colors[severity] || 'var(--text-muted)';
}

/**
 * Get severity label from number
 */
export function getSeverityLabel(severity: number): SeverityLabel {
  const labels: Record<number, SeverityLabel> = {
    1: 'Informational',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Critical',
  };
  return labels[severity] || 'Informational';
}

/**
 * Get icon for threat type
 */
export function getThreatIcon(type: ThreatType): string {
  const icons: Record<ThreatType, string> = {
    phishing: '🎣',
    malware: '🦠',
    ransomware: '🔒',
    data_breach: '💧',
    scam: '💸',
    fraud: '🎭',
    spam: '📧',
    zero_day: '⚡',
    social_engineering: '🎯',
    other: '🔍',
  };
  return icons[type] || '🔍';
}

/**
 * Get verdict color
 */
export function getVerdictColor(verdict: string): string {
  const colors: Record<string, string> = {
    Clean: 'var(--accent-green)',
    Safe: 'var(--accent-green)',
    Suspicious: 'var(--accent-amber)',
    Malicious: 'var(--accent-red)',
    Phishing: 'var(--accent-red)',
    Spam: 'var(--accent-amber)',
    Unknown: 'var(--text-muted)',
  };
  return colors[verdict] || 'var(--text-muted)';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validate URL format
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect input type: hash, domain, IP, or unknown
 */
export function detectSearchType(input: string): 'hash' | 'domain' | 'ip' | 'unknown' {
  // MD5
  if (/^[a-fA-F0-9]{32}$/.test(input)) return 'hash';
  // SHA1
  if (/^[a-fA-F0-9]{40}$/.test(input)) return 'hash';
  // SHA256
  if (/^[a-fA-F0-9]{64}$/.test(input)) return 'hash';
  // IP Address (v4)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(input)) return 'ip';
  // Domain
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(input)) return 'domain';
  return 'unknown';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'Low Risk', color: 'var(--sev-1)' };
  if (score <= 40) return { label: 'Moderate', color: 'var(--sev-2)' };
  if (score <= 60) return { label: 'Elevated', color: 'var(--sev-3)' };
  if (score <= 80) return { label: 'High Risk', color: 'var(--sev-4)' };
  return { label: 'Critical', color: 'var(--sev-5)' };
}

/**
 * Classnames merger helper
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

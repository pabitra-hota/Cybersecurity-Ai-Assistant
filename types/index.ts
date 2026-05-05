// ============================================================
// CyberShield AI — Type Definitions
// ============================================================

export type ThreatType =
  | 'phishing'
  | 'malware'
  | 'ransomware'
  | 'data_breach'
  | 'scam'
  | 'fraud'
  | 'spam'
  | 'zero_day'
  | 'social_engineering'
  | 'other';

export type SeverityLabel = 'Low' | 'Medium' | 'High' | 'Critical' | 'Informational';

export type ScanType = 'file' | 'url' | 'search';

export type Verdict = 'Clean' | 'Suspicious' | 'Malicious' | 'Unknown' | 'Safe' | 'Phishing' | 'Spam';

export type ReportType =
  | 'phishing_email'
  | 'online_scam'
  | 'suspicious_link'
  | 'sms_fraud'
  | 'voice_phishing'
  | 'ecommerce_fraud'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'confirmed' | 'false_positive';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type TrendDirection = 'improving' | 'stable' | 'worsening';

// ---- Core Entities ----

export interface ThreatNews {
  id: string;
  title: string;
  summary: string;
  threat_type: ThreatType;
  severity: number;
  severity_label: SeverityLabel;
  affected_targets: string[];
  prevention_tips: string[];
  source_url: string;
  published_at: string;
  ai_analyzed_at: string;
  created_at: string;
}

export interface ScanResult {
  id: string;
  scan_id?: string;
  user_id?: string;
  scan_type: ScanType;
  target: string;
  verdict: Verdict;
  risk_score: number;
  malicious_count: number;
  suspicious_count: number;
  undetected_count: number;
  total_engines: number;
  ai_explanation: string;
  ai_recommendation: string;
  top_threats: string[];
  raw_report?: Record<string, unknown>;
  created_at: string;
}

export interface UserReport {
  id: string;
  user_id: string;
  report_type: ReportType;
  target: string;
  description: string;
  severity: SeverityLevel;
  evidence_urls: string[];
  is_anonymous: boolean;
  status: ReportStatus;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments: ChatAttachment[];
  timestamp: string;
  referenced_scan_id?: string;
}

export interface ChatAttachment {
  name: string;
  type: string;
  url?: string;
  size?: number;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface AnalyticsData {
  threat_type: ThreatType;
  count: number;
  percentage: number;
  trend: TrendDirection;
}

export interface SecurityScore {
  overall: number;
  phishing: number;
  malware: number;
  browsing: number;
  awareness: number;
}

export interface User {
  id: string;
  email: string;
  avatar_url: string;
  full_name: string;
  security_score: number;
  total_scans: number;
  total_reports: number;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  created_at: string;
}

// ---- Analytics ----

export interface ScoreBreakdown {
  phishing: number;
  malware: number;
  browsing: number;
  awareness: number;
}

export interface ThreatDistribution {
  threat_type: ThreatType;
  count: number;
  percentage: number;
}

export interface PersonalizedTip {
  tip: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface FullAnalytics {
  security_score: number;
  score_breakdown: ScoreBreakdown;
  threat_distribution: ThreatDistribution[];
  top_risks: string[];
  behavior_insights: string[];
  personalized_tips: PersonalizedTip[];
  trend: TrendDirection;
  monthly_comparison: {
    this_month: number;
    last_month: number;
  };
}

// ---- Scan Progress ----

export type ScanProgress = 'idle' | 'uploading' | 'scanning' | 'analyzing' | 'complete' | 'error';

// ---- VirusTotal ----

export interface VTEngineResult {
  engine_name: string;
  category: string;
  result: string | null;
}

export interface VTFileReport {
  sha256: string;
  file_name: string;
  file_type: string;
  size: number;
  malicious_count: number;
  suspicious_count: number;
  undetected_count: number;
  harmless_count: number;
  engine_results: VTEngineResult[];
  last_analysis_date: string;
}

export interface VTUrlReport {
  url: string;
  url_id: string;
  malicious_count: number;
  suspicious_count: number;
  undetected_count: number;
  harmless_count: number;
  engine_results: VTEngineResult[];
  categories: Record<string, string>;
  last_analysis_date: string;
}

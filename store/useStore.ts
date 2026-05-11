// ============================================================
// CyberShield AI — Zustand Global Store
// ============================================================

import { create } from 'zustand';
import { ThreatNews, ScanResult, SecurityScore, AppNotification, User } from '@/types';

// ── Persisted state shapes for each scan tab ──
export interface FileScanState {
  file: { name: string; size: number; type: string } | null; // serialisable file metadata
  scanning: boolean;
  result: Record<string, unknown> | null;
  error: string | null;
  progress: number;
  step: string;
}

export interface UrlScanState {
  url: string;
  scanning: boolean;
  result: Record<string, unknown> | null;
  error: string | null;
}

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Threat News
  threatNews: ThreatNews[];
  setThreatNews: (news: ThreatNews[]) => void;
  lastNewsUpdate: Date | null;

  // Scan
  activeScan: ScanResult | null;
  setActiveScan: (scan: ScanResult | null) => void;

  scanHistory: ScanResult[];
  setScanHistory: (scans: ScanResult[]) => void;
  addScan: (scan: ScanResult) => void;

  // Security Score
  securityScore: SecurityScore | null;
  setSecurityScore: (score: SecurityScore) => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (n: AppNotification) => void;
  clearNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;

  // Chat
  chatConversationId: string | null;
  setChatConversationId: (id: string | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Threat counter
  activeThreatCount: number;
  setActiveThreatCount: (count: number) => void;

  // ── Persisted scan tab states ──
  fileScan: FileScanState;
  setFileScan: (patch: Partial<FileScanState>) => void;
  resetFileScan: () => void;

  urlScan: UrlScanState;
  setUrlScan: (patch: Partial<UrlScanState>) => void;
  resetUrlScan: () => void;
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Threat News
  threatNews: [],
  setThreatNews: (news) => set({ threatNews: news, lastNewsUpdate: new Date() }),
  lastNewsUpdate: null,

  // Scan
  activeScan: null,
  setActiveScan: (scan) => set({ activeScan: scan }),

  scanHistory: [],
  setScanHistory: (scans) => set({ scanHistory: scans }),
  addScan: (scan) =>
    set((state) => ({
      scanHistory: [scan, ...state.scanHistory].slice(0, 50),
    })),

  // Security Score
  securityScore: null,
  setSecurityScore: (score) => set({ securityScore: score }),

  // Notifications
  notifications: [],
  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications].slice(0, 50),
    })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  // Chat
  chatConversationId: null,
  setChatConversationId: (id) => set({ chatConversationId: id }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Threat counter
  activeThreatCount: 0,
  setActiveThreatCount: (count) => set({ activeThreatCount: count }),

  // ── Persisted scan tab states ──
  fileScan: { file: null, scanning: false, result: null, error: null, progress: 0, step: '' },
  setFileScan: (patch) =>
    set((state) => ({ fileScan: { ...state.fileScan, ...patch } })),
  resetFileScan: () =>
    set({ fileScan: { file: null, scanning: false, result: null, error: null, progress: 0, step: '' } }),

  urlScan: { url: '', scanning: false, result: null, error: null },
  setUrlScan: (patch) =>
    set((state) => ({ urlScan: { ...state.urlScan, ...patch } })),
  resetUrlScan: () =>
    set({ urlScan: { url: '', scanning: false, result: null, error: null } }),
}));

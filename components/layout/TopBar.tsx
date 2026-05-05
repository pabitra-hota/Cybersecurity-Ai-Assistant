'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import NotificationPanel from './NotificationPanel';
import styles from './TopBar.module.css';

const pageNames: Record<string, string> = {
  '/dashboard': 'Threat Intelligence Feed',
  '/dashboard/scan/file': 'File Scanner',
  '/dashboard/scan/url': 'URL Scanner',
  '/dashboard/scan/search': 'Threat Search',
  '/dashboard/reports': 'My Reports',
  '/dashboard/analytics': 'Security Analytics',
  '/dashboard/chat': 'AI Security Assistant',
};

export default function TopBar() {
  const pathname = usePathname();
  const { toggleSidebar, notifications, activeThreatCount } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageName = pageNames[pathname] || 'Dashboard';

  const threatLevel = activeThreatCount > 20
    ? { label: 'CRITICAL', color: '#FF3B3B' }
    : activeThreatCount > 10
    ? { label: 'HIGH', color: '#FB923C' }
    : activeThreatCount > 5
    ? { label: 'ELEVATED', color: '#FFB800' }
    : { label: 'LOW', color: '#4ADE80' };

  return (
    <header className={styles.topbar}>
      <div className={styles['topbar-left']}>
        <button className={styles['topbar-menu']} onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <div className={styles['topbar-breadcrumb']}>
          <span className={styles['breadcrumb-icon']}>🛡️</span>
          <h1 className={styles['page-name']}>{pageName}</h1>
        </div>
      </div>

      <div className={styles['topbar-right']}>
        <div className={styles['threat-level']} style={{ borderColor: `${threatLevel.color}33` }}>
          <AlertTriangle size={14} style={{ color: threatLevel.color }} />
          <span className={styles['threat-label']}>THREAT LEVEL:</span>
          <span style={{ color: threatLevel.color }}>{threatLevel.label}</span>
          <div className={styles['threat-dot']} style={{ background: threatLevel.color }} />
        </div>

        <NotificationPanel />
      </div>
    </header>
  );
}

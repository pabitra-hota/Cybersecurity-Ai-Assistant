'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, FileSearch, Link2, Search, FileText,
  BarChart3, MessageSquare, Settings, LogOut, Shield,
  ChevronLeft,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/lib/auth-context';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: FileSearch, label: 'File Scan', href: '/dashboard/scan/file' },
  { icon: Link2, label: 'URL Scan', href: '/dashboard/scan/url' },
  { icon: Search, label: 'Search', href: '/dashboard/scan/search' },
  { icon: FileText, label: 'My Reports', href: '/dashboard/reports' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: MessageSquare, label: 'AI Assistant', href: '/dashboard/chat' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, activeThreatCount } = useStore();

  // ── Use REAL Firebase user, not the Zustand store's hardcoded user ──
  const { user, signOut } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const photoURL = user?.photoURL || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {sidebarOpen && (
        <div className={styles['sidebar-overlay']} onClick={toggleSidebar} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles['sidebar-open'] : styles['sidebar-closed']}`}>
        {/* Logo */}
        <div className={styles['sidebar-header']}>
          <div className={styles['sidebar-logo']}>
            <div className={styles['logo-icon']}>
              <Shield size={24} />
            </div>
            <div className={styles['logo-text']}>
              <span className={styles['logo-name']}>CyberShield</span>
              <span className={styles['logo-ai']}>AI</span>
            </div>
          </div>
          <button className={styles['sidebar-toggle']} onClick={toggleSidebar} aria-label="Toggle sidebar">
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Threat counter */}
        <div className={styles['threat-counter']}>
          <div className={styles['threat-counter-dot']} />
          <span className={styles['threat-text']}>{activeThreatCount} active threats</span>
        </div>

        {/* Navigation */}
        <nav className={styles['sidebar-nav']}>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles['nav-item']} ${isActive ? styles['nav-item-active'] : ''}`}
              >
                <span className={styles['nav-icon']}><Icon size={18} /></span>
                <span className={styles['nav-label']}>{item.label}</span>
                {isActive && <div className={styles['nav-active-indicator']} />}
              </Link>
            );
          })}
        </nav>

        {/* User section — powered by Firebase Auth */}
        <div className={styles['sidebar-footer']}>
          <div className={styles['user-info']}>
            <div className={styles['user-avatar']}>
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoURL} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className={styles['avatar-placeholder']}>
                  {initials}
                </div>
              )}
            </div>
            <div className={styles['user-details']}>
              <span className={styles['user-name']}>{displayName}</span>
              <span className={styles['user-email']}>{email}</span>
            </div>
          </div>
          <div className={styles['sidebar-actions']}>
            <Link href="/dashboard/settings" className={styles['sidebar-action-btn']}>
              <Settings size={16} />
            </Link>
            <button
              id="sidebar-logout-btn"
              className={styles['sidebar-action-btn']}
              onClick={signOut}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

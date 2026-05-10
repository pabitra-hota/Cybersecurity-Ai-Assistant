'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, FileSearch, Link2, Search, FileText,
  BarChart3, MessageSquare, Shield, ChevronLeft,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
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


      </aside>
    </>
  );
}

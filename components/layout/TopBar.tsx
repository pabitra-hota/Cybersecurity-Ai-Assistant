'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, AlertTriangle, LogOut, User, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/lib/auth-context';
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
  const { user, signOut } = useAuth();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageName = pageNames[pathname] || 'Dashboard';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const threatLevel = activeThreatCount > 20
    ? { label: 'CRITICAL', color: '#FF3B3B' }
    : activeThreatCount > 10
    ? { label: 'HIGH', color: '#FB923C' }
    : activeThreatCount > 5
    ? { label: 'ELEVATED', color: '#FFB800' }
    : { label: 'LOW', color: '#4ADE80' };

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const photoURL = user?.photoURL;

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

        {/* User Avatar Menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            id="user-avatar-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#F0F4FF',
              transition: 'all 0.2s',
            }}
          >
            {photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoURL} alt={displayName} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00ff88,#0088ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#0a0e1a',
              }}>
                {initials}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            <ChevronDown size={14} style={{ color: '#8892B0', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '8px', minWidth: 200, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', zIndex: 100,
            }}>
              <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FF', margin: 0 }}>{displayName}</p>
                <p style={{ fontSize: 11, color: '#8892B0', margin: '2px 0 0' }}>{user?.email}</p>
              </div>
              <button
                id="profile-menu-item"
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'none', border: 'none', color: '#8892B0', fontSize: 13, cursor: 'pointer', borderRadius: 6, marginTop: 4 }}
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} /> Profile
              </button>
              <button
                id="logout-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'none', border: 'none', color: '#FF3B3B', fontSize: 13, cursor: 'pointer', borderRadius: 6 }}
                onClick={signOut}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

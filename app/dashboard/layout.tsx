'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useStore();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ color: 'var(--accent-green)', animation: 'pulse 1.5s infinite' }}>
          <Shield size={48} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Authenticating…</p>
      </div>
    );
  }

  // Not logged in — router.push already called, render nothing
  if (!user) return null;

  return (
    <div className={styles['dashboard-wrapper']}>
      <Sidebar />
      <div className={`${styles['dashboard-main']} ${sidebarOpen ? styles['sidebar-expanded'] : styles['sidebar-collapsed']}`}>
        <TopBar />
        <main className={styles['dashboard-content']}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

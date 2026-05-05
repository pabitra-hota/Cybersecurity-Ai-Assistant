'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import { useStore } from '@/store/useStore';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useStore();

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

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scan, FileText, BarChart3, MessageSquare } from 'lucide-react';
import styles from './MobileNav.module.css';

const tabs = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Scan, label: 'Scan', href: '/dashboard/scan/file' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles['mobile-nav']}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href ||
          (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles['mobile-tab']} ${isActive ? styles['mobile-tab-active'] : ''}`}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

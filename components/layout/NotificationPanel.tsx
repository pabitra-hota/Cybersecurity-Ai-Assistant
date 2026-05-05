'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Shield } from 'lucide-react';
import styles from './NotificationPanel.module.css';

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'tip';
  icon: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const AI_ALERTS: AlertItem[] = [
  {
    id: '1',
    type: 'critical',
    icon: '🚨',
    title: 'Critical Zero-Day Detected',
    description: 'A new zero-day vulnerability (CVE-2026-3891) is being actively exploited in the wild. Update your browser and OS immediately.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'tip',
    icon: '🛡️',
    title: 'AI Security Tip',
    description: 'Your browsing pattern suggests you visit financial sites frequently. Enable hardware security keys for banking accounts for maximum protection.',
    time: '15 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    icon: '⚠️',
    title: 'Phishing Campaign Active',
    description: 'A large-scale phishing campaign targeting Indian banks is active. Be cautious of SMS messages claiming to be from SBI or HDFC.',
    time: '32 min ago',
    read: false,
  },
  {
    id: '4',
    type: 'info',
    icon: '📊',
    title: 'Weekly Security Report Ready',
    description: 'Your personalized security analytics for this week are available. Your score improved by 5 points!',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '5',
    type: 'tip',
    icon: '💡',
    title: 'Password Strength Alert',
    description: 'CyberShield AI detected that 3 of your saved passwords may be weak. Consider updating them with a password manager.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '6',
    type: 'warning',
    icon: '🔍',
    title: 'Suspicious Domain Trend',
    description: 'Our AI detected a spike in newly registered lookalike domains mimicking popular e-commerce sites ahead of sale season.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '7',
    type: 'tip',
    icon: '🔒',
    title: 'Enable 2FA Recommendation',
    description: 'You haven\'t enabled two-factor authentication yet. This single step blocks 99.9% of automated attacks on your account.',
    time: '5 hours ago',
    read: true,
  },
];

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>(AI_ALERTS);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  };

  // Simulate a new AI alert arriving every 60 seconds
  useEffect(() => {
    const tips = [
      { icon: '🛡️', title: 'AI Security Insight', description: 'Based on current threat trends, consider reviewing your email filter rules to catch sophisticated phishing attempts.' },
      { icon: '🔐', title: 'Encryption Reminder', description: 'Sensitive files on your device should be encrypted. Use built-in OS encryption for full-disk protection.' },
      { icon: '📱', title: 'Mobile Security Check', description: 'Check your mobile app permissions. Many apps request unnecessary access to contacts, location, and camera.' },
    ];
    let tipIndex = 0;

    const interval = setInterval(() => {
      const tip = tips[tipIndex % tips.length];
      const newAlert: AlertItem = {
        id: `live-${Date.now()}`,
        type: 'tip',
        ...tip,
        time: 'Just now',
        read: false,
      };
      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]);
      tipIndex++;
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getIconClass = (type: AlertItem['type']) => {
    const map = { critical: styles['icon-critical'], warning: styles['icon-warning'], info: styles['icon-info'], tip: styles['icon-tip'] };
    return map[type];
  };

  const getTagClass = (type: AlertItem['type']) => {
    const map = { critical: styles['tag-critical'], warning: styles['tag-warning'], info: styles['tag-info'], tip: styles['tag-tip'] };
    return map[type];
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        className={styles['bell-btn']}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        style={{
          position: 'relative', padding: 8, background: 'none', border: 'none',
          color: open ? '#00FF88' : '#8892B0', cursor: 'pointer', borderRadius: 8,
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#FF3B3B', color: 'white', fontSize: 9, fontWeight: 700,
            borderRadius: '50%', lineHeight: 1,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles['notification-panel']}>
            {/* Header */}
            <div className={styles['panel-header']}>
              <div className={styles['panel-title']}>
                <Shield size={16} style={{ color: '#00FF88' }} />
                <span>AI Alerts & Tips</span>
                {unreadCount > 0 && (
                  <span className={styles['panel-count']}>{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button className={styles['clear-btn']} onClick={markAllRead}>
                  <CheckCheck size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Alerts List */}
            <div className={styles['panel-body']}>
              {alerts.length === 0 ? (
                <div className={styles['empty-state']}>
                  <Shield size={32} style={{ opacity: 0.3 }} />
                  <span>No alerts right now</span>
                  <span style={{ fontSize: 11 }}>CyberShield AI is monitoring threats for you</span>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <div
                      className={`${styles['alert-item']} ${!alert.read ? styles['alert-unread'] : ''}`}
                      onClick={() => markRead(alert.id)}
                    >
                      <div className={`${styles['alert-icon']} ${getIconClass(alert.type)}`}>
                        {alert.icon}
                      </div>
                      <div className={styles['alert-content']}>
                        <div className={styles['alert-title']}>
                          <span className={`${styles['alert-tag']} ${getTagClass(alert.type)}`}>
                            {alert.type}
                          </span>
                          {alert.title}
                        </div>
                        <p className={styles['alert-desc']}>{alert.description}</p>
                        <span className={styles['alert-time']}>{alert.time}</span>
                      </div>
                    </div>
                    {index < alerts.length - 1 && <div className={styles.divider} />}
                  </React.Fragment>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={styles['panel-footer']}>
              <button className={styles['view-all-btn']} onClick={() => setOpen(false)}>
                View All Notifications →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Filter, Radio } from 'lucide-react';
import ThreatCard from './ThreatCard';
import LoadingShield from '@/components/shared/LoadingShield';
import { useStore } from '@/store/useStore';
import { getThreatIcon, timeAgo } from '@/lib/utils';
import type { ThreatNews, ThreatType } from '@/types';
import styles from './NewsFeed.module.css';

const FILTER_OPTIONS: { label: string; value: ThreatType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '🎣 Phishing', value: 'phishing' },
  { label: '🦠 Malware', value: 'malware' },
  { label: '🔒 Ransomware', value: 'ransomware' },
  { label: '💸 Scam', value: 'scam' },
  { label: '💧 Data Breach', value: 'data_breach' },
  { label: '🎭 Fraud', value: 'fraud' },
  { label: '⚡ Zero Day', value: 'zero_day' },
];

export default function NewsFeed() {
  const [news, setNews] = useState<ThreatNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ThreatType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { setThreatNews, setActiveThreatCount, lastNewsUpdate } = useStore();

  const fetchNews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch news');

      const data = await res.json();
      const articles = data.news || [];
      setNews(articles);
      setThreatNews(articles);
      setActiveThreatCount(articles.filter((n: ThreatNews) => n.severity >= 3).length);
    } catch (err) {
      console.error('News fetch error:', err);
      setError('Failed to load threat intelligence. Check your API configuration.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setThreatNews, setActiveThreatCount]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filteredNews = filter === 'all' ? news : news.filter((n) => n.threat_type === filter);
  const featured = [...news].sort((a, b) => b.severity - a.severity)[0];

  return (
    <div className={styles['news-feed']}>
      {/* Header */}
      <div className={styles['feed-header']}>
        <div className={styles['feed-title-row']}>
          <div className={styles['live-indicator']}>
            <Radio size={14} />
            <span>LIVE</span>
          </div>
          <h2 className={styles['feed-title']}>Cyber Threat Intelligence Feed</h2>
        </div>
        <div className={styles['feed-meta']}>
          <span className={styles['last-update']}>
            {lastNewsUpdate ? `Last updated: ${timeAgo(lastNewsUpdate.toISOString())}` : 'Loading...'}
          </span>
          <button className={`btn-secondary ${styles['refresh-btn']}`} onClick={() => fetchNews(true)} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Threat Ticker */}
      {news.length > 0 && (
        <div className={styles['ticker-wrap']}>
          <div className={styles['ticker-track']}>
            {[...news, ...news].map((item, i) => (
              <div key={`${item.id}-${i}`} className={styles['ticker-item']}>
                <span className={styles['ticker-dot']} style={{ background: `var(--sev-${item.severity})` }} />
                <span className={styles['ticker-type']}>{getThreatIcon(item.threat_type)}</span>
                <span className={styles['ticker-text']}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className={styles['filter-bar']}>
        <Filter size={14} />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles['filter-chip']} ${filter === opt.value ? styles['filter-active'] : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles['loading-grid']}>
          <LoadingShield message="Fetching threat intelligence..." />
          <div className={styles['skeleton-grid']}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles['skeleton-card']} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className={styles['error-box']}>
          <p>⚠️ {error}</p>
          <button className="btn-primary" onClick={() => fetchNews()}>Try Again</button>
        </div>
      ) : (
        <>
          {featured && (
            <div className={styles['featured-section']}>
              <h3 className={styles['section-label']}>🚨 TOP THREAT</h3>
              <ThreatCard news={featured} />
            </div>
          )}

          <div className={styles['news-grid']}>
            {filteredNews
              .filter((n) => n.id !== featured?.id)
              .map((item) => (
                <ThreatCard key={item.id} news={item} />
              ))}
          </div>

          {filteredNews.length === 0 && (
            <div className={styles['empty-state']}>
              <p>No threats found for this filter.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

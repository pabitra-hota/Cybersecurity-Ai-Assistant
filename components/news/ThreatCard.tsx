'use client';

import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Users } from 'lucide-react';
import ThreatBadge from './ThreatBadge';
import ThreatLevel from '@/components/shared/ThreatLevel';
import { timeAgo, getSeverityColor } from '@/lib/utils';
import type { ThreatNews } from '@/types';
import styles from './ThreatCard.module.css';

export default function ThreatCard({ news }: { news: ThreatNews }) {
  const [tipsOpen, setTipsOpen] = useState(false);
  const borderColor = getSeverityColor(news.severity);

  return (
    <article
      className={styles['threat-card']}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className={styles['card-header']}>
        <ThreatLevel severity={news.severity} />
        <ThreatBadge type={news.threat_type} />
      </div>

      <h3 className={styles['card-title']}>{news.title}</h3>
      <p className={styles['card-summary']}>{news.summary}</p>

      <div className={styles['affected-targets']}>
        <Users size={12} />
        {news.affected_targets?.map((target, i) => (
          <span key={i} className={styles['target-chip']}>
            {target.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      <button className={styles['tips-toggle']} onClick={() => setTipsOpen(!tipsOpen)}>
        <span>🛡️ Prevention Tips</span>
        {tipsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {tipsOpen && (
        <ul className={styles['tips-list']}>
          {news.prevention_tips?.map((tip, i) => (
            <li key={i}>
              <span className={styles['tip-bullet']}>✓</span>
              {tip}
            </li>
          ))}
        </ul>
      )}

      <div className={styles['card-footer']}>
        <span className={styles['time-ago']}>{timeAgo(news.published_at)}</span>
        {news.source_url && (
          <a href={news.source_url} target="_blank" rel="noopener noreferrer" className={styles['read-more']}>
            Read Full Article <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  );
}

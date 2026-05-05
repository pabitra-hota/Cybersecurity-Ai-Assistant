'use client';

import React from 'react';
import { getThreatIcon } from '@/lib/utils';
import type { ThreatType } from '@/types';

export default function ThreatBadge({ type }: { type: ThreatType }) {
  const icon = getThreatIcon(type);
  const label = type.replace(/_/g, ' ');

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', background: 'rgba(59, 143, 255, 0.1)',
      border: '1px solid rgba(59, 143, 255, 0.2)', borderRadius: 12,
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const,
      letterSpacing: 0.3, color: '#3B8FFF', whiteSpace: 'nowrap' as const,
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

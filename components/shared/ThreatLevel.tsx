'use client';

import React from 'react';
import { getSeverityColor, getSeverityLabel } from '@/lib/utils';

export default function ThreatLevel({ severity }: { severity: number }) {
  const color = getSeverityColor(severity);
  const label = getSeverityLabel(severity);

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', fontSize: 11, fontWeight: 600,
      textTransform: 'uppercase' as const, letterSpacing: 0.5,
      borderRadius: 20, whiteSpace: 'nowrap' as const,
      background: `${color}15`, color: color, border: `1px solid ${color}30`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: color,
        animation: severity >= 5 ? 'pulse-glow 1.5s ease-in-out infinite' : undefined,
      }} />
      {label}
    </span>
  );
}

'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function LoadingShield({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
      <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', inset: 0, border: '2px solid transparent',
          borderTopColor: '#00FF88', borderRadius: '50%', animation: 'scan-radar 1.5s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8, border: '2px solid transparent',
          borderTopColor: '#3B8FFF', borderRadius: '50%', animation: 'scan-radar 2s linear infinite reverse',
        }} />
        <Shield size={32} style={{ color: '#00FF88', animation: 'shield-pulse 2s ease-in-out infinite' }} />
      </div>
      <p style={{ fontSize: 14, color: '#8892B0', fontWeight: 500 }}>{message}</p>
    </div>
  );
}

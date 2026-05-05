'use client';

import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const SCORE = 72;
const BREAKDOWN = [
  { label: 'Phishing', score: 85, color: '#00FF88' },
  { label: 'Malware', score: 68, color: '#3B8FFF' },
  { label: 'Browsing', score: 74, color: '#FFB800' },
  { label: 'Awareness', score: 61, color: '#FB923C' },
];

const THREAT_DIST = [
  { name: 'Phishing', value: 35, color: '#FF3B3B' },
  { name: 'Malware', value: 25, color: '#FB923C' },
  { name: 'Scam', value: 20, color: '#FFB800' },
  { name: 'Data Breach', value: 12, color: '#3B8FFF' },
  { name: 'Other', value: 8, color: '#4ADE80' },
];

const RADAR_DATA = [
  { axis: 'Phishing', user: 75, community: 60 },
  { axis: 'Malware', user: 50, community: 65 },
  { axis: 'Ransomware', user: 30, community: 45 },
  { axis: 'Social Eng.', user: 60, community: 55 },
  { axis: 'Fraud', user: 45, community: 50 },
  { axis: 'Data Breach', user: 35, community: 40 },
];

const TOP_THREATS = [
  { name: 'Phishing Sites', count: 1247 },
  { name: 'Malware Downloads', count: 893 },
  { name: 'Scam Websites', count: 654 },
  { name: 'Fake Login Pages', count: 521 },
  { name: 'SMS Fraud', count: 342 },
];

const TIPS = [
  { tip: 'Enable two-factor authentication on all banking accounts', priority: 'high' as const, category: 'Authentication' },
  { tip: 'Update your browser to the latest version to patch security vulnerabilities', priority: 'high' as const, category: 'Updates' },
  { tip: 'Review your connected app permissions on social media accounts', priority: 'medium' as const, category: 'Privacy' },
  { tip: 'Set up login alerts for your email accounts', priority: 'medium' as const, category: 'Monitoring' },
  { tip: 'Consider using a VPN when connecting to public Wi-Fi', priority: 'low' as const, category: 'Network' },
];

export default function AnalyticsPage() {
  const scoreColor = SCORE >= 70 ? 'var(--accent-green)' : SCORE >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)';

  return (
    <div className="analytics-page">
      <h2 className="page-heading">📊 Security Analytics</h2>
      <p className="page-desc">Your personalized security insights powered by AI</p>

      {/* Security Score */}
      <div className="score-section">
        <div className="main-score glass-card">
          <div className="score-ring" style={{ background: `conic-gradient(${scoreColor} ${SCORE * 3.6}deg, var(--bg-surface) 0deg)` }}>
            <div className="score-inner">
              <span className="score-num" style={{ color: scoreColor }}><AnimatedCounter value={SCORE} /></span>
              <span className="score-label">Security Score</span>
            </div>
          </div>
          <div className="score-trend" style={{ color: 'var(--accent-green)' }}>↗ Improving</div>
        </div>
        <div className="breakdown-grid">
          {BREAKDOWN.map((b) => (
            <div key={b.label} className="breakdown-card glass-card">
              <div className="mini-bar-bg">
                <div className="mini-bar" style={{ width: `${b.score}%`, background: b.color }} />
              </div>
              <span className="breakdown-score" style={{ color: b.color }}>{b.score}</span>
              <span className="breakdown-label">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Threat Distribution */}
        <div className="chart-card glass-card">
          <h3>Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={THREAT_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                {THREAT_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'var(--glass-border)', borderRadius: 8, color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {THREAT_DIST.map((d) => (
              <div key={d.name} className="legend-item">
                <span className="legend-dot" style={{ background: d.color }} />
                <span>{d.name}</span>
                <span className="legend-val">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Radar */}
        <div className="chart-card glass-card">
          <h3>Risk Exposure Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Radar name="You" dataKey="user" stroke="#00FF88" fill="#00FF88" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Community" dataKey="community" stroke="#3B8FFF" fill="#3B8FFF" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
            </RadarChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: '#00FF88' }} /><span>Your Exposure</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#3B8FFF' }} /><span>Community Average</span></div>
          </div>
        </div>

        {/* Top Threats Bar */}
        <div className="chart-card glass-card full-width">
          <h3>Community Top Threats</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TOP_THREATS} layout="vertical">
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={130} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'var(--glass-border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={20} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00FF88" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3B8FFF" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personalized Tips */}
      <div className="tips-section">
        <h3>🛡️ Personalized Security Tips</h3>
        <div className="tips-list">
          {TIPS.map((t, i) => (
            <div key={i} className="tip-card glass-card">
              <span className={`priority-badge ${t.priority}`}>{t.priority}</span>
              <p className="tip-text">{t.tip}</p>
              <span className="tip-category">{t.category}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .analytics-page { max-width: 1100px; margin: 0 auto; }
        .page-heading { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .page-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 32px; }

        .score-section { display: grid; grid-template-columns: auto 1fr; gap: 24px; margin-bottom: 32px; align-items: center; }
        @media (max-width: 768px) { .score-section { grid-template-columns: 1fr; } }
        .main-score { padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .score-ring { width: 160px; height: 160px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .score-inner { width: 130px; height: 130px; border-radius: 50%; background: var(--bg-card); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .score-num { font-size: 42px; font-weight: 700; font-family: var(--font-mono); }
        .score-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .score-trend { font-size: 13px; font-weight: 600; }

        .breakdown-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .breakdown-card { padding: 16px; display: flex; flex-direction: column; gap: 6px; }
        .mini-bar-bg { height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden; }
        .mini-bar { height: 100%; border-radius: 3px; transition: width 1s ease; }
        .breakdown-score { font-size: 24px; font-weight: 700; font-family: var(--font-mono); }
        .breakdown-label { font-size: 12px; color: var(--text-muted); }

        .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
        @media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }
        .chart-card { padding: 20px; }
        .chart-card h3 { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: var(--text-secondary); }
        .full-width { grid-column: 1 / -1; }

        .chart-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .legend-val { color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; }

        .tips-section h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .tips-list { display: flex; flex-direction: column; gap: 8px; }
        .tip-card { padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
        .priority-badge { padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .priority-badge.high { background: rgba(255,59,59,0.1); color: var(--accent-red); border: 1px solid rgba(255,59,59,0.2); }
        .priority-badge.medium { background: rgba(255,184,0,0.1); color: var(--accent-amber); border: 1px solid rgba(255,184,0,0.2); }
        .priority-badge.low { background: rgba(0,255,136,0.1); color: var(--accent-green); border: 1px solid rgba(0,255,136,0.2); }
        .tip-text { flex: 1; font-size: 14px; color: var(--text-primary); }
        .tip-category { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
      `}</style>
    </div>
  );
}

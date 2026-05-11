'use client';

import React from 'react';
import { Link2, Shield, AlertTriangle, CheckCircle, XCircle, Lock } from 'lucide-react';
import LoadingShield from '@/components/shared/LoadingShield';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { isValidUrl, getVerdictColor } from '@/lib/utils';
import { useStore } from '@/store/useStore';

export default function UrlScanPage() {
  // ── Read state from the global store (persists across tab switches) ──
  const { urlScan, setUrlScan, resetUrlScan } = useStore();
  const { url, scanning, result, error } = urlScan;

  const scanUrl = async () => {
    if (!url || !isValidUrl(url)) {
      setUrlScan({ error: 'Please enter a valid URL' });
      return;
    }
    setUrlScan({ scanning: true, error: null, result: null });
    try {
      const res = await fetch('/api/scan/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Scan failed');
      }
      setUrlScan({ result: await res.json() });
    } catch (err) {
      setUrlScan({ error: err instanceof Error ? err.message : 'Scan failed' });
    } finally {
      setUrlScan({ scanning: false });
    }
  };

  const verdictColor = result ? getVerdictColor(result.verdict as string) : '';
  const VIcon =
    result?.verdict === 'Safe' || result?.verdict === 'Clean' ? CheckCircle
    : result?.verdict === 'Suspicious' ? AlertTriangle
    : XCircle;

  return (
    <div className="url-scan-page">
      <h2 className="page-heading">🔗 URL Scanner</h2>
      <p className="page-desc">Analyze any URL for phishing, malware, and other threats</p>

      <div className="url-input-group glass-card">
        <Lock size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          className="url-input"
          type="url"
          placeholder="https://example.com/suspicious-page"
          value={url}
          onChange={(e) => setUrlScan({ url: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && scanUrl()}
        />
        <button className="btn-primary" onClick={scanUrl} disabled={scanning || !url}>
          <Shield size={16} /> Scan
        </button>
      </div>

      {scanning && (
        <div className="scan-progress glass-card">
          <LoadingShield message="Scanning URL with 90+ engines..." />
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="results-section animate-slide-up">
          <div className="verdict-banner glass-card" style={{ borderColor: `${verdictColor}40` }}>
            <VIcon size={48} style={{ color: verdictColor }} />
            <div className="verdict-info">
              <h3 style={{ color: verdictColor, fontSize: 28, fontWeight: 700 }}>{result.verdict as string}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{result.ai_explanation as string}</p>
            </div>
            <div className="risk-circle" style={{ borderColor: verdictColor }}>
              <AnimatedCounter value={result.risk_score as number} suffix="/100" />
              <span className="risk-lbl">Risk</span>
            </div>
          </div>

          <div className="url-breakdown glass-card">
            <h4><Link2 size={14} /> URL Breakdown</h4>
            <code className="url-display">{result.target as string}</code>
          </div>

          <div className="stats-row">
            <div className="stat glass-card"><span className="sv" style={{color:'var(--accent-red)'}}><AnimatedCounter value={result.malicious_count as number}/></span><span className="sl">Malicious</span></div>
            <div className="stat glass-card"><span className="sv" style={{color:'var(--accent-amber)'}}><AnimatedCounter value={result.suspicious_count as number}/></span><span className="sl">Suspicious</span></div>
            <div className="stat glass-card"><span className="sv" style={{color:'var(--accent-green)'}}><AnimatedCounter value={(result.total_engines as number)-(result.malicious_count as number)}/></span><span className="sl">Clean</span></div>
            <div className="stat glass-card"><span className="sv" style={{color:'var(--accent-blue)'}}><AnimatedCounter value={result.total_engines as number}/></span><span className="sl">Engines</span></div>
          </div>

          <div className="recommendation glass-card">
            <h4>🛡️ Recommendation</h4>
            <p>{result.ai_recommendation as string}</p>
          </div>

          {/* Reset button — clears URL and results from the store */}
          <button className="btn-secondary" onClick={resetUrlScan}>
            Scan Another URL
          </button>
        </div>
      )}

      <style jsx>{`
        .url-scan-page { max-width: 800px; margin: 0 auto; }
        .page-heading { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .page-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
        .url-input-group { display: flex; align-items: center; gap: 12px; padding: 8px 16px; margin-bottom: 20px; }
        .url-input { flex: 1; background: none; border: none; color: var(--text-primary); font-size: 15px; font-family: var(--font-mono); outline: none; padding: 10px 0; }
        .url-input::placeholder { color: var(--text-muted); }
        .scan-progress { padding: 32px; text-align: center; margin-bottom: 20px; }
        .error-banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(255,59,59,0.1); border: 1px solid rgba(255,59,59,0.2); border-radius: 8px; color: var(--accent-red); font-size: 14px; margin-bottom: 20px; }
        .results-section { display: flex; flex-direction: column; gap: 16px; }
        .verdict-banner { display: flex; align-items: center; gap: 20px; padding: 24px; border: 1px solid; flex-wrap: wrap; }
        .verdict-info { flex: 1; min-width: 200px; }
        .risk-circle { width: 80px; height: 80px; border-radius: 50%; border: 3px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .risk-circle span:first-child { font-size: 18px; font-weight: 700; }
        .risk-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
        .url-breakdown { padding: 16px; }
        .url-breakdown h4 { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
        .url-display { display: block; padding: 12px; background: var(--bg-surface); border-radius: 6px; font-size: 13px; color: var(--accent-green); word-break: break-all; }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 600px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
        .stat { padding: 16px; text-align: center; }
        .sv { font-size: 28px; font-weight: 700; display: block; }
        .sl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
        .recommendation { padding: 20px; }
        .recommendation h4 { margin-bottom: 8px; font-size: 14px; }
        .recommendation p { color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
      `}</style>
    </div>
  );
}

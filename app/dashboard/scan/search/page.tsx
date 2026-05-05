'use client';

import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, Hash, Globe, Wifi } from 'lucide-react';
import LoadingShield from '@/components/shared/LoadingShield';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { detectSearchType, getVerdictColor } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectedType = query ? detectSearchType(query) : null;
  const typeIcons = { hash: Hash, domain: Globe, ip: Wifi, unknown: Search };
  const TypeIcon = detectedType ? typeIcons[detectedType] : Search;

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/scan/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Search failed'); }
      setResult(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : 'Search failed'); }
    finally { setSearching(false); }
  };

  const verdictColor = result ? getVerdictColor(result.verdict as string) : '';

  return (
    <div className="search-page">
      <h2 className="page-heading">🔎 Threat Search</h2>
      <p className="page-desc">Search for file hashes (MD5/SHA1/SHA256), domains, or IP addresses</p>

      <div className="search-input-group glass-card">
        <TypeIcon size={18} style={{ color: detectedType && detectedType !== 'unknown' ? 'var(--accent-green)' : 'var(--text-muted)', flexShrink: 0 }} />
        <input className="search-input" placeholder="Enter hash, domain, or IP address..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} />
        {detectedType && detectedType !== 'unknown' && (
          <span className="type-badge badge-green">{detectedType}</span>
        )}
        <button className="btn-primary" onClick={doSearch} disabled={searching || !query.trim()}>
          <Shield size={16} /> Search
        </button>
      </div>

      <div className="type-hints">
        <span>Examples:</span>
        <code>44d88612fea8a8f36de82e1278abb02f</code>
        <code>example.com</code>
        <code>8.8.8.8</code>
      </div>

      {searching && <div className="scan-progress glass-card"><LoadingShield message="Searching threat databases..." /></div>}
      {error && <div className="error-banner"><AlertTriangle size={16} /><span>{error}</span></div>}

      {result && (
        <div className="results-section animate-slide-up">
          <div className="verdict-banner glass-card" style={{ borderLeft: `4px solid ${verdictColor}` }}>
            <div>
              <h3 style={{ color: verdictColor, fontSize: 24, fontWeight: 700 }}>{result.verdict as string}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{result.ai_explanation as string}</p>
            </div>
            {typeof result.risk_score === 'number' && (
              <div className="risk-circle" style={{ borderColor: verdictColor }}>
                <AnimatedCounter value={result.risk_score as number} /><span>Risk</span>
              </div>
            )}
          </div>

          {typeof result.malicious_count === 'number' && (
            <div className="stats-row">
              <div className="stat glass-card"><span className="sv" style={{color:'var(--accent-red)'}}><AnimatedCounter value={result.malicious_count as number}/></span><span className="sl">Malicious</span></div>
              <div className="stat glass-card"><span className="sv" style={{color:'var(--accent-amber)'}}><AnimatedCounter value={result.suspicious_count as number}/></span><span className="sl">Suspicious</span></div>
              <div className="stat glass-card"><span className="sv" style={{color:'var(--accent-blue)'}}><AnimatedCounter value={result.total_engines as number}/></span><span className="sl">Engines</span></div>
            </div>
          )}

          <button className="btn-secondary" onClick={() => { setQuery(''); setResult(null); }}>Search Again</button>
        </div>
      )}

      <style jsx>{`
        .search-page { max-width: 800px; margin: 0 auto; }
        .page-heading { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .page-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
        .search-input-group { display: flex; align-items: center; gap: 12px; padding: 8px 16px; margin-bottom: 12px; }
        .search-input { flex: 1; background: none; border: none; color: var(--text-primary); font-size: 15px; font-family: var(--font-mono); outline: none; padding: 10px 0; }
        .search-input::placeholder { color: var(--text-muted); font-family: var(--font-ui); }
        .type-hints { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; font-size: 12px; color: var(--text-muted); }
        .type-hints code { padding: 2px 8px; background: var(--bg-card); border-radius: 4px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); }
        .scan-progress { padding: 32px; text-align: center; margin-bottom: 20px; }
        .error-banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(255,59,59,0.1); border: 1px solid rgba(255,59,59,0.2); border-radius: 8px; color: var(--accent-red); font-size: 14px; margin-bottom: 20px; }
        .results-section { display: flex; flex-direction: column; gap: 16px; }
        .verdict-banner { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 24px; flex-wrap: wrap; }
        .risk-circle { width: 70px; height: 70px; border-radius: 50%; border: 3px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; }
        .risk-circle span:last-child { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 400; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat { padding: 16px; text-align: center; }
        .sv { font-size: 28px; font-weight: 700; display: block; }
        .sl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
      `}</style>
    </div>
  );
}

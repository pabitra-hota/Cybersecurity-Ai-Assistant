'use client';

import React, { useRef } from 'react';
import { Upload, FileIcon, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import LoadingShield from '@/components/shared/LoadingShield';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { formatFileSize, getVerdictColor } from '@/lib/utils';
import { useStore } from '@/store/useStore';

export default function FileScanPage() {
  // ── Read state from the global store (persists across tab switches) ──
  const { fileScan, setFileScan, resetFileScan } = useStore();
  const { scanning, result, error, progress, step } = fileScan;

  // We keep the actual File object in a ref because File is not serialisable
  // to the store. The store saves metadata (name/size/type) for display.
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // When user picks a file, save the File object to the ref and
  // save display metadata (name, size, type) to the store.
  const handleFile = (f: File) => {
    fileRef.current = f;
    setFileScan({
      file: { name: f.name, size: f.size, type: f.type },
      result: null,
      error: null,
      progress: 0,
      step: '',
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const scanFile = async () => {
    const file = fileRef.current;
    if (!file) return;

    setFileScan({ scanning: true, error: null, result: null, progress: 0 });

    try {
      setFileScan({ step: 'Uploading file...', progress: 10 });
      const formData = new FormData();
      formData.append('file', file);

      setFileScan({ step: 'Scanning with 70+ engines...', progress: 30 });

      const res = await fetch('/api/scan/file', { method: 'POST', body: formData });

      setFileScan({ step: 'AI analyzing results...', progress: 70 });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Scan failed');
      }

      const data = await res.json();
      setFileScan({ progress: 100, step: 'Complete', result: data });
    } catch (err) {
      setFileScan({ error: err instanceof Error ? err.message : 'Scan failed' });
    } finally {
      setFileScan({ scanning: false });
    }
  };

  const verdictColor = result ? getVerdictColor(result.verdict as string) : '';
  const VerdictIcon =
    result?.verdict === 'Clean' ? CheckCircle
    : result?.verdict === 'Suspicious' ? AlertTriangle
    : XCircle;

  return (
    <div className="file-scan-page">
      <h2 className="page-heading">🔍 File Scanner</h2>
      <p className="page-desc">Upload a file to scan it with 70+ antivirus engines and AI analysis</p>

      {/* Drop Zone */}
      <div
        className={`drop-zone glass-card ${dragOver ? 'drop-active' : ''} ${fileScan.file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {fileScan.file ? (
          <div className="file-preview">
            <FileIcon size={40} style={{ color: 'var(--accent-green)' }} />
            <div className="file-info">
              <span className="file-name">{fileScan.file.name}</span>
              <span className="file-meta">{formatFileSize(fileScan.file.size)} · {fileScan.file.type || 'Unknown type'}</span>
            </div>
          </div>
        ) : (
          <div className="drop-content">
            <Upload size={48} style={{ color: dragOver ? 'var(--accent-green)' : 'var(--text-muted)' }} />
            <p className="drop-text">{dragOver ? 'Drop to scan' : 'Drag & drop a file or click to browse'}</p>
            <p className="drop-hint">Max file size: 32MB</p>
          </div>
        )}
      </div>

      {/* Scan Button — shown only when a file is selected and not currently scanning */}
      {fileScan.file && !scanning && !result && (
        <button className="btn-primary scan-btn" onClick={scanFile}>
          <Shield size={18} />
          Scan File
        </button>
      )}

      {/* Scanning Progress */}
      {scanning && (
        <div className="scan-progress glass-card">
          <LoadingShield message={step} />
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-text">{progress}%</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="results-section animate-slide-up">
          {/* Verdict Banner */}
          <div className="verdict-banner glass-card" style={{ borderColor: `${verdictColor}40` }}>
            <VerdictIcon size={48} style={{ color: verdictColor }} />
            <div className="verdict-info">
              <h3 className="verdict-label" style={{ color: verdictColor }}>{result.verdict as string}</h3>
              <p className="verdict-desc">{result.ai_explanation as string}</p>
            </div>
            <div className="risk-score-circle" style={{ borderColor: verdictColor }}>
              <AnimatedCounter value={result.risk_score as number} suffix="/100" />
              <span className="risk-label">Risk</span>
            </div>
          </div>

          {/* Detection Stats */}
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <span className="stat-value" style={{ color: 'var(--accent-red)' }}>
                <AnimatedCounter value={result.malicious_count as number} />
              </span>
              <span className="stat-label">Malicious</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-value" style={{ color: 'var(--accent-amber)' }}>
                <AnimatedCounter value={result.suspicious_count as number} />
              </span>
              <span className="stat-label">Suspicious</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-value" style={{ color: 'var(--accent-green)' }}>
                <AnimatedCounter value={(result.total_engines as number) - (result.malicious_count as number) - (result.suspicious_count as number)} />
              </span>
              <span className="stat-label">Clean</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>
                <AnimatedCounter value={result.total_engines as number} />
              </span>
              <span className="stat-label">Total Engines</span>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="recommendation glass-card">
            <h4>🛡️ Recommendation</h4>
            <p>{result.ai_recommendation as string}</p>
          </div>

          {/* Engine Results Table */}
          {(result.engine_results as Array<Record<string, string>>)?.length > 0 && (
            <div className="engines-section glass-card">
              <h4>Engine Results</h4>
              <div className="engines-table">
                {(result.engine_results as Array<Record<string, string>>).slice(0, 20).map((eng, i) => (
                  <div key={i} className="engine-row">
                    <span className="engine-name">{eng.engine_name}</span>
                    <span className={`engine-result ${eng.category === 'malicious' ? 'malicious' : eng.category === 'suspicious' ? 'suspicious' : 'clean'}`}>
                      {eng.result || eng.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset button — clears store state and the file ref */}
          <button className="btn-secondary" onClick={() => { fileRef.current = null; resetFileScan(); }}>
            Scan Another File
          </button>
        </div>
      )}

      <style jsx>{`
        .file-scan-page { max-width: 800px; margin: 0 auto; }
        .page-heading { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .page-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }

        .drop-zone {
          padding: 48px; text-align: center; cursor: pointer;
          border: 2px dashed var(--border); transition: all 0.3s;
          margin-bottom: 20px;
        }
        .drop-zone:hover, .drop-active {
          border-color: var(--accent-green);
          background: rgba(0,255,136,0.03);
        }
        .drop-active { box-shadow: var(--glow-green); }
        .has-file { border-style: solid; border-color: var(--accent-green); }
        .drop-content { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .drop-text { font-size: 16px; color: var(--text-secondary); }
        .drop-hint { font-size: 12px; color: var(--text-muted); }

        .file-preview { display: flex; align-items: center; gap: 16px; justify-content: center; }
        .file-info { display: flex; flex-direction: column; text-align: left; }
        .file-name { font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .file-meta { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }

        .scan-btn { width: 100%; padding: 14px; font-size: 16px; margin-bottom: 20px; }

        .scan-progress { padding: 32px; text-align: center; margin-bottom: 20px; }
        .progress-bar-container { height: 6px; background: var(--bg-surface); border-radius: 3px; margin-top: 16px; overflow: hidden; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, var(--accent-green), var(--accent-blue)); border-radius: 3px; transition: width 0.5s ease; }
        .progress-text { font-size: 14px; color: var(--accent-green); margin-top: 8px; font-family: var(--font-mono); }

        .error-banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(255,59,59,0.1); border: 1px solid rgba(255,59,59,0.2); border-radius: 8px; color: var(--accent-red); font-size: 14px; margin-bottom: 20px; }

        .results-section { display: flex; flex-direction: column; gap: 16px; }
        .verdict-banner { display: flex; align-items: center; gap: 20px; padding: 24px; border: 1px solid; flex-wrap: wrap; }
        .verdict-info { flex: 1; min-width: 200px; }
        .verdict-label { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .verdict-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .risk-score-circle { width: 80px; height: 80px; border-radius: 50%; border: 3px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .risk-score-circle span:first-child { font-size: 18px; font-weight: 700; }
        .risk-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .stat-card { padding: 16px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: 700; display: block; }
        .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        .recommendation { padding: 20px; }
        .recommendation h4 { margin-bottom: 8px; font-size: 14px; }
        .recommendation p { color: var(--text-secondary); font-size: 14px; line-height: 1.6; }

        .engines-section { padding: 20px; }
        .engines-section h4 { margin-bottom: 12px; font-size: 14px; }
        .engines-table { display: flex; flex-direction: column; gap: 4px; }
        .engine-row { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg-surface); border-radius: 6px; font-size: 13px; }
        .engine-name { color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; }
        .engine-result { font-weight: 600; text-transform: capitalize; }
        .engine-result.clean { color: var(--accent-green); }
        .engine-result.malicious { color: var(--accent-red); }
        .engine-result.suspicious { color: var(--accent-amber); }
      `}</style>
    </div>
  );
}

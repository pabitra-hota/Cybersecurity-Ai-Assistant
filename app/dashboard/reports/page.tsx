'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, Upload } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'phishing_email', icon: '📧', label: 'Phishing Email' },
  { value: 'online_scam', icon: '💸', label: 'Online Scam' },
  { value: 'suspicious_link', icon: '🔗', label: 'Suspicious Link' },
  { value: 'sms_fraud', icon: '📱', label: 'SMS Fraud' },
  { value: 'voice_phishing', icon: '📞', label: 'Voice Phishing' },
  { value: 'ecommerce_fraud', icon: '🛒', label: 'E-commerce Fraud' },
  { value: 'other', icon: '🔍', label: 'Other' },
];

const SEVERITIES = [
  { value: 'low', label: 'Low', color: 'var(--sev-1)' },
  { value: 'medium', label: 'Medium', color: 'var(--sev-2)' },
  { value: 'high', label: 'High', color: 'var(--sev-3)' },
  { value: 'critical', label: 'Critical', color: 'var(--sev-4)' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to /api/reports and save to Supabase
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReportType(''); setTarget(''); setDescription(''); setSeverity('');
    }, 3000);
  };

  return (
    <div className="reports-page">
      <h2 className="page-heading">📋 Submit a Report</h2>
      <p className="page-desc">Help the community by reporting cybersecurity threats you encounter</p>

      {submitted ? (
        <div className="success-card glass-card animate-slide-up">
          <CheckCircle size={48} style={{ color: 'var(--accent-green)' }} />
          <h3>Report Submitted Successfully!</h3>
          <p>Thank you for helping keep the community safe. Our AI will analyze your report.</p>
        </div>
      ) : (
        <form className="report-form" onSubmit={handleSubmit}>
          {/* Report Type */}
          <div className="form-section">
            <label className="form-label">Report Type</label>
            <div className="type-grid">
              {REPORT_TYPES.map((t) => (
                <button key={t.value} type="button"
                  className={`type-btn glass-card ${reportType === t.value ? 'type-active' : ''}`}
                  onClick={() => setReportType(t.value)}>
                  <span className="type-icon">{t.icon}</span>
                  <span className="type-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div className="form-section">
            <label className="form-label">Target (URL / Email / Phone)</label>
            <input className="input-field" placeholder="e.g., suspicious-site.com or scam@email.com" value={target} onChange={(e) => setTarget(e.target.value)} required />
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label">What happened?</label>
            <textarea className="input-field textarea" placeholder="Describe the incident..." value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} rows={4} required />
            <span className="char-count">{description.length}/500</span>
          </div>

          {/* Severity */}
          <div className="form-section">
            <label className="form-label">Severity</label>
            <div className="severity-options">
              {SEVERITIES.map((s) => (
                <button key={s.value} type="button"
                  className={`severity-btn ${severity === s.value ? 'severity-active' : ''}`}
                  style={{ '--sev-color': s.color } as React.CSSProperties}
                  onClick={() => setSeverity(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="form-section">
            <label className="form-label">Evidence (Optional)</label>
            <div className="upload-area glass-card">
              <Upload size={20} style={{ color: 'var(--text-muted)' }} />
              <span>Upload screenshot or file evidence</span>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="form-section toggle-row">
            <label className="form-label">Submit anonymously</label>
            <button type="button" className={`toggle ${anonymous ? 'toggle-on' : ''}`} onClick={() => setAnonymous(!anonymous)}>
              <div className="toggle-dot" />
            </button>
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={!reportType || !target || !severity}>
            <Send size={16} /> Submit Report
          </button>
        </form>
      )}

      <style jsx>{`
        .reports-page { max-width: 700px; margin: 0 auto; }
        .page-heading { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .page-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 32px; }

        .success-card { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px; text-align: center; }
        .success-card h3 { font-size: 20px; color: var(--accent-green); }
        .success-card p { color: var(--text-secondary); font-size: 14px; }

        .report-form { display: flex; flex-direction: column; gap: 24px; }
        .form-section { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

        .type-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
        .type-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; font-family: var(--font-ui); background: var(--glass-bg); }
        .type-btn:hover { border-color: var(--accent-green); }
        .type-active { border-color: var(--accent-green) !important; background: rgba(0,255,136,0.05) !important; }
        .type-icon { font-size: 24px; }
        .type-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }

        .textarea { resize: vertical; min-height: 100px; }
        .char-count { font-size: 11px; color: var(--text-muted); text-align: right; }

        .severity-options { display: flex; gap: 8px; flex-wrap: wrap; }
        .severity-btn { padding: 8px 20px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: var(--font-ui); }
        .severity-btn:hover { border-color: var(--sev-color); color: var(--sev-color); }
        .severity-active { border-color: var(--sev-color) !important; color: var(--sev-color) !important; background: rgba(255,255,255,0.03); }

        .upload-area { display: flex; align-items: center; gap: 12px; padding: 20px; cursor: pointer; color: var(--text-muted); font-size: 13px; }
        .upload-area:hover { border-color: var(--accent-green); }

        .toggle-row { flex-direction: row; align-items: center; justify-content: space-between; }
        .toggle { width: 44px; height: 24px; border-radius: 12px; background: var(--bg-surface); border: 1px solid var(--border); cursor: pointer; position: relative; transition: all 0.2s; padding: 0; }
        .toggle-on { background: rgba(0,255,136,0.2); border-color: var(--accent-green); }
        .toggle-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--text-muted); position: absolute; top: 2px; left: 2px; transition: all 0.2s; }
        .toggle-on .toggle-dot { left: 22px; background: var(--accent-green); }

        .submit-btn { width: 100%; padding: 14px; font-size: 16px; }
      `}</style>
    </div>
  );
}

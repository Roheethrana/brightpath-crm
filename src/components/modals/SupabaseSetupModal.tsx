import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Database, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { getSupabaseConfigStatus, testSupabaseConnection } from '../../lib/supabaseClient';
import { Button } from '../common/Button';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [pingState, setPingState] = useState<{
    isLoading: boolean;
    result?: { success: boolean; latencyMs?: number; message: string };
  }>({ isLoading: false });

  if (!isOpen) return null;

  const config = getSupabaseConfigStatus();

  const envSnippet = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePingTest = async () => {
    setPingState({ isLoading: true });
    const result = await testSupabaseConnection();
    setPingState({ isLoading: false, result });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: config.isConfigured ? '#ecfdf5' : '#fff1f2',
                color: config.isConfigured ? '#059669' : '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Supabase Connection Manager
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                PostgreSQL Database & Auth Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.375rem', borderRadius: '50%' }}
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* Status Alert Banner */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: config.isConfigured ? '#ecfdf5' : '#fff1f2',
              border: `1px solid ${config.isConfigured ? '#a7f3d0' : '#fecdd3'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            {config.isConfigured ? (
              <ShieldCheck size={20} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={20} color="#e11d48" style={{ marginTop: '2px', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: config.isConfigured ? '#065f46' : '#9f1239' }}>
                {config.isConfigured ? 'Connected to Supabase' : 'Environment Variables Not Configured'}
              </div>
              <p style={{ fontSize: '0.8125rem', color: config.isConfigured ? '#047857' : '#be123c', marginTop: '0.2rem' }}>
                {config.isConfigured
                  ? `Client initialized with endpoint: ${config.urlPreview}`
                  : 'BrightPath CRM requires your Supabase Project URL and Anon API key to enable multi-user authentication and lead persistence.'}
              </p>
            </div>
          </div>

          {/* Setup Instructions */}
          {!config.isConfigured && (
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--color-primary)' }}>
                How to Connect in 3 Simple Steps:
              </h4>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'underline' }}>Supabase Dashboard <ExternalLink size={12} style={{ display: 'inline' }} /></a> and create or open your project.
                </li>
                <li>
                  Navigate to <strong>Project Settings &rarr; API</strong>.
                </li>
                <li>
                  Copy the <strong>Project URL</strong> and <strong>anon (public)</strong> API key into your local <code>.env</code> file.
                </li>
              </ol>
            </div>
          )}

          {/* Code Snippet Box */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Required Keys in <code>.env</code>
              </span>
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Template'}
              </button>
            </div>
            <pre className="code-box">
              <code>{envSnippet}</code>
            </pre>
          </div>

          {/* Live Ping Tool */}
          {config.isConfigured && (
            <div
              style={{
                backgroundColor: 'var(--color-bg-app)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Test Live Connection</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Sends a lightweight ping to verify credentials and measure latency.
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={handlePingTest}
                  isLoading={pingState.isLoading}
                  icon={<Activity size={16} />}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  Ping Supabase
                </Button>
              </div>

              {pingState.result && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    backgroundColor: pingState.result.success ? '#ecfdf5' : '#fff1f2',
                    color: pingState.result.success ? '#065f46' : '#991b1b',
                    border: `1px solid ${pingState.result.success ? '#a7f3d0' : '#fecaca'}`
                  }}
                >
                  <strong>{pingState.result.success ? 'Success: ' : 'Error: '}</strong>
                  {pingState.result.message}
                </div>
              )}
            </div>
          )}

          {/* Security Note */}
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
            🔒 <strong>Security Guarantee:</strong> Only public client keys are accepted here. <code>service_role</code> keys are strictly prohibited in the frontend bundle.
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {!config.isConfigured && (
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Open Supabase Dashboard
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

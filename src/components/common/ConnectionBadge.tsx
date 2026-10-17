import React from 'react';
import { Database } from 'lucide-react';
import { getSupabaseConfigStatus } from '../../lib/supabaseClient';

interface ConnectionBadgeProps {
  onClick: () => void;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ onClick }) => {
  const config = getSupabaseConfigStatus();
  const isConnected = config.isConfigured;

  return (
    <button
      onClick={onClick}
      className="connection-pill"
      title={isConnected ? `Connected to ${config.urlPreview}` : 'Click to configure Supabase'}
      aria-label="Supabase Connection Status"
    >
      <span className={isConnected ? 'beacon-dot-connected' : 'beacon-dot-disconnected'} />
      <Database size={14} color={isConnected ? '#059669' : '#e11d48'} />
      <span style={{ color: isConnected ? '#059669' : '#be123c' }}>
        {isConnected ? 'Database Connected' : 'Setup Required'}
      </span>
    </button>
  );
};

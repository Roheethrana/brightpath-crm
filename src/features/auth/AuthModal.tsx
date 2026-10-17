import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { UserRole } from '../../types/database.types';
import { getSupabaseConfigStatus } from '../../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSetupModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenSetupModal }) => {
  const { signIn, signUp, setDemoRole, role: currentRole } = useAuth();
  const config = getSupabaseConfigStatus();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('counsellor');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!config.isConfigured) {
      setErrorMessage('Supabase is not configured yet. Configure your keys or use the Demo Roles below.');
      return;
    }

    setIsLoading(true);

    if (mode === 'signin') {
      const result = await signIn(email, password);
      setIsLoading(false);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      const result = await signUp(email, password, fullName, selectedRole);
      setIsLoading(false);
      if (result.success) {
        setSuccessMessage('Account registered successfully! If email confirmation is enabled in Supabase, please verify your inbox.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.error || 'Failed to create account.');
      }
    }
  };

  const handleSimulateRole = (role: UserRole) => {
    setDemoRole(role);
    setSuccessMessage(`Switched perspective to ${role.toUpperCase()} role.`);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
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
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {mode === 'signin' ? 'Sign In to BrightPath' : 'Create Staff Account'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Role-based access for academy team
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.375rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: 'none',
              borderBottom: mode === 'signin' ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: 'none',
              borderBottom: mode === 'signup' ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Register Staff
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#fff1f2',
                color: '#9f1239',
                border: '1px solid #fecdd3',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
              <input
                type="email"
                placeholder="staff@brightpath.academy"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                Designated Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem'
                }}
              >
                <option value="counsellor">Counsellor (Manages assigned leads)</option>
                <option value="manager">Manager (Reviews pipeline & overdue leads)</option>
                <option value="admin">Administrator (Full system access)</option>
              </select>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {mode === 'signin' ? 'Sign In to Account' : 'Register Account'}
          </Button>

          {/* Workshop Quick Role Switcher for instant testing */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Workshop Quick Roles
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
                Active: <strong>{currentRole.toUpperCase()}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleSimulateRole('counsellor')}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem',
                  borderColor: currentRole === 'counsellor' ? '#10b981' : undefined
                }}
              >
                Counsellor
              </button>
              <button
                type="button"
                onClick={() => handleSimulateRole('manager')}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem',
                  borderColor: currentRole === 'manager' ? '#6366f1' : undefined
                }}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleSimulateRole('admin')}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem',
                  borderColor: currentRole === 'admin' ? '#e11d48' : undefined
                }}
              >
                Admin
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div style={{ padding: '0.875rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={14} color="#059669" />
            <span>Supabase GoTrue Auth</span>
          </div>

          {!config.isConfigured && onOpenSetupModal && (
            <button
              onClick={() => { onClose(); onOpenSetupModal(); }}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--color-accent)' }}
            >
              Setup Supabase Keys <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

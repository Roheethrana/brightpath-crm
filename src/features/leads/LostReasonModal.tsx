import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface LostReasonModalProps {
  isOpen: boolean;
  studentName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  'Course fee out of budget',
  'Batch timings not suitable',
  'Enrolled with competing institute',
  'Relocating to another city / state',
  'Decided to postpone study plans',
  'Looking for different specialization',
  'Unable to contact / unreachable after multiple calls',
];

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  studentName,
  onClose,
  onConfirm,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalReason = isCustom ? customReason.trim() : selectedPreset;

    if (!finalReason) {
      setError('A concrete reason is mandatory when marking an enquiry as Lost.');
      return;
    }

    if (finalReason.length < 5) {
      setError('Please provide at least 5 characters explaining why the lead was lost.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(finalReason);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update lost reason';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-danger)',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Mark Enquiry as Lost
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                Student: <strong>{studentName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-subtle)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '1rem', lineHeight: 1.5 }}>
            To maintain high admissions audit quality, BrightPath CRM requires capturing why this enquiry was lost before updating pipeline stages.
          </p>

          {error && (
            <div
              style={{
                padding: '0.625rem 0.75rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                color: '#991b1b',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Quick Preset Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
              Common Reasons
            </label>
            <select
              value={isCustom ? 'custom' : selectedPreset}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setSelectedPreset(e.target.value);
                }
              }}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              {COMMON_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="custom">Other (Custom explanation)</option>
            </select>
          </div>

          {/* Custom Reason input */}
          {isCustom && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                Detailed Explanation <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Specify the detailed reason why this student chose not to proceed..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording Loss...' : 'Confirm Lost Status'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

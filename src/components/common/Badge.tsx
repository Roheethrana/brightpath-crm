import React from 'react';

export type BadgeVariant = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'admin' | 'manager' | 'counsellor' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, icon }) => {
  let className = 'badge';
  
  switch (variant) {
    case 'new':
      className += ' badge-new';
      break;
    case 'contacted':
      className += ' badge-contacted';
      break;
    case 'qualified':
      className += ' badge-qualified';
      break;
    case 'converted':
      className += ' badge-converted';
      break;
    case 'lost':
      className += ' badge-lost';
      break;
    case 'admin':
      className += ' badge-role-admin';
      break;
    case 'manager':
      className += ' badge-role-manager';
      break;
    case 'counsellor':
      className += ' badge-role-counsellor';
      break;
    default:
      className += ' badge-secondary';
      break;
  }

  return (
    <span className={className}>
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </span>
  );
};

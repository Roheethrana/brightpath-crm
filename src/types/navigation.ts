export type NavTab = 'dashboard' | 'leads' | 'followups' | 'settings';

export interface UserRoleInfo {
  name: string;
  role: 'admin' | 'manager' | 'counsellor';
  email: string;
}

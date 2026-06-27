export type Role =
  | 'skip-level-manager'
  | 'manager'
  | 'peer'
  | 'direct-report'
  | 'skip-level-report';

export const ROLES: { value: Role; label: string }[] = [
  { value: 'skip-level-manager', label: 'Skip-Level Manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'peer', label: 'Peer' },
  { value: 'direct-report', label: 'Direct Report' },
  { value: 'skip-level-report', label: 'Skip-Level Report' }
];

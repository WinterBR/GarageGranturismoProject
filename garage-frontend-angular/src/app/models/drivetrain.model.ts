/**
 * Drivetrain layout, mirroring the backend's Drivetrain enum.
 * "FOUR_WD" is the wire value for "4WD" (Java identifiers can't start
 * with a digit) — see DRIVETRAIN_OPTIONS for the human-friendly label.
 */
export type Drivetrain =
  | 'FF'
  | 'FR'
  | 'FA'
  | 'MR'
  | 'MF'
  | 'MA'
  | 'RR'
  | 'RF'
  | 'FOUR_WD'
  | 'AWD';

export interface DrivetrainOption {
  value: Drivetrain;
  label: string;
  description: string;
}

export const DRIVETRAIN_OPTIONS: DrivetrainOption[] = [
  { value: 'FF', label: 'FF', description: 'Front engine, Front-wheel drive' },
  { value: 'FR', label: 'FR', description: 'Front engine, Rear-wheel drive' },
  { value: 'FA', label: 'FA', description: 'Front engine, All-wheel drive' },
  { value: 'MR', label: 'MR', description: 'Mid engine, Rear-wheel drive' },
  { value: 'MF', label: 'MF', description: 'Mid engine, Front-wheel drive' },
  { value: 'MA', label: 'MA', description: 'Mid engine, All-wheel drive' },
  { value: 'RR', label: 'RR', description: 'Rear engine, Rear-wheel drive' },
  { value: 'RF', label: 'RF', description: 'Rear engine, Front-wheel drive' },
  { value: 'FOUR_WD', label: '4WD', description: 'Permanent four-wheel drive' },
  { value: 'AWD', label: 'AWD', description: 'All-wheel drive (on-demand)' },
];

export function drivetrainLabel(value: Drivetrain | string | null | undefined): string {
  const found = DRIVETRAIN_OPTIONS.find((o) => o.value === value);
  return found ? found.label : (value ?? '—');
}

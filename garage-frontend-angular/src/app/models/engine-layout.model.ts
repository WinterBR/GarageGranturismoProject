/**
 * Engine cylinder layout, mirroring the backend's EngineLayout enum.
 */
export type EngineLayout =
  | 'I3'
  | 'I4'
  | 'I5'
  | 'I6'
  | 'FLAT4'
  | 'FLAT6'
  | 'V4'
  | 'V6'
  | 'V8'
  | 'V10'
  | 'V12'
  | 'V16'
  | 'W8'
  | 'W12'
  | 'W16'
  | 'ROTARY'
  | 'ELECTRIC'
  | 'HYBRID';

export interface EngineLayoutOption {
  value: EngineLayout;
  label: string;
  description: string;
}

export const ENGINE_LAYOUT_OPTIONS: EngineLayoutOption[] = [
  { value: 'I3',       label: 'I3',       description: 'Inline-3' },
  { value: 'I4',       label: 'I4',       description: 'Inline-4' },
  { value: 'I5',       label: 'I5',       description: 'Inline-5' },
  { value: 'I6',       label: 'I6',       description: 'Inline-6' },
  { value: 'FLAT4',    label: 'Flat-4',   description: 'Flat-4 / Boxer-4' },
  { value: 'FLAT6',    label: 'Flat-6',   description: 'Flat-6 / Boxer-6' },
  { value: 'V4',       label: 'V4',       description: 'V4' },
  { value: 'V6',       label: 'V6',       description: 'V6' },
  { value: 'V8',       label: 'V8',       description: 'V8' },
  { value: 'V10',      label: 'V10',      description: 'V10' },
  { value: 'V12',      label: 'V12',      description: 'V12' },
  { value: 'V16',      label: 'V16',      description: 'V16' },
  { value: 'W8',       label: 'W8',       description: 'W8' },
  { value: 'W12',      label: 'W12',      description: 'W12' },
  { value: 'W16',      label: 'W16',      description: 'W16' },
  { value: 'ROTARY',   label: 'Rotary',   description: 'Rotary (Wankel)' },
  { value: 'ELECTRIC', label: 'Electric', description: 'Electric motor(s), no combustion engine' },
  { value: 'HYBRID',   label: 'Hybrid',   description: 'Hybrid powertrain (combustion + electric)' },
];

export function engineLayoutLabel(value: EngineLayout | string | null | undefined): string {
  const found = ENGINE_LAYOUT_OPTIONS.find((o) => o.value === value);
  return found ? found.label : (value ?? '—');
}

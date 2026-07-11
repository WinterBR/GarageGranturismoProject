/**
 * The backend models a car's color as a single `colorHex` string
 * (e.g. "#C40233"), since most cars are a single solid color.
 *
 * To support multi-color liveries (like the reference screenshots,
 * which show vertical rectangles split into several colored bands —
 * e.g. white/dark-red/dark-red, or white/red/light-blue), the frontend
 * encodes multiple color bands into that same string using a compact
 * "color:percentage" list separated by semicolons:
 *
 *   "#FFFFFF:40;#8B0000:35;#C0C0C0:25"
 *
 * A plain "#C40233" (no semicolon) is treated as a single 100% band,
 * so cars created directly through the API (or via Swagger) with a
 * normal hex color keep working with no changes needed.
 */
export interface ColorBand {
  hex: string;
  percent: number;
}

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function parseColorBands(colorHex: string | null | undefined): ColorBand[] {
  if (!colorHex) {
    return [{ hex: '#888888', percent: 100 }];
  }

  if (!colorHex.includes(';') && !colorHex.includes(':')) {
    return [{ hex: normalizeHex(colorHex), percent: 100 }];
  }

  const bands: ColorBand[] = [];
  for (const part of colorHex.split(';')) {
    const [hexPart, percentPart] = part.split(':');
    const hex = normalizeHex(hexPart);
    const percent = Number(percentPart);
    if (HEX_RE.test(hex) && Number.isFinite(percent) && percent > 0) {
      bands.push({ hex, percent });
    }
  }

  if (bands.length === 0) {
    return [{ hex: '#888888', percent: 100 }];
  }

  // Normalize so percentages always sum to 100, preserving relative weights.
  const total = bands.reduce((sum, b) => sum + b.percent, 0);
  return bands.map((b) => ({ hex: b.hex, percent: (b.percent / total) * 100 }));
}

export function serializeColorBands(bands: ColorBand[]): string {
  if (bands.length === 1) {
    return normalizeHex(bands[0].hex);
  }
  return bands.map((b) => `${normalizeHex(b.hex)}:${Math.round(b.percent)}`).join(';');
}

function normalizeHex(hex: string): string {
  const trimmed = (hex ?? '').trim();
  return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed}`.toUpperCase();
}

export function isValidColorString(colorHex: string): boolean {
  return parseColorBands(colorHex).every((b) => HEX_RE.test(b.hex));
}


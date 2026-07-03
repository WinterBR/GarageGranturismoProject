/**
 * Racing categories available when creating or editing a car.
 * Grouped by discipline family for display in the form select.
 */
export interface RacingCategory {
  family: string;
  value: string;
  label: string;
}

export const RACING_CATEGORIES: RacingCategory[] = [
  { family: 'Monopostos de roda aberta (Fórmula)', value: 'Fórmula 1',       label: 'Fórmula 1 — Topo absoluto' },
  { family: 'Monopostos de roda aberta (Fórmula)', value: 'Fórmula 2',       label: 'Fórmula 2 — Via para a F1' },
  { family: 'Monopostos de roda aberta (Fórmula)', value: 'Fórmula 3 / 4',   label: 'Fórmula 3 / 4 — Formação de pilotos' },
  { family: 'Monopostos de roda aberta (Fórmula)', value: 'Fórmula E',        label: 'Fórmula E — Monoposto elétrico' },
  { family: 'Gran Turismo (GT)',                   value: 'GT3',              label: 'GT3 — Base mundial cliente' },
  { family: 'Gran Turismo (GT)',                   value: 'GT4',              label: 'GT4 — Entrada GT' },
  { family: 'Gran Turismo (GT)',                   value: 'GTE / LMGT3',     label: 'GTE / LMGT3 — WEC e Le Mans' },
  { family: 'Gran Turismo (GT)',                   value: 'Super GT (GT500/GT300)', label: 'Super GT (GT500/GT300) — Japão' },
  { family: 'Protótipos de endurance',             value: 'LMH / LMDh',      label: 'LMH / LMDh — Hypercar atual (WEC)' },
  { family: 'Protótipos de endurance',             value: 'LMP2',             label: 'LMP2 — Protótipo cliente' },
  { family: 'Protótipos de endurance',             value: 'Group C (histórico)', label: 'Group C (histórico) — 1982–1993' },
  { family: 'Protótipos de endurance',             value: 'Group B (histórico)', label: 'Group B (histórico) — Rally/pista 1982–86' },
  { family: 'Turismo',                             value: 'Touring Car (TCR/BTCC)', label: 'Touring Car (TCR/BTCC) — Sedãs e compactos' },
  { family: 'Turismo',                             value: 'DTM',              label: 'DTM — Turismo alemão' },
  { family: 'Turismo',                             value: 'Stock Car',        label: 'Stock Car — Brasil / NASCAR' },
  { family: 'Turismo',                             value: 'NASCAR',           label: 'NASCAR — Óvalo americano' },
  { family: 'Rally',                               value: 'WRC (Rally1)',     label: 'WRC (Rally1) — Topo mundial' },
  { family: 'Rally',                               value: 'WRC2 / Rally2',   label: 'WRC2 / Rally2 — Suporte ao WRC' },
  { family: 'Rally',                               value: 'Rally Raid / Dakar', label: 'Rally Raid / Dakar — Todoterreno de longa dist.' },
  { family: 'Rally',                               value: 'Rallycross (RX)', label: 'Rallycross (RX) — Misto terra+pista' },
  { family: 'Monopostos americanos',               value: 'IndyCar',          label: 'IndyCar — Óvalo + street circuits' },
  { family: 'Monopostos americanos',               value: 'IMSA',             label: 'IMSA — Endurance EUA' },
  { family: 'Monopostos americanos',               value: 'Indy Lights',      label: 'Indy Lights — Formação p/ IndyCar' },
  { family: 'Monopostos americanos',               value: 'F-Indy (BR)',      label: 'F-Indy (BR) — Brasil' },
  { family: 'Especialidades',                      value: 'Drift (FD / D1GP)', label: 'Drift (FD / D1GP) — Derrape controlado' },
  { family: 'Especialidades',                      value: 'Drag Racing',      label: 'Drag Racing — 400m em linha reta' },
  { family: 'Especialidades',                      value: 'Hillclimb',        label: 'Hillclimb — Subida (Pikes Peak)' },
  { family: 'Especialidades',                      value: 'Gymkhana',         label: 'Gymkhana — Precisão + estilo' },
];

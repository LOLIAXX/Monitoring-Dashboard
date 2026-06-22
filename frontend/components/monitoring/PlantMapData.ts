/** Plant layout data for the Sonergy factory map. All values are illustrative. */

export interface ZoneConfig {
  id: string
  label: string
  shortLabel: string
  color: string
  borderColor: string
  buildingFill: string
  x: number
  y: number
  w: number
  h: number
  gridCols: number
  gridRows: number
  labelH: number
  padding: number
  gap: number
  kwh: number
  kwhPct: number
  deviceCount: number
  status: 'ok' | 'warning' | 'alert'
  substations: SubstationDot[]
}

export interface SubstationDot {
  x: number
  y: number
  label: string
  kvLevel: string
}

export const PLANT_ZONES: ZoneConfig[] = [
  {
    id: 'zone-a',
    label: 'Spinning Line 1',
    shortLabel: 'LINE 1',
    color: 'rgba(37,99,235,0.13)',
    borderColor: 'rgba(37,99,235,0.40)',
    buildingFill: 'rgba(37,99,235,0.22)',
    x: 10, y: 95, w: 260, h: 160,
    gridCols: 5, gridRows: 3,
    labelH: 22, padding: 8, gap: 4,
    kwh: 2450, kwhPct: 0.22, deviceCount: 18,
    status: 'ok',
    substations: [
      { x: 28, y: 100, label: 'SS-A1', kvLevel: '11kV' },
      { x: 242, y: 100, label: 'SS-A2', kvLevel: '11kV' },
    ],
  },
  {
    id: 'zone-b',
    label: 'Spinning Line 2',
    shortLabel: 'LINE 2',
    color: 'rgba(14,165,233,0.11)',
    borderColor: 'rgba(14,165,233,0.38)',
    buildingFill: 'rgba(14,165,233,0.20)',
    x: 285, y: 95, w: 260, h: 160,
    gridCols: 5, gridRows: 3,
    labelH: 22, padding: 8, gap: 4,
    kwh: 2280, kwhPct: 0.21, deviceCount: 17,
    status: 'ok',
    substations: [
      { x: 303, y: 100, label: 'SS-B1', kvLevel: '11kV' },
      { x: 517, y: 100, label: 'SS-B2', kvLevel: '11kV' },
    ],
  },
  {
    id: 'zone-c',
    label: 'Weaving & Finishing',
    shortLabel: 'WVNG',
    color: 'rgba(2,132,199,0.10)',
    borderColor: 'rgba(2,132,199,0.38)',
    buildingFill: 'rgba(2,132,199,0.20)',
    x: 560, y: 95, w: 330, h: 160,
    gridCols: 4, gridRows: 3,
    labelH: 22, padding: 8, gap: 4,
    kwh: 1980, kwhPct: 0.18, deviceCount: 14,
    status: 'warning',
    substations: [
      { x: 578, y: 100, label: 'SS-C1', kvLevel: '11kV' },
      { x: 730, y: 100, label: 'SS-C2', kvLevel: '11kV' },
      { x: 860, y: 100, label: 'SS-C3', kvLevel: '11kV' },
    ],
  },
  {
    id: 'zone-d',
    label: 'Dyeing & Treatment',
    shortLabel: 'DYNG',
    color: 'rgba(124,58,237,0.09)',
    borderColor: 'rgba(124,58,237,0.30)',
    buildingFill: 'rgba(124,58,237,0.18)',
    x: 10, y: 275, w: 210, h: 175,
    gridCols: 4, gridRows: 3,
    labelH: 22, padding: 8, gap: 4,
    kwh: 1750, kwhPct: 0.16, deviceCount: 12,
    status: 'ok',
    substations: [
      { x: 28, y: 280, label: 'SS-D1', kvLevel: '11kV' },
      { x: 192, y: 280, label: 'SS-D2', kvLevel: '11kV' },
    ],
  },
  {
    id: 'zone-e',
    label: 'Assembly & QC',
    shortLabel: 'ASMB',
    color: 'rgba(16,185,129,0.09)',
    borderColor: 'rgba(16,185,129,0.30)',
    buildingFill: 'rgba(16,185,129,0.18)',
    x: 235, y: 275, w: 220, h: 175,
    gridCols: 4, gridRows: 3,
    labelH: 22, padding: 8, gap: 4,
    kwh: 980, kwhPct: 0.09, deviceCount: 10,
    status: 'ok',
    substations: [
      { x: 253, y: 280, label: 'SS-E1', kvLevel: '6.6kV' },
      { x: 427, y: 280, label: 'SS-E2', kvLevel: '6.6kV' },
    ],
  },
  {
    id: 'zone-f',
    label: 'Warehouse & Logistics',
    shortLabel: 'WRHS',
    color: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.30)',
    buildingFill: 'rgba(245,158,11,0.15)',
    x: 470, y: 275, w: 265, h: 175,
    gridCols: 3, gridRows: 2,
    labelH: 22, padding: 8, gap: 6,
    kwh: 620, kwhPct: 0.06, deviceCount: 8,
    status: 'ok',
    substations: [
      { x: 488, y: 280, label: 'SS-F1', kvLevel: '6.6kV' },
      { x: 707, y: 280, label: 'SS-F2', kvLevel: '6.6kV' },
    ],
  },
  {
    id: 'zone-g',
    label: 'Utilities & Services',
    shortLabel: 'UTIL',
    color: 'rgba(100,116,139,0.08)',
    borderColor: 'rgba(100,116,139,0.25)',
    buildingFill: 'rgba(100,116,139,0.18)',
    x: 750, y: 275, w: 140, h: 175,
    gridCols: 2, gridRows: 3,
    labelH: 22, padding: 8, gap: 5,
    kwh: 430, kwhPct: 0.04, deviceCount: 6,
    status: 'ok',
    substations: [
      { x: 768, y: 280, label: 'SS-G1', kvLevel: '6.6kV' },
    ],
  },
]

export const MAIN_SUBSTATION = {
  x: 400, y: 8,
  w: 90, h: 52,
  label: '63kV MAIN',
  detail: 'Main Receiving Station',
  kvLevel: '63kV / 11kV',
}

export const CANVAS_W = 900
export const CANVAS_H = 460

export function computeBuildings(zone: ZoneConfig) {
  const innerW = zone.w - zone.padding * 2
  const innerH = zone.h - zone.padding * 2 - zone.labelH
  const bw = Math.floor((innerW - zone.gap * (zone.gridCols - 1)) / zone.gridCols)
  const bh = Math.floor((innerH - zone.gap * (zone.gridRows - 1)) / zone.gridRows)
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (let r = 0; r < zone.gridRows; r++) {
    for (let c = 0; c < zone.gridCols; c++) {
      out.push({
        x: zone.x + zone.padding + c * (bw + zone.gap),
        y: zone.y + zone.padding + zone.labelH + r * (bh + zone.gap),
        w: bw,
        h: bh,
      })
    }
  }
  return out
}

import { SC } from './stitchDesignTokens'

const ZONES = [
  { id: 'Z1', x: 40,  y: 40,  w: 180, h: 100, label: 'Spinning Hall',   status: 'normal'  },
  { id: 'Z2', x: 240, y: 40,  w: 160, h: 100, label: 'Weaving Block',   status: 'normal'  },
  { id: 'Z3', x: 420, y: 40,  w: 160, h: 100, label: 'Dyeing & Finish', status: 'warning' },
  { id: 'Z4', x: 40,  y: 160, w: 180, h: 100, label: 'Assembly & QC',   status: 'normal'  },
  { id: 'Z5', x: 240, y: 160, w: 160, h: 100, label: 'Admin & HVAC',    status: 'normal'  },
  { id: 'SS', x: 420, y: 160, w: 160, h: 100, label: 'Main Substation', status: 'normal'  },
]

const ZONE_FILL: Record<string, string> = {
  normal:  SC.blueLight,
  warning: SC.warningBg,
}
const ZONE_STROKE: Record<string, string> = {
  normal:  SC.blue + '44',
  warning: SC.warning + '88',
}

export default function StitchPlantMap() {
  return (
    <svg viewBox="0 0 640 280" width="100%" style={{ display: 'block', borderRadius: SC.radius.md }}>
      <rect width="640" height="280" fill={SC.pageBg} rx="8" />
      <rect x="0"   y="140" width="640" height="16" fill={SC.cardBorder} />
      <rect x="220" y="0"   width="16"  height="280" fill={SC.cardBorder} />
      {ZONES.map(z => (
        <g key={z.id}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="6"
            fill={ZONE_FILL[z.status] ?? SC.blueLight}
            stroke={ZONE_STROKE[z.status] ?? SC.blue + '44'}
            strokeWidth="1.5" />
          <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 8} textAnchor="middle"
            fontSize="10" fontWeight="700" fill={SC.textDark}>{z.id}</text>
          <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 8} textAnchor="middle"
            fontSize="9" fill={SC.textMuted}>{z.label}</text>
          {z.status === 'warning' && (
            <text x={z.x + z.w - 14} y={z.y + 14} fontSize="13" fill={SC.warning}>⚠</text>
          )}
        </g>
      ))}
    </svg>
  )
}

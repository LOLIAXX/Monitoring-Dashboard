import React from 'react'
import { HOTSPOT_STATUS_COLORS } from '@/components/monitoring/overviewMockData'

// ─── Design tokens ────────────────────────────────────────────────────────────
import { L } from '@/components/monitoring/monitoringColors'
export { L }

// ─── Shared card style ────────────────────────────────────────────────────────
export const card: React.CSSProperties = {
  borderRadius: L.r.xl,
}

export const kpiCard: React.CSSProperties = {
  ...card,
  minHeight: 204,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 16,
}

export function toneColor(tone: string) {
  if (tone === 'critical') return HOTSPOT_STATUS_COLORS.critical
  if (tone === 'warning') return HOTSPOT_STATUS_COLORS.warning
  if (tone === 'producer') return HOTSPOT_STATUS_COLORS.producer
  if (tone === 'normal') return HOTSPOT_STATUS_COLORS.normal
  if (tone === 'offline') return HOTSPOT_STATUS_COLORS.offline
  return L.primary
}

// ─── KPI sub-row ──────────────────────────────────────────────────────────────
export const KpiSubRow = React.memo(function KpiSubRow({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="sub-metric-strip" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(item => (
        <div key={item.label} className="sub-metric-item">
          <p className="sub-metric-label">
            {item.label}
          </p>
          <p className="sub-metric-value" style={{ fontFamily: L.headFont, color: item.color ?? L.onSurface }}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
})

export const SourcePill = React.memo(function SourcePill({ label = 'Fallback sample' }: { label?: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: L.r.full,
      padding: '4px 8px',
      background: 'rgba(245,158,11,0.10)',
      border: '1px solid rgba(245,158,11,0.22)',
      color: '#92400e',
      fontFamily: L.monoFont,
      fontSize: 9.5,
      fontWeight: 800,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
      {label}
    </span>
  )
})


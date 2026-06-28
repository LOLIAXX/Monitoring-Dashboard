import React from 'react'
import { L } from './OverviewShared'
import { HOTSPOT_DOTS } from '@/components/monitoring/overviewMockData'

// ─── PulsingDot ───────────────────────────────────────────────────────────────
export const PulsingDot = React.memo(function PulsingDot({ dot, hovered, onEnter, onLeave }: {
  dot: typeof HOTSPOT_DOTS[number]
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const tooltipVertical: React.CSSProperties = dot.top < 24
    ? { top: 'calc(100% + 12px)' }
    : { bottom: 'calc(100% + 12px)' }
  const tooltipHorizontal: React.CSSProperties = dot.left < 24
    ? { left: 0, transform: 'translateX(-8px)' }
    : dot.left > 76
      ? { right: 0, transform: 'translateX(8px)' }
      : { left: '50%', transform: 'translateX(-50%)' }
  const rows = [
    { k: 'Type', v: dot.assetType, c: L.onSurface },
    { k: 'Status', v: dot.statusLabel, c: dot.statusColor },
    { k: 'Power', v: `${dot.currentPowerKw} kW`, c: dot.statusColor },
    { k: 'Today', v: `${dot.todayEnergyKwh.toLocaleString('en-US')} kWh`, c: L.primary },
    { k: 'Voltage', v: dot.voltage, c: L.onSurface },
    { k: 'Current', v: dot.current, c: L.onSurface },
    { k: 'PF', v: dot.powerFactor, c: L.onSurface },
    { k: 'Load', v: `${dot.loadPct}%`, c: dot.statusColor },
  ]

  return (
    <button
      type="button"
      aria-label={`Show details for ${dot.assetName}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      style={{
        position: 'absolute',
        top: `${dot.top}%`,
        left: `${dot.left}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: hovered ? 30 : 10,
        cursor: 'pointer',
        border: 0,
        padding: 0,
        background: 'transparent',
        color: 'inherit',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: -5,
        borderRadius: '50%',
        border: `2px solid ${dot.statusColor}`,
        opacity: 0.55,
        animation: 'pulse-ring 2s ease-out infinite',
      }} />
      <div style={{
        width: 11,
        height: 11,
        borderRadius: '50%',
        background: dot.statusColor,
        border: '2px solid white',
        boxShadow: hovered
          ? `0 0 0 4px ${dot.statusColor}26, 0 0 18px ${dot.statusColor}99`
          : `0 0 0 2px ${dot.statusColor}30`,
        position: 'relative',
        zIndex: 2,
        transition: 'box-shadow 160ms ease, transform 160ms ease',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }} />

      {hovered && (
        <div style={{
          position: 'absolute',
          width: 252,
          background: 'rgba(255,255,255,0.98)',
          border: `1px solid ${dot.statusColor}44`,
          borderRadius: L.r.lg,
          padding: '12px 14px',
          boxShadow: `0 10px 30px rgba(9,30,66,0.16), 0 0 22px ${dot.statusColor}26`,
          pointerEvents: 'none',
          zIndex: 40,
          textAlign: 'left',
          ...tooltipVertical,
          ...tooltipHorizontal,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 9 }}>
            <h4 style={{ fontFamily: L.headFont, fontSize: 13, lineHeight: 1.2, fontWeight: 700, color: L.onSurface, margin: 0 }}>
              {dot.assetName}
            </h4>
            <span style={{
              flexShrink: 0,
              borderRadius: L.r.full,
              background: `${dot.statusColor}18`,
              color: dot.statusColor,
              border: `1px solid ${dot.statusColor}44`,
              padding: '2px 7px',
              fontFamily: L.monoFont,
              fontSize: 9,
              fontWeight: 700,
            }}>
              {dot.statusLabel}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 12, rowGap: 5 }}>
            {rows.map(row => (
              <div key={row.k} style={{ fontFamily: L.monoFont, fontSize: 10, minWidth: 0 }}>
                <span style={{ color: L.onSurfaceVar }}>{row.k}:</span>
                <span style={{ color: row.c, fontWeight: 700, marginLeft: 4 }}>{row.v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, height: 5, background: L.surfaceContainer, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${dot.loadPct}%`, background: dot.statusColor, borderRadius: 3, opacity: 0.8 }} />
          </div>
        </div>
      )}
    </button>
  )
})


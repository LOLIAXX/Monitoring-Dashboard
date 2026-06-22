'use client'

import { useState, useEffect, useId } from 'react'
import {
  GRID_DEMAND_BARS,
  RENEWABLE_GAUGE,
  SYSTEM_ALERTS,
  HOTSPOT_DOTS,
  HOTSPOT_STATUS_COLORS,
  MANAGER_ABNORMAL_USAGE,
  MANAGER_AREA_PERFORMANCE,
  MANAGER_CONSUMPTION_SHARE,
  MANAGER_EFFICIENCY_RANKING,
  MANAGER_FACTORY_CONSUMPTION,
  MANAGER_MONTHLY_TREND,
  MANAGER_RISK_SUMMARY,
  MANAGER_SUMMARY_METRICS,
  REFERENCE_TIMESTAMP,
  KPI_GRID_SUB,
  KPI_RENEW_SUB,
  KPI_ALERTS_SUB,
} from '@/components/monitoring/overviewMockData'

// ─── Design tokens ────────────────────────────────────────────────────────────
const L = {
  primary:          '#003d9b',
  primaryContainer: '#0052cc',
  tertiary:         '#004e32',
  error:            '#ba1a1a',
  surface:          '#ffffff',
  surfaceLow:       '#f8fbff',
  surfaceContainer: '#eaf1fa',
  border:           'rgba(148,163,184,0.30)',
  onSurface:        '#191c1e',
  onSurfaceVar:     '#434654',
  outline:          '#737685',
  monoFont:         "'JetBrains Mono','Fira Mono',monospace",
  headFont:         "'Hanken Grotesk','Inter',system-ui,sans-serif",
  r: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
} as const

// ─── Shared card style ────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  borderRadius: L.r.xl,
}

const kpiCard: React.CSSProperties = {
  ...card,
  minHeight: 204,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 16,
}

// ─── KPI sub-row ──────────────────────────────────────────────────────────────
function KpiSubRow({ items }: { items: { label: string; value: string; color?: string }[] }) {
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
}

// ─── GridDemandCard ───────────────────────────────────────────────────────────
function GridDemandCard() {
  return (
    <div className="kpi-premium" style={kpiCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: L.headFont, fontSize: 15, fontWeight: 700, color: L.onSurface, margin: 0 }}>Total Grid Demand</h3>
          <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '3px 0 0' }}>Sample plant import baseline</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SourcePill />
          <div style={{ width: 32, height: 32, borderRadius: L.r.lg, background: 'rgba(0,61,155,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={L.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
        <div style={{ minWidth: 120 }}>
          <div className="metric-stack">
            <span className="metric-value" style={{ fontFamily: L.headFont }}>1,245</span>
            <span className="metric-unit">kW</span>
          </div>
          <span className="status-chip-premium" style={{ color: L.error, marginTop: 8 }}>
            12% vs avg
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chart-plot" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 62, padding: '9px 9px 0', borderRadius: L.r.lg }}>
            {GRID_DEMAND_BARS.map((bar, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${bar.h}%`,
                borderRadius: '4px 4px 0 0',
                background: i < 3 ? 'rgba(0,61,155,0.20)' : 'linear-gradient(180deg,#0EA5E9,#003D9B)',
                minHeight: 6,
                boxShadow: i >= 3 ? '0 0 14px rgba(14,165,233,0.22)' : 'none',
              }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 9, alignItems: 'center' }}>
            <div className="bullet-track" aria-label="Demand load is 82 percent of target">
              <div className="bullet-fill" style={{ width: '82%' }} />
              <span className="bullet-target" style={{ left: '88%' }} />
            </div>
            <span style={{ fontFamily: L.monoFont, fontSize: 10, fontWeight: 800, color: L.primary }}>82%</span>
          </div>
        </div>
      </div>
      <KpiSubRow items={[
        { label: 'Peak Today', value: `${KPI_GRID_SUB.peak} kW` },
        { label: 'Avg Today',  value: `${KPI_GRID_SUB.avg} kW` },
      ]} />
    </div>
  )
}

function SourcePill({ label = 'Fallback sample' }: { label?: string }) {
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
}

function RenewablesCard() {
  const { percentage, circumference, solar, wind } = RENEWABLE_GAUGE
  const dashOffset = circumference - (percentage / 100) * circumference
  return (
    <div className="kpi-premium" style={kpiCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: L.headFont, fontSize: 15, fontWeight: 700, color: L.onSurface, margin: 0 }}>Renewables</h3>
          <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '3px 0 0' }}>Sample PV and wind mix</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SourcePill label="Fallback mix" />
          <div style={{ width: 32, height: 32, borderRadius: L.r.lg, background: 'rgba(0,78,50,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={L.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', flexShrink: 0, width: 78, height: 78 }}>
          <svg width="78" height="78" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#edeef0" strokeWidth="11"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke={L.tertiary} strokeWidth="11"
              strokeDasharray={`${circumference}`} strokeDashoffset={`${dashOffset}`}
              strokeLinecap="round" transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: L.headFont, fontSize: 16, fontWeight: 900, color: L.tertiary }}>{percentage}%</span>
          </div>
        </div>
        <div className="micro-stat-grid" style={{ flex: 1 }}>
          {[{ label: 'Solar', val: solar }, { label: 'Wind', val: wind }].map(item => (
            <div key={item.label} className="micro-stat">
              <p className="micro-stat-label">{item.label}</p>
              <p className="micro-stat-value" style={{ fontFamily: L.headFont }}>{item.val}</p>
              <div className="bullet-track" style={{ marginTop: 7, height: 6 }} aria-label={`${item.label} generation`}>
                <div className="bullet-fill" style={{ width: item.label === 'Solar' ? '68%' : '44%', background: 'linear-gradient(90deg,#10B981,#0EA5E9)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <KpiSubRow items={[
        { label: 'CO2 Saved',   value: KPI_RENEW_SUB.co2,  color: L.tertiary },
        { label: 'Cost Saving', value: KPI_RENEW_SUB.cost, color: L.tertiary },
      ]} />
    </div>
  )
}

function SystemAlertsCard() {
  return (
    <div className="kpi-premium" style={kpiCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: L.headFont, fontSize: 15, fontWeight: 700, color: L.onSurface, margin: 0 }}>System Alerts</h3>
          <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '3px 0 0' }}>Sample priority exceptions</p>
        </div>
        <SourcePill label="Fallback rules" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SYSTEM_ALERTS.map(a => (
          <div key={a.label} className="data-row-premium" style={{ background: a.bg, borderColor: `${a.border}30`, padding: '10px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {a.type === 'error'
                  ? <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
                  : <polyline points="20 6 9 17 4 12"/>
                }
              </svg>
              <span style={{ fontFamily: L.monoFont, fontSize: 10, fontWeight: 800, color: a.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.label}</span>
            </div>
            <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: 0, paddingLeft: 21 }}>{a.sub}</p>
          </div>
        ))}
      </div>
      <KpiSubRow items={[
        { label: 'Active Alerts', value: `${KPI_ALERTS_SUB.active} Critical`, color: L.error },
        { label: 'Uptime',        value: KPI_ALERTS_SUB.uptime,              color: L.tertiary },
      ]} />
    </div>
  )
}

// ─── PulsingDot ───────────────────────────────────────────────────────────────
function PulsingDot({ dot, hovered, onEnter, onLeave }: {
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
}

function toneColor(tone: string) {
  if (tone === 'critical') return HOTSPOT_STATUS_COLORS.critical
  if (tone === 'warning') return HOTSPOT_STATUS_COLORS.warning
  if (tone === 'producer') return HOTSPOT_STATUS_COLORS.producer
  if (tone === 'normal') return HOTSPOT_STATUS_COLORS.normal
  if (tone === 'offline') return HOTSPOT_STATUS_COLORS.offline
  return L.primary
}

function ManagerMonthlyTrendChart() {
  const gradId = useId()
  const energyPoints = MANAGER_MONTHLY_TREND.map((row, index) => `${index * 20},${100 - row.energy}`).join(' ')
  const costPoints = MANAGER_MONTHLY_TREND.map((row, index) => `${index * 20},${100 - row.cost}`).join(' ')
  const productionPoints = MANAGER_MONTHLY_TREND.map((row, index) => `${index * 20},${100 - row.production}`).join(' ')
  const latest = MANAGER_MONTHLY_TREND[MANAGER_MONTHLY_TREND.length - 1]

  return (
    <div style={{ height: 156, width: '100%', position: 'relative' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#003d9b" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#003d9b" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(115,118,133,0.20)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
        ))}
        <polygon points={`0,100 ${energyPoints} 100,100`} fill={`url(#${gradId})`} />
        <polyline points={energyPoints} fill="none" stroke={L.primary} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
        <polyline points={costPoints} fill="none" stroke={HOTSPOT_STATUS_COLORS.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
        <polyline points={productionPoints} fill="none" stroke={HOTSPOT_STATUS_COLORS.producer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
        {[
          { label: 'E', value: latest.energy, color: L.primary },
          { label: 'C', value: latest.cost, color: HOTSPOT_STATUS_COLORS.warning },
          { label: 'P', value: latest.production, color: HOTSPOT_STATUS_COLORS.producer },
        ].map((point, index) => (
          <g key={point.label}>
            <circle cx="100" cy={100 - point.value} r="2.2" fill="#fff" stroke={point.color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            <text className="chart-callout" x="98" y={100 - point.value - 4 - index * 2} textAnchor="end" fontFamily={L.monoFont} fontSize="4" fontWeight="800" fill={point.color}>
              {point.label} {point.value}
            </text>
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', fontFamily: L.monoFont, fontSize: 9, color: L.onSurfaceVar }}>
        {MANAGER_MONTHLY_TREND.map(row => (
          <span key={row.month}>{row.month}</span>
        ))}
      </div>
    </div>
  )
}

function ManagerMetricTile({ metric }: { metric: typeof MANAGER_SUMMARY_METRICS[number] }) {
  const color = toneColor(metric.tone)

  return (
    <div className="manager-metric-tile" style={{ borderColor: `${color}2b` }}>
      <div className="metric-caption" style={{ marginTop: 0, color: L.onSurfaceVar }}>
        <span className="metric-caption-dot" style={{ background: color, boxShadow: `0 0 0 4px ${color}17` }} />
        <span style={{ fontFamily: L.monoFont, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{metric.label}</span>
      </div>
      <div className="metric-stack">
        <span className="metric-value" style={{ fontFamily: L.headFont, fontSize: 31, color: L.onSurface }}>{metric.value}</span>
        <span className="metric-unit">{metric.unit}</span>
      </div>
      <span className="status-chip-premium" style={{ color, borderColor: `${color}30`, background: `${color}12` }}>{metric.note}</span>
    </div>
  )
}

function ConsumptionShareDonutCard() {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let runningPct = 0

  return (
    <div className="manager-card manager-donut-card">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Site Consumption Share</h4>
          <p className="manager-card-sub">Site / area percentage today</p>
        </div>
        <span className="manager-pill">38.6 MWh</span>
      </div>
      <div className="manager-donut-layout">
        <div className="manager-donut-shell">
          <svg width="196" height="196" viewBox="0 0 100 100" aria-label="Consumption share donut chart">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="13" />
            {MANAGER_CONSUMPTION_SHARE.map(slice => {
              const dash = (slice.pct / 100) * circumference
              const offset = -runningPct / 100 * circumference
              runningPct += slice.pct
              return (
                <circle
                  key={slice.area}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="13"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  transform="rotate(-90 50 50)"
                />
              )
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: L.headFont, fontSize: 32, fontWeight: 900, color: L.onSurface, lineHeight: 0.96 }}>100%</span>
            <span style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, marginTop: 4 }}>allocated</span>
          </div>
        </div>
        <div className="manager-donut-legend">
          {MANAGER_CONSUMPTION_SHARE.map(slice => (
            <div key={slice.area} className="legend-row-premium manager-donut-row">
              <span className="legend-swatch" style={{ background: slice.color, boxShadow: `0 0 0 4px ${slice.color}18` }} />
              <span style={{ fontFamily: L.headFont, fontSize: 13, fontWeight: 800, color: L.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slice.area}</span>
              <span style={{ fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, fontWeight: 900, textAlign: 'right' }}>{slice.pct}%</span>
              <span className="bullet-track" style={{ gridColumn: '2 / 4', height: 6 }}>
                <span className="bullet-fill" style={{ width: `${slice.pct * 2.15}%`, maxWidth: '100%', background: slice.color }} />
              </span>
              <span style={{ gridColumn: '2 / 4', fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, marginTop: -2 }}>{slice.mwh} MWh today</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FactoryConsumptionCard() {
  return (
    <div className="manager-card manager-span-2">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Energy by Site / Factory</h4>
          <p className="manager-card-sub">Consumption, cost, peak demand, and production ratio</p>
        </div>
        <span className="manager-pill">5 areas</span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {MANAGER_FACTORY_CONSUMPTION.map(row => {
          const color = toneColor(row.tone)
          return (
            <div key={`${row.site}-${row.factory}`} className="manager-factory-row">
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: L.headFont, fontSize: 13, fontWeight: 700, color: L.onSurface, margin: 0 }}>{row.factory}</p>
                <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '2px 0 0' }}>{row.site} · {row.production}</p>
              </div>
              <div className="manager-row-metrics metric-pair-grid">
                <span className="metric-pair"><em>Energy</em><b>{row.energyMwh} MWh</b></span>
                <span className="metric-pair"><em>Cost</em><b>{row.cost}</b></span>
                <span className="metric-pair"><em>Peak</em><b>{row.peakKw} kW</b></span>
                <span className="metric-pair" style={{ borderColor: `${color}28`, background: `${color}0d` }}><em>Trend</em><b style={{ color }}>{row.trend}</b></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthlyTrendCard() {
  return (
    <div className="manager-card manager-span-2">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Monthly Trend</h4>
          <p className="manager-card-sub">Energy, cost, and production index</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[
            { color: L.primary, label: 'Energy' },
            { color: HOTSPOT_STATUS_COLORS.warning, label: 'Cost' },
            { color: HOTSPOT_STATUS_COLORS.producer, label: 'Production' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 2, background: l.color, borderRadius: 1 }} />
              <span style={{ fontFamily: L.monoFont, fontSize: 9, color: L.onSurfaceVar }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <ManagerMonthlyTrendChart />
    </div>
  )
}

function RiskSummaryCard() {
  return (
    <div className="manager-card">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Alert / Risk Summary</h4>
          <p className="manager-card-sub">Manager action queue</p>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {MANAGER_RISK_SUMMARY.map(item => {
          const color = toneColor(item.tone)
          return (
            <div key={item.label} className="data-row-premium" style={{ borderColor: `${color}2e`, background: `${color}10`, borderRadius: L.r.lg, padding: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: L.headFont, fontSize: 13, fontWeight: 700, color: L.onSurface }}>{item.label}</span>
                <span className="status-chip-premium" style={{ color, borderColor: `${color}30`, background: `${color}12` }}>{item.count}</span>
              </div>
              <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '4px 0 0' }}>{item.detail}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EfficiencyRankingCard() {
  return (
    <div className="manager-card">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Efficiency Ranking</h4>
          <p className="manager-card-sub">Best to worst operating areas</p>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {MANAGER_EFFICIENCY_RANKING.map((item, index) => {
          const color = toneColor(item.tone)
          return (
            <div key={item.area} className="data-row-premium" style={{ padding: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: L.headFont, fontSize: 13, fontWeight: 700, color: L.onSurface }}>{index + 1}. {item.area}</span>
                <span style={{ fontFamily: L.monoFont, fontSize: 10, color, fontWeight: 800 }}>{item.delta}</span>
              </div>
              <div className="bullet-track" style={{ height: 8 }}>
                <div className="bullet-fill" style={{ width: `${item.score}%`, background: color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AbnormalUsageCard() {
  return (
    <div className="manager-card">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Abnormal Usage</h4>
          <p className="manager-card-sub">Patterns outside expected band</p>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 9 }}>
        {MANAGER_ABNORMAL_USAGE.map(item => {
          const color = toneColor(item.tone)
          return (
            <div key={item.area} className="data-row-premium" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, padding: 11 }}>
              <span className="status-chip-premium" style={{ minWidth: 46, justifyContent: 'center', color, borderColor: `${color}30`, background: `${color}12` }}>{item.value}</span>
              <div>
                <p style={{ fontFamily: L.headFont, fontSize: 13, fontWeight: 700, color: L.onSurface, margin: 0 }}>{item.area}</p>
                <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '2px 0 0' }}>{item.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BestWorstAreasCard() {
  return (
    <div className="manager-card">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Best / Worst Areas</h4>
          <p className="manager-card-sub">Where managers should focus</p>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {[
          { label: 'Best performing', rows: MANAGER_AREA_PERFORMANCE.best, color: HOTSPOT_STATUS_COLORS.producer },
          { label: 'Needs attention', rows: MANAGER_AREA_PERFORMANCE.worst, color: HOTSPOT_STATUS_COLORS.critical },
        ].map(group => (
          <div key={group.label}>
            <p style={{ fontFamily: L.monoFont, fontSize: 10, color: group.color, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 7px' }}>{group.label}</p>
            <div style={{ display: 'grid', gap: 7 }}>
              {group.rows.map(row => (
                <div key={row.area} className="data-row-premium" style={{ borderRadius: L.r.lg, background: `${group.color}0d`, borderColor: `${group.color}22`, padding: '9px 11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontFamily: L.headFont, fontSize: 13, color: L.onSurface, fontWeight: 700 }}>{row.area}</span>
                    <span style={{ fontFamily: L.monoFont, fontSize: 10, color: group.color, fontWeight: 800 }}>{row.metric}</span>
                  </div>
                  <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '3px 0 0' }}>{row.note}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ManagerDashboardSection() {
  return (
    <div className="manager-dashboard">
      <div className="manager-dashboard-head">
        <div>
          <h3 style={{ fontFamily: L.headFont, fontSize: 19, fontWeight: 900, color: L.onSurface, margin: 0 }}>Manager Energy Dashboard</h3>
          <p style={{ fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, margin: '4px 0 0' }}>Cost, demand, production, risk, and efficiency signals from dummy data</p>
        </div>
        <span className="manager-reference-pill">Reference: {REFERENCE_TIMESTAMP}</span>
      </div>
      <div className="manager-summary-grid">
        {MANAGER_SUMMARY_METRICS.map(metric => (
          <ManagerMetricTile key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="manager-grid">
        <ConsumptionShareDonutCard />
        <FactoryConsumptionCard />
        <RiskSummaryCard />
        <MonthlyTrendCard />
        <EfficiencyRankingCard />
        <AbnormalUsageCard />
        <BestWorstAreasCard />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MonitoringOverviewPage() {
  const [hoveredDot, setHoveredDot] = useState<string | null>(null)
  const [mapView, setMapView]       = useState<'3d' | 'flow'>('3d')
  const [mounted, setMounted]       = useState(false)
  const [clockStr, setClockStr]     = useState('--:--:--')
  const [timeRange, setTimeRange]   = useState('live')

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const now = new Date()
      setClockStr(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.6; }
          70%  { transform: scale(1.6);  opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0,78,50,0.20); }
          50%       { box-shadow: 0 0 0 6px rgba(0,78,50,0.06); }
        }
        .overview-shell {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 2px;
        }
        .overview-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 18px;
          padding: 22px 24px;
          border-radius: 22px;
          background:
            radial-gradient(circle at 11% 0%, rgba(56,189,248,0.22), transparent 34%),
            radial-gradient(circle at 94% 0%, rgba(37,99,235,0.16), transparent 30%),
            linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.92));
          border: 1px solid rgba(148,163,184,0.28);
          box-shadow: 0 1px 0 rgba(255,255,255,0.92) inset, 0 18px 44px rgba(15,23,42,0.10), 0 8px 24px rgba(37,99,235,0.08);
        }
        .overview-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(37,99,235,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.055) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: linear-gradient(90deg, #000 0%, rgba(0,0,0,0.58) 42%, transparent 90%);
          -webkit-mask-image: linear-gradient(90deg, #000 0%, rgba(0,0,0,0.58) 42%, transparent 90%);
        }
        .overview-hero > * {
          position: relative;
          z-index: 1;
        }
        .overview-status-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, #003d9b, #0ea5e9);
          color: #fff;
          border-radius: ${L.r.full}px;
          padding: 8px 15px;
          font-family: ${L.monoFont};
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 10px 24px rgba(0,61,155,0.24);
        }
        .overview-clock {
          border-radius: ${L.r.lg}px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .overview-data-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 13px;
          border-radius: ${L.r.lg}px;
          background: rgba(255,255,255,0.78);
          border: 1px solid rgba(245,158,11,0.24);
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset;
        }
        .overview-data-note strong {
          display: block;
          margin-bottom: 2px;
          color: ${L.onSurface};
          font-family: ${L.headFont};
          font-size: 12.5px;
          font-weight: 800;
        }
        .overview-data-note span {
          color: ${L.onSurfaceVar};
          font-family: ${L.monoFont};
          font-size: 10.5px;
          line-height: 1.5;
        }
        .kpi-card-grid {
          display: grid;
          grid-template-columns: minmax(300px, 1.12fr) minmax(280px, 0.98fr) minmax(300px, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        .overview-visual-card {
          border-radius: 24px;
        }
        .overview-visual-head {
          padding: 18px 22px;
          border-bottom: 1px solid ${L.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          background:
            radial-gradient(circle at 0% 0%, rgba(14,165,233,0.13), transparent 35%),
            linear-gradient(180deg, rgba(255,255,255,0.86), rgba(248,251,255,0.72));
        }
        .overview-control {
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(148,163,184,0.32);
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset;
        }
        .overview-toggle {
          display: flex;
          background: rgba(234,241,250,0.86);
          border: 1px solid rgba(148,163,184,0.24);
          border-radius: ${L.r.lg}px;
          padding: 3px;
        }
        .overview-toggle-button {
          padding: 6px 16px;
          border-radius: ${L.r.md}px;
          border: none;
          cursor: pointer;
          font-family: ${L.monoFont};
          font-size: 11px;
          font-weight: 700;
          transition: background-color 160ms cubic-bezier(0.16,1,0.3,1),
                      color 160ms cubic-bezier(0.16,1,0.3,1),
                      box-shadow 160ms cubic-bezier(0.16,1,0.3,1),
                      transform 140ms cubic-bezier(0.4,0,0.2,1);
        }
        .overview-toggle-button:active {
          transform: scale(0.97);
        }
        .overview-image-frame {
          position: relative;
          padding: 14px;
          background:
            radial-gradient(circle at 8% 0%, rgba(14,165,233,0.11), transparent 34%),
            linear-gradient(180deg, #f6faff, #eaf1fa);
        }
        .overview-image-frame img {
          border-radius: 18px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.86) inset, 0 14px 34px rgba(15,23,42,0.11);
        }
        .manager-dashboard {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 22px 24px 24px;
          background:
            radial-gradient(circle at 12% 0%, rgba(56,189,248,0.18), transparent 33%),
            radial-gradient(circle at 88% 4%, rgba(37,99,235,0.12), transparent 32%),
            linear-gradient(180deg, #F8FBFF 0%, #EEF6FF 100%);
          border-top: 1px solid ${L.border};
        }
        .manager-dashboard-head,
        .manager-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .manager-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .manager-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 16px;
          align-items: stretch;
        }
        .manager-span-2 {
          grid-column: span 4;
        }
        .manager-card {
          grid-column: span 2;
          background:
            radial-gradient(circle at 0% 0%, rgba(14,165,233,0.08), transparent 38%),
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.93));
          border: 1px solid rgba(148,163,184,0.30);
          border-radius: ${L.r.xl}px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.90) inset, 0 12px 28px rgba(15,23,42,0.075);
          padding: 18px;
          min-height: 224px;
          transition: transform 180ms cubic-bezier(0.16,1,0.3,1),
                      box-shadow 180ms cubic-bezier(0.16,1,0.3,1),
                      border-color 180ms cubic-bezier(0.16,1,0.3,1);
        }
        @media (hover: hover) and (pointer: fine) {
          .manager-card:hover {
            transform: translateY(-2px);
            border-color: rgba(37,99,235,0.28);
            box-shadow: 0 1px 0 rgba(255,255,255,0.90) inset, 0 16px 38px rgba(15,23,42,0.10), 0 8px 24px rgba(37,99,235,0.08);
          }
        }
        .manager-card.manager-span-2 {
          grid-column: span 4;
        }
        .manager-donut-card {
          min-height: 336px;
          background:
            radial-gradient(circle at 50% 39%, rgba(14,165,233,0.17), transparent 40%),
            radial-gradient(circle at 8% 2%, rgba(37,99,235,0.10), transparent 30%),
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.96));
          border-color: rgba(37,99,235,0.22);
        }
        .manager-card-title {
          font-family: ${L.headFont};
          font-size: 15px;
          font-weight: 800;
          color: ${L.onSurface};
          margin: 0 0 2px;
        }
        .manager-card-sub {
          font-family: ${L.monoFont};
          font-size: 10px;
          color: ${L.onSurfaceVar};
          margin: 0;
        }
        .manager-reference-pill,
        .manager-pill {
          border-radius: ${L.r.full}px;
          background: rgba(0,61,155,0.08);
          border: 1px solid rgba(0,61,155,0.16);
          padding: 4px 8px;
          font-family: ${L.monoFont};
          font-size: 10px;
          color: ${L.primary};
          font-weight: 800;
          white-space: nowrap;
        }
        .manager-reference-pill {
          background: rgba(255,255,255,0.72);
          color: ${L.onSurfaceVar};
          border-color: rgba(195,198,214,0.72);
          padding: 6px 10px;
        }
        .manager-metric-tile {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 13px;
          min-height: 128px;
          background:
            radial-gradient(circle at 100% 0%, rgba(14,165,233,0.07), transparent 38%),
            rgba(255,255,255,0.92);
          border: 1px solid;
          border-radius: ${L.r.xl}px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 20px rgba(15,23,42,0.055);
          padding: 16px;
          transition: transform 160ms cubic-bezier(0.16,1,0.3,1), box-shadow 160ms cubic-bezier(0.16,1,0.3,1);
        }
        @media (hover: hover) and (pointer: fine) {
          .manager-metric-tile:hover {
            transform: translateY(-1px);
            box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 26px rgba(15,23,42,0.075);
          }
        }
        .manager-donut-layout {
          display: grid;
          grid-template-columns: minmax(180px, 196px) minmax(0, 1fr);
          gap: 18px;
          align-items: center;
          margin-top: 18px;
        }
        .manager-donut-shell {
          position: relative;
          width: 196px;
          height: 196px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 42% 34%, rgba(255,255,255,0.92), transparent 42%),
            linear-gradient(145deg, rgba(255,255,255,0.92), rgba(219,234,254,0.72));
          box-shadow: inset 0 0 0 1px rgba(37,99,235,0.14), 0 16px 34px rgba(37,99,235,0.14);
        }
        .manager-donut-legend {
          display: grid;
          gap: 10px;
          min-width: 0;
        }
        .manager-donut-row {
          display: grid;
          grid-template-columns: 12px minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
          min-width: 0;
          padding: 9px 10px;
        }
        .manager-factory-row {
          display: grid;
          grid-template-columns: minmax(170px, 1fr) minmax(360px, 1.6fr);
          gap: 14px;
          align-items: center;
          border: 1px solid rgba(148,163,184,0.24);
          border-radius: ${L.r.lg}px;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.86), rgba(248,250,252,0.72));
          padding: 11px 12px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.82);
          transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
        }
        .manager-row-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          font-family: ${L.monoFont};
          font-size: 10px;
          color: ${L.onSurfaceVar};
          text-align: right;
        }
        .manager-row-metrics b {
          color: ${L.onSurface};
          font-size: 12px;
          font-weight: 900;
          letter-spacing: -0.01em;
        }
        @media (hover: hover) and (pointer: fine) {
          .manager-factory-row:hover {
            transform: translateY(-1px);
            border-color: rgba(37,99,235,0.24);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 24px rgba(15,23,42,0.07);
          }
        }
        @media (max-width: 1024px) {
          .kpi-card-grid {
            grid-template-columns: 1fr;
          }
          .manager-summary-grid,
          .manager-grid {
            grid-template-columns: 1fr;
          }
          .manager-span-2 {
            grid-column: span 1;
          }
          .manager-card,
          .manager-card.manager-span-2 {
            grid-column: span 1;
          }
          .manager-factory-row {
            grid-template-columns: 1fr;
          }
          .manager-row-metrics {
            text-align: left;
          }
          .manager-donut-layout {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          .manager-donut-legend {
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .manager-dashboard {
            padding: 18px 16px 20px;
          }
          .manager-dashboard-head,
          .manager-card-head {
            flex-direction: column;
          }
          .manager-row-metrics {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <div className="animate-fade-in-up overview-shell">

        {/* ── Page header ── */}
        <header className="overview-hero">
          <div>
            <h1 style={{ fontFamily: L.headFont, fontSize: 28, fontWeight: 700, color: L.onSurface, margin: '0 0 4px', lineHeight: 1.2 }}>
              Factory Overview
            </h1>
            <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 14, color: L.onSurfaceVar }}>
              Energy distribution and asset performance with fallback values clearly marked.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Site status chip */}
            <div className="overview-status-chip">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} />
              Site Alpha · fallback sample
            </div>
            {/* Live clock */}
            <div className="surface-premium overview-clock">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={L.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontFamily: L.monoFont, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: L.onSurfaceVar }}>
                Viewed:{' '}<span style={{ color: L.onSurface, fontWeight: 700 }}>{mounted ? clockStr : '--:--:--'}</span>
              </span>
            </div>
          </div>
        </header>

        <div className="overview-data-note">
          <SourcePill label="Fallback mode" />
          <div>
            <strong>Live overview data is not displayed in this card set yet.</strong>
            <span>The KPI values below are sample baselines, not measured telemetry from the monitoring database.</span>
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="kpi-card-grid">
          <GridDemandCard />
          <RenewablesCard />
          <SystemAlertsCard />
        </div>

        {/* ── Interactive Site Visualizer ── */}
        <div className="chart-card overview-visual-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 560 }}>

          {/* Panel header */}
          <div className="overview-visual-head">
            <div>
              <h3 style={{ fontFamily: L.headFont, fontSize: 16, fontWeight: 700, color: L.onSurface, margin: '0 0 2px' }}>Interactive Site Visualizer</h3>
              <p style={{ margin: 0, fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar }}>Hover over zones for fallback asset details · static digital twin view</p>
            </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Time range */}
              <label className="overview-control" style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: L.r.lg, padding: '6px 12px', fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ border: 'none', background: 'transparent', font: 'inherit', color: 'inherit', cursor: 'pointer', outline: 'none' }}>
                  <option value="live">Live</option>
                  <option value="1h">Last 1h</option>
                  <option value="6h">Last 6h</option>
                  <option value="today">Today</option>
                </select>
              </label>
              {/* View toggle */}
              <div className="overview-toggle">
                {(['3d', 'flow'] as const).map(v => (
                  <button key={v} onClick={() => setMapView(v)} className="overview-toggle-button" style={{
                    background: mapView === v ? L.surface : 'transparent',
                    color: mapView === v ? L.primary : L.onSurfaceVar,
                    boxShadow: mapView === v ? '0 1px 3px rgba(9,30,66,0.12), 0 1px 0 rgba(255,255,255,0.9) inset' : 'none',
                  }}>
                    {v === '3d' ? '3D Mapping' : 'Flow Analysis'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image frame */}
          <div className="overview-image-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/factory-overview-screen.png"
              alt="Static factory site map with hotspot overlays for Sonergy Site Alpha"
              style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
              draggable={false}
            />

            {/* Pulsing dot anchors */}
            <div style={{ position: 'absolute', inset: 0 }}>
              {HOTSPOT_DOTS.map(dot => (
                <PulsingDot
                  key={dot.id}
                  dot={dot}
                  hovered={hoveredDot === dot.id}
                  onEnter={() => setHoveredDot(dot.id)}
                  onLeave={() => setHoveredDot(null)}
                />
              ))}
            </div>

          </div>

          <ManagerDashboardSection />
        </div>

      </div>
    </>
  )
}

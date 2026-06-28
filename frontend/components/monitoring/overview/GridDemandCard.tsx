import React from 'react'
import { L, kpiCard, KpiSubRow } from './OverviewShared'
import type { FactoryOverviewSummary, DashboardTrendResponse } from '@/lib/monitoringDashboardApi'

interface GridDemandCardProps {
  summary?: FactoryOverviewSummary | null
  powerTrend?: DashboardTrendResponse | null
  loading?: boolean
}

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

const SKEL: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(148,163,184,0.18)',
  borderRadius: 6,
  animation: 'gd-skel 1.4s ease-in-out infinite',
}

const EMPTY_BAR: React.CSSProperties = {
  flex: 1,
  height: '14%',
  borderRadius: '4px 4px 0 0',
  background: 'rgba(148,163,184,0.13)',
  minHeight: 6,
}

export const GridDemandCard = React.memo(function GridDemandCard({ summary, powerTrend, loading }: GridDemandCardProps) {
  const live = summary?.data_available === true
  const s = live ? (summary as FactoryOverviewSummary) : null

  const bars = React.useMemo(() => {
    if (!live || !powerTrend?.data_available || powerTrend.points.length === 0) return null
    const pts = powerTrend.points.slice(-6)
    const maxVal = Math.max(...pts.map(p => p.value), 1)
    return pts.map(p => ({ h: Math.round((p.value / maxVal) * 100) }))
  }, [live, powerTrend])

  const powerKw  = s?.factory_active_power_kw ?? null
  const peakKw   = s?.peak_demand_kw ?? null
  const dailyMwh = s != null ? s.daily_energy_kwh / 1000 : null
  const totalMwh = s != null ? s.total_energy_kwh / 1000 : null
  const loadPct  = powerKw != null ? Math.min(Math.round((powerKw / 1500) * 100), 100) : null
  const E = '—'

  return (
    <div className="kpi-premium" style={kpiCard}>
      <style>{`@keyframes gd-skel { 0%,100%{opacity:.45} 50%{opacity:1} }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: L.headFont, fontSize: 15, fontWeight: 700, color: L.onSurface, margin: 0 }}>Total Grid Demand</h3>
          <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '3px 0 0' }}>
            {live ? 'Factory import · live telemetry' : loading ? 'Connecting to monitoring database…' : 'No telemetry data available'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {live && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: L.r.full, background: 'rgba(0,78,50,0.10)', border: '1px solid rgba(0,78,50,0.22)', fontFamily: L.monoFont, fontSize: 10, fontWeight: 800, color: '#004e32' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.22)' }} />
              Live
            </span>
          )}
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
            {loading
              ? <span style={{ ...SKEL, width: 72, height: 36 }} />
              : <span className="metric-value" style={{ fontFamily: L.headFont, color: live ? L.onSurface : L.onSurfaceVar }}>
                  {powerKw !== null ? fmt(powerKw) : E}
                </span>
            }
            <span className="metric-unit" style={{ color: live ? undefined : L.onSurfaceVar }}>kW</span>
          </div>
          {loading
            ? <span style={{ ...SKEL, width: 84, height: 16, marginTop: 8 }} />
            : live && dailyMwh !== null
              ? <span className="status-chip-premium" style={{ color: L.primary, marginTop: 8 }}>{fmt(dailyMwh, 1)} MWh today</span>
              : <span style={{ fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, marginTop: 8, display: 'block' }}>{E}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chart-plot" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 62, padding: '9px 9px 0', borderRadius: L.r.lg }}>
            {loading
              ? [40, 55, 30, 70, 45, 60].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: 'rgba(148,163,184,0.18)', minHeight: 6, animation: 'gd-skel 1.4s ease-in-out infinite' }} />
                ))
              : bars
                ? bars.map((bar, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: `${bar.h}%`,
                      borderRadius: '4px 4px 0 0',
                      background: i < bars.length - 1 ? 'rgba(0,61,155,0.20)' : 'linear-gradient(180deg,#0EA5E9,#003D9B)',
                      minHeight: 6,
                      boxShadow: i >= bars.length - 1 ? '0 0 14px rgba(14,165,233,0.22)' : 'none',
                    }} />
                  ))
                : [0,1,2,3,4,5].map(i => <div key={i} style={EMPTY_BAR} />)
            }
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 9, alignItems: 'center' }}>
            <div className="bullet-track" aria-label={loadPct !== null ? `Demand load is ${loadPct} percent of target` : 'No demand data'}>
              {loadPct !== null && <div className="bullet-fill" style={{ width: `${loadPct}%` }} />}
              {loadPct !== null && <span className="bullet-target" style={{ left: '88%' }} />}
            </div>
            <span style={{ fontFamily: L.monoFont, fontSize: 10, fontWeight: 800, color: loadPct !== null ? L.primary : L.onSurfaceVar }}>
              {loading ? E : loadPct !== null ? `${loadPct}%` : E}
            </span>
          </div>
        </div>
      </div>

      <KpiSubRow items={[
        { label: 'Peak Today',   value: loading ? E : peakKw   !== null ? `${fmt(peakKw)} kW`       : E },
        { label: 'Total Period', value: loading ? E : totalMwh !== null ? `${fmt(totalMwh, 1)} MWh` : E },
      ]} />
    </div>
  )
})

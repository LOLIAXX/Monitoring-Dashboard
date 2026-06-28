import React, { useId } from 'react'
import { L, toneColor } from './OverviewShared'
import {
  MANAGER_MONTHLY_TREND,
  MANAGER_SUMMARY_METRICS,
  MANAGER_RISK_SUMMARY,
  MANAGER_EFFICIENCY_RANKING,
  MANAGER_ABNORMAL_USAGE,
  MANAGER_AREA_PERFORMANCE,
  REFERENCE_TIMESTAMP,
  HOTSPOT_STATUS_COLORS,
} from '@/components/monitoring/overviewMockData'
import type { SiteEnergyShareListResponse } from '@/lib/monitoringDashboardApi'

const SHARE_COLORS = ['#0EA5E9', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'] as const

const ManagerMonthlyTrendChart = React.memo(function ManagerMonthlyTrendChart() {
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
})

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

function ConsumptionShareDonutCard({ energyShares, loading }: { energyShares?: SiteEnergyShareListResponse | null; loading?: boolean }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let runningPct = 0

  const hasData = energyShares?.data_available === true && energyShares.items.length > 0
  const slices = hasData
    ? energyShares!.items.map((item, i) => ({
        area:  item.site_name,
        pct:   Math.round(item.pct),
        mwh:   (item.energy_kwh / 1000).toFixed(1),
        color: SHARE_COLORS[i % SHARE_COLORS.length],
      }))
    : []

  const totalMwh = hasData
    ? (energyShares!.items.reduce((acc, i) => acc + i.energy_kwh, 0) / 1000).toFixed(1)
    : null

  return (
    <div className="manager-card manager-donut-card">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Site Consumption Share</h4>
          <p className="manager-card-sub">{hasData ? 'Site energy share · live data' : loading ? 'Connecting…' : 'No data available'}</p>
        </div>
        {totalMwh && <span className="manager-pill">{totalMwh} MWh</span>}
      </div>

      {!hasData ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, paddingTop: 28, opacity: loading ? 0.5 : 1 }}>
          <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="13" />
          </svg>
          <p style={{ fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, margin: 0, textAlign: 'center' }}>
            {loading ? 'Loading site energy data…' : 'No energy share data available for this period.'}
          </p>
        </div>
      ) : (
        <div className="manager-donut-layout">
          <div className="manager-donut-shell">
            <svg width="196" height="196" viewBox="0 0 100 100" aria-label="Consumption share donut chart">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="13" />
              {slices.map(slice => {
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
            {slices.map(slice => (
              <div key={slice.area} className="legend-row-premium manager-donut-row">
                <span className="legend-swatch" style={{ background: slice.color, boxShadow: `0 0 0 4px ${slice.color}18` }} />
                <span style={{ fontFamily: L.headFont, fontSize: 13, fontWeight: 800, color: L.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slice.area}</span>
                <span style={{ fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, fontWeight: 900, textAlign: 'right' }}>{slice.pct}%</span>
                <span className="bullet-track" style={{ gridColumn: '2 / 4', height: 6 }}>
                  <span className="bullet-fill" style={{ width: `${Math.min(slice.pct * 2.15, 100)}%`, background: slice.color }} />
                </span>
                <span style={{ gridColumn: '2 / 4', fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, marginTop: -2 }}>{slice.mwh} MWh today</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FactoryConsumptionCard({ topConsumers, loading }: { topConsumers?: SiteEnergyShareListResponse | null; loading?: boolean }) {
  const hasData = topConsumers?.data_available === true && topConsumers.items.length > 0

  return (
    <div className="manager-card manager-span-2">
      <div className="manager-card-head">
        <div>
          <h4 className="manager-card-title">Energy by Site / Factory</h4>
          <p className="manager-card-sub">{hasData ? 'Top consuming sites · live data' : loading ? 'Connecting…' : 'No data available'}</p>
        </div>
        {hasData && <span className="manager-pill">{topConsumers!.items.length} sites</span>}
      </div>

      {!hasData ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 28, opacity: loading ? 0.5 : 1 }}>
          <p style={{ fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, margin: 0, textAlign: 'center' }}>
            {loading ? 'Loading site consumption data…' : 'No site consumption data available for this period.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {topConsumers!.items.map(item => (
            <div key={item.site_id} className="manager-factory-row">
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: L.headFont, fontSize: 13, fontWeight: 700, color: L.onSurface, margin: 0 }}>{item.site_name}</p>
                <p style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, margin: '2px 0 0' }}>{item.pct.toFixed(1)}% of total</p>
              </div>
              <div className="manager-row-metrics metric-pair-grid">
                <span className="metric-pair"><em>Energy</em><b>{(item.energy_kwh / 1000).toFixed(1)} MWh</b></span>
                <span className="metric-pair"><em>Share</em><b>{item.pct.toFixed(1)}%</b></span>
                <span className="metric-pair"><em>Cost</em><b>—</b></span>
                <span className="metric-pair"><em>Peak</em><b>—</b></span>
              </div>
            </div>
          ))}
        </div>
      )}
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

interface ManagerDashboardSectionProps {
  energyShares?: SiteEnergyShareListResponse | null
  topConsumers?: SiteEnergyShareListResponse | null
  loading?: boolean
}

export const ManagerDashboardSection = React.memo(function ManagerDashboardSection({ energyShares, topConsumers, loading }: ManagerDashboardSectionProps) {
  const hasLive = energyShares?.data_available === true || topConsumers?.data_available === true
  return (
    <div className="manager-dashboard">
      <div className="manager-dashboard-head">
        <div>
          <h3 style={{ fontFamily: L.headFont, fontSize: 19, fontWeight: 900, color: L.onSurface, margin: 0 }}>Manager Energy Dashboard</h3>
          <p style={{ fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, margin: '4px 0 0' }}>{hasLive ? 'Site energy shares and consumption from live monitoring data' : loading ? 'Connecting to monitoring database…' : 'No live data available for this period'}</p>
        </div>
        <span className="manager-reference-pill">Reference: {REFERENCE_TIMESTAMP}</span>
      </div>
      <div className="manager-summary-grid">
        {MANAGER_SUMMARY_METRICS.map(metric => (
          <ManagerMetricTile key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="manager-grid">
        <ConsumptionShareDonutCard energyShares={energyShares} loading={loading} />
        <FactoryConsumptionCard topConsumers={topConsumers} loading={loading} />
        <RiskSummaryCard />
        <MonthlyTrendCard />
        <EfficiencyRankingCard />
        <AbnormalUsageCard />
        <BestWorstAreasCard />
      </div>
    </div>
  )
})

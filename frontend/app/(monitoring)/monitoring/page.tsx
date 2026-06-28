'use client'

import { useState, useEffect, useId } from 'react'
import Clock from '@/components/monitoring/Clock'
import { L, SourcePill } from '@/components/monitoring/overview/OverviewShared'
import { GridDemandCard } from '@/components/monitoring/overview/GridDemandCard'
import { RenewablesCard } from '@/components/monitoring/overview/RenewablesCard'
import { SystemAlertsCard } from '@/components/monitoring/overview/SystemAlertsCard'
import { FactoryEnergyMap } from '@/components/monitoring/overview/FactoryEnergyMap'
import { ManagerDashboardSection } from '@/components/monitoring/overview/ManagerDashboardSection'

import { getToken } from '@/lib/auth'
import {
  fetchOverviewSummary,
  fetchOverviewPowerTrend,
  fetchOverviewEnergyTrend,
  fetchOverviewEnergyShares,
  fetchOverviewTopConsumers,
  fetchOverviewSitePowerComparison,
  fetchOverviewDataFreshness,
  type FactoryOverviewSummary,
  type DashboardTrendResponse,
  type SiteEnergyShareListResponse,
  type SitePowerListResponse,
  type DataFreshnessResponse,
} from '@/lib/monitoringDashboardApi'

type DashState = {
  summary:      FactoryOverviewSummary | null
  powerTrend:   DashboardTrendResponse | null
  energyTrend:  DashboardTrendResponse | null
  energyShares: SiteEnergyShareListResponse | null
  topConsumers: SiteEnergyShareListResponse | null
  sitePower:    SitePowerListResponse | null
  freshness:    DataFreshnessResponse | null
  loading:      boolean
  error:        boolean
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function MonitoringOverviewPage() {
  const [hoveredDot, setHoveredDot] = useState<string | null>(null)
  const [mapView, setMapView]       = useState<'3d' | 'flow'>('3d')
  const [mounted, setMounted]       = useState(false)
  const [timeRange, setTimeRange]   = useState('live')
  const [dash, setDash] = useState<DashState>({
    summary: null, powerTrend: null, energyTrend: null,
    energyShares: null, topConsumers: null, sitePower: null,
    freshness: null, loading: false, error: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const token = getToken()
    if (!token) return
    setDash(d => ({ ...d, loading: true }))
    Promise.allSettled([
      fetchOverviewSummary(token),
      fetchOverviewPowerTrend(token, { bucket_interval: '1h' }),
      fetchOverviewEnergyTrend(token, { bucket_interval: '1h' }),
      fetchOverviewEnergyShares(token, { limit: 10 }),
      fetchOverviewTopConsumers(token, { limit: 10 }),
      fetchOverviewSitePowerComparison(token, { limit: 15 }),
      fetchOverviewDataFreshness(token),
    ]).then(([sumRes, ptRes, etRes, esRes, tcRes, spRes, dfRes]) => {
      const hadError = [sumRes, ptRes, etRes, esRes, tcRes, spRes, dfRes].some(r => r.status === 'rejected')
      setDash({
        summary:      sumRes.status === 'fulfilled' ? sumRes.value : null,
        powerTrend:   ptRes.status  === 'fulfilled' ? ptRes.value  : null,
        energyTrend:  etRes.status  === 'fulfilled' ? etRes.value  : null,
        energyShares: esRes.status  === 'fulfilled' ? esRes.value  : null,
        topConsumers: tcRes.status  === 'fulfilled' ? tcRes.value  : null,
        sitePower:    spRes.status  === 'fulfilled' ? spRes.value  : null,
        freshness:    dfRes.status  === 'fulfilled' ? dfRes.value  : null,
        loading:      false,
        error:        hadError,
      })
    })
  }, [mounted])

  const liveData = dash.summary?.data_available === true

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
        .metric-value, .sub-metric-value, .chart-callout, .micro-stat-value, .manager-pill, .status-chip-premium, .manager-reference-pill, .metric-pair b, .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
        .kpi-premium, .manager-card, .data-row-premium {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .kpi-premium:hover, .manager-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(15,23,42,0.08);
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

      <div className="overview-shell stagger-in">

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
                Viewed:{' '}<span style={{ color: L.onSurface, fontWeight: 700 }}><Clock /></span>
              </span>
            </div>
          </div>
        </header>

        <div className="overview-data-note" style={liveData ? { borderColor: 'rgba(0,78,50,0.24)', background: 'rgba(0,78,50,0.04)' } : undefined}>
          {liveData ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, background: 'rgba(0,78,50,0.10)', border: '1px solid rgba(0,78,50,0.22)', fontFamily: L.monoFont, fontSize: 10, fontWeight: 800, color: '#004e32', whiteSpace: 'nowrap' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              Live
            </span>
          ) : (
            <SourcePill label="Fallback mode" />
          )}
          <div>
            {liveData ? (
              <>
                <strong>Live monitoring data active.</strong>
                <span>KPI values are sourced from the monitoring database{dash.summary?.as_of ? ` · as of ${new Date(dash.summary.as_of).toLocaleTimeString()}` : ''}.</span>
              </>
            ) : (
              <>
                <strong>Live overview data is not displayed in this card set yet.</strong>
                <span>The KPI values below are sample baselines, not measured telemetry from the monitoring database.</span>
              </>
            )}
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="kpi-card-grid">
          <GridDemandCard summary={dash.summary} powerTrend={dash.powerTrend} loading={dash.loading} />
          <RenewablesCard />
          <SystemAlertsCard />
        </div>

        {dash.freshness?.data_available && dash.freshness.items.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 14px', borderRadius: L.r.lg, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(148,163,184,0.22)', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset', alignItems: 'center' }}>
            <span style={{ fontFamily: L.monoFont, fontSize: 10, color: L.onSurfaceVar, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Data Freshness</span>
            {dash.freshness.items.map(item => (
              <span key={item.site_id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: L.r.full, background: item.stale ? 'rgba(186,26,26,0.08)' : 'rgba(0,78,50,0.08)', border: `1px solid ${item.stale ? 'rgba(186,26,26,0.22)' : 'rgba(0,78,50,0.22)'}`, fontFamily: L.monoFont, fontSize: 10, fontWeight: 700, color: item.stale ? '#ba1a1a' : '#004e32' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.stale ? '#ba1a1a' : '#10B981' }} />
                {item.site_name}
                {item.age_seconds != null && (
                  <span style={{ fontWeight: 400, opacity: 0.7 }}>
                    {' · '}{item.age_seconds < 120 ? `${Math.round(item.age_seconds)}s` : item.age_seconds < 3600 ? `${Math.round(item.age_seconds / 60)}m` : `${Math.round(item.age_seconds / 3600)}h`}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        <FactoryEnergyMap />

        {dash.error && (
          <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(186,26,26,0.06)', border: '1px solid rgba(186,26,26,0.22)', fontFamily: L.monoFont, fontSize: 11, color: '#ba1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            One or more monitoring endpoints could not be reached. Showing available data only.
          </div>
        )}

        <ManagerDashboardSection energyShares={dash.energyShares} topConsumers={dash.topConsumers} loading={dash.loading} />

      </div>
    </>
  )
}

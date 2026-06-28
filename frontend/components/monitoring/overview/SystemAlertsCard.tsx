import React from 'react'
import { L, kpiCard, KpiSubRow, SourcePill } from './OverviewShared'
import { SYSTEM_ALERTS, KPI_ALERTS_SUB } from '@/components/monitoring/overviewMockData'

export const SystemAlertsCard = React.memo(function SystemAlertsCard() {
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
})


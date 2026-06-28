import React from 'react'
import { L, kpiCard, KpiSubRow, SourcePill } from './OverviewShared'
import { RENEWABLE_GAUGE, KPI_RENEW_SUB } from '@/components/monitoring/overviewMockData'

export const RenewablesCard = React.memo(function RenewablesCard() {
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
})


'use client'

import { useState } from 'react'
import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import { ALERTS_DATA } from '@/components/stitch/stitchMockData'

type F = 'All' | 'critical' | 'warning' | 'info'

export default function AlertsPage() {
  const [filter, setFilter] = useState<F>('All')
  const visible = filter === 'All' ? ALERTS_DATA : ALERTS_DATA.filter(a => a.severity === filter)

  const stats = {
    total:    ALERTS_DATA.filter(a => a.status === 'Active').length,
    critical: ALERTS_DATA.filter(a => a.severity === 'critical' && a.status === 'Active').length,
    warning:  ALERTS_DATA.filter(a => a.severity === 'warning' && a.status === 'Active').length,
  }

  const card: React.CSSProperties = {
    background: SC.cardBg, borderRadius: SC.radius.lg,
    border: `1px solid ${SC.cardBorder}`, boxShadow: SC.cardShadow,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SC.textDark, margin: 0 }}>Alerts Management Center</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: SC.textMuted }}>Active anomaly tracking and diagnostic support</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
        {[
          { label: 'Total Active',   value: String(stats.total),    color: SC.danger  },
          { label: 'Critical',       value: String(stats.critical), color: SC.danger  },
          { label: 'Warnings',       value: String(stats.warning),  color: SC.warning },
          { label: 'Avg MTTR',       value: '1.2h',                 color: SC.blue    },
          { label: 'Top Alert Type', value: 'Phase Dev.',           color: SC.indigo  },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: SC.textMuted, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <StitchPanel title="All Alerts" noPad
        badge={<span style={{ fontSize: 11.5, color: SC.textFaint, marginLeft: 8 }}>{visible.length} shown</span>}
        action={
          <div style={{ display: 'flex', gap: 2 }}>
            {(['All', 'critical', 'warning', 'info'] as F[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '4px 12px', borderRadius: SC.radius.sm, border: 'none', cursor: 'pointer',
                fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize',
                background: filter === f ? SC.blue : 'transparent',
                color: filter === f ? '#fff' : SC.textMuted,
              }}>{f}</button>
            ))}
          </div>
        }
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['ID', 'Severity', 'Type', 'Location', 'Description', 'Time', 'Status', 'MTTR'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: i < visible.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 10.5, color: SC.textFaint }}>{a.id}</td>
                <td style={{ padding: '11px 14px' }}><StitchStatusPill label={a.severity} /></td>
                <td style={{ padding: '11px 14px', fontWeight: 600, color: SC.textDark }}>{a.type}</td>
                <td style={{ padding: '11px 14px', color: SC.textBody }}>{a.location}</td>
                <td style={{ padding: '11px 14px', color: SC.textMuted, maxWidth: 240 }}>{a.msg}</td>
                <td style={{ padding: '11px 14px', color: SC.textFaint, fontSize: 11, whiteSpace: 'nowrap' }}>{a.time}</td>
                <td style={{ padding: '11px 14px' }}><StitchStatusPill label={a.status} /></td>
                <td style={{ padding: '11px 14px', color: SC.textMuted, fontSize: 11.5 }}>{a.mttr ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StitchPanel>
    </div>
  )
}

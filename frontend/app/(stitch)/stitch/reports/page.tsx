'use client'

import { useState } from 'react'
import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import { REPORTS_DAILY, REPORTS_WEEKLY, REPORTS_MONTHLY } from '@/components/stitch/stitchMockData'

type Period = 'Daily' | 'Weekly' | 'Monthly'
const DATA: Record<Period, typeof REPORTS_DAILY> = {
  Daily: REPORTS_DAILY, Weekly: REPORTS_WEEKLY, Monthly: REPORTS_MONTHLY,
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('Daily')
  const rows = DATA[period]

  const card: React.CSSProperties = {
    background: SC.cardBg, borderRadius: SC.radius.lg,
    border: `1px solid ${SC.cardBorder}`, boxShadow: SC.cardShadow,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SC.textDark, margin: 0 }}>Energy Performance Reports</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: SC.textMuted }}>Scheduled and on-demand energy reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Reports This Month', value: '38',       color: SC.blue      },
          { label: 'Avg Report Size',    value: '1.1 MB',   color: SC.indigo    },
          { label: 'Scheduled Reports',  value: '12',       color: SC.success   },
          { label: 'Last Generated',     value: '08:00 AM', color: SC.textMuted },
        ].map(k => (
          <div key={k.label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: SC.textMuted, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <StitchPanel title="Report Archive" noPad
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {(['Daily', 'Weekly', 'Monthly'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '4px 12px', borderRadius: SC.radius.sm, border: 'none', cursor: 'pointer',
                  fontSize: 11.5, fontWeight: 600,
                  background: period === p ? SC.blue : 'transparent',
                  color: period === p ? '#fff' : SC.textMuted,
                }}>{p}</button>
              ))}
            </div>
            <button style={{
              padding: '5px 12px', borderRadius: SC.radius.sm, border: `1px solid ${SC.cardBorder}`,
              background: SC.cardBg, color: SC.textBody, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            }}>+ Generate</button>
          </div>
        }
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['Report ID', 'Title', 'Generated', 'Size', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 10.5, color: SC.textFaint }}>{r.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: SC.textDark }}>{r.title}</td>
                <td style={{ padding: '12px 16px', color: SC.textMuted }}>{r.generated}</td>
                <td style={{ padding: '12px 16px', color: SC.textBody }}>{r.size}</td>
                <td style={{ padding: '12px 16px' }}><StitchStatusPill label="Ready" /></td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ fontSize: 11, color: SC.blue, background: 'none', border: `1px solid ${SC.blue}`, borderRadius: SC.radius.xs, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StitchPanel>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import { DEVICES_DATA } from '@/components/stitch/stitchMockData'

type TypeFilter = 'All' | 'Smart Meter' | 'RTU' | 'Relay' | 'Gateway'
const TYPES: TypeFilter[] = ['All', 'Smart Meter', 'RTU', 'Relay', 'Gateway']

export default function DevicesPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const visible = typeFilter === 'All' ? DEVICES_DATA : DEVICES_DATA.filter(d => d.type === typeFilter)

  const stats = [
    { label: 'Total',   value: DEVICES_DATA.length,                                     color: SC.blue    },
    { label: 'Online',  value: DEVICES_DATA.filter(d => d.status === 'Online').length,  color: SC.success },
    { label: 'Offline', value: DEVICES_DATA.filter(d => d.status === 'Offline').length, color: SC.danger  },
    { label: 'Pending', value: DEVICES_DATA.filter(d => d.status === 'Pending').length, color: SC.warning },
  ]

  const card: React.CSSProperties = {
    background: SC.cardBg, borderRadius: SC.radius.lg,
    border: `1px solid ${SC.cardBorder}`, boxShadow: SC.cardShadow,
  }

  const provisionBtn = (
    <button style={{ padding: '5px 12px', borderRadius: SC.radius.sm, background: SC.blue, color: '#fff', border: 'none', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
      + Provision Device
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SC.textDark, margin: 0 }}>Device Inventory &amp; Provisioning</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: SC.textMuted }}>IoT sensor and measurement device tracking across all sites</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: SC.textMuted, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <StitchPanel title="Device Registry" noPad
        badge={
          <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '3px 10px', borderRadius: SC.radius.sm, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                background: typeFilter === t ? SC.blue : 'transparent',
                color: typeFilter === t ? '#fff' : SC.textMuted,
              }}>{t}</button>
            ))}
          </div>
        }
        action={provisionBtn}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['Device ID', 'Type', 'Location', 'Model', 'Firmware', 'Status', 'Last Seen', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i < visible.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 10.5, color: SC.textFaint }}>{d.id}</td>
                <td style={{ padding: '11px 14px', color: SC.textBody }}>{d.type}</td>
                <td style={{ padding: '11px 14px', color: SC.textMuted, fontSize: 11.5 }}>{d.location}</td>
                <td style={{ padding: '11px 14px', color: SC.textBody }}>{d.model}</td>
                <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 10.5, color: SC.textFaint }}>{d.fw}</td>
                <td style={{ padding: '11px 14px' }}><StitchStatusPill label={d.status} /></td>
                <td style={{ padding: '11px 14px', color: SC.textFaint, fontSize: 11.5 }}>{d.seen}</td>
                <td style={{ padding: '11px 14px' }}>
                  <button style={{ fontSize: 11, color: SC.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StitchPanel>
    </div>
  )
}

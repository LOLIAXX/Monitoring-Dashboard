'use client'

import { useState } from 'react'
import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchPanel from '@/components/stitch/StitchPanel'
import { Sparkline } from '@/components/stitch/StitchChartPlaceholder'
import { ANALYTICS_TRENDS } from '@/components/stitch/stitchMockData'

type Range = '7D' | '30D' | '90D'

// Deterministic heatmap — no Math.random() to avoid hydration mismatch
const HEATMAP_HOURS = ['00', '03', '06', '09', '12', '15', '18', '21']
const HEATMAP_DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HEATMAP_DATA  = HEATMAP_DAYS.map((_, di) =>
  HEATMAP_HOURS.map((_, hi) => ((di * 13 + hi * 17 + 31) % 80) + 10)
)

function heatColor(val: number): string {
  if (val < 30) return SC.blueLight
  if (val < 55) return '#BAE6FD'
  if (val < 75) return SC.blueMid + '66'
  return SC.blue
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('7D')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: SC.textDark, margin: 0 }}>Analytics & Visualization</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: SC.textMuted }}>Energy trend modeling and load intensity analysis</p>
        </div>
        <div style={{ display: 'flex', gap: 3, background: SC.cardBg, border: `1px solid ${SC.cardBorder}`, borderRadius: SC.radius.md, padding: 3 }}>
          {(['7D', '30D', '90D'] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '5px 14px', borderRadius: SC.radius.sm, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: range === r ? SC.blue : 'transparent',
              color: range === r ? '#fff' : SC.textMuted,
            }}>{r}</button>
          ))}
        </div>
      </div>

      <StitchPanel title={`Power Demand Trend — All Sites (${range})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ANALYTICS_TRENDS.map(site => (
            <div key={site.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 160, fontSize: 12, fontWeight: 600, color: SC.textBody, flexShrink: 0 }}>{site.label}</span>
              <Sparkline values={site.values} color={site.color} width={140} height={40} />
              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { k: 'Min', v: Math.min(...site.values) },
                  { k: 'Max', v: Math.max(...site.values) },
                  { k: 'Avg', v: Math.round(site.values.reduce((a, b) => a + b, 0) / site.values.length) },
                ].map(s => (
                  <span key={s.k} style={{ fontSize: 11, color: SC.textFaint }}>
                    {s.k}: <strong style={{ color: SC.textBody, fontVariantNumeric: 'tabular-nums' }}>{s.v.toLocaleString()} kW</strong>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </StitchPanel>

      <StitchPanel title="Load Intensity Heatmap — Factory Site A (% of Peak)">
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 22 }}>
            {HEATMAP_DAYS.map(d => (
              <div key={d} style={{ fontSize: 10.5, color: SC.textMuted, height: 28, display: 'flex', alignItems: 'center', width: 28 }}>{d}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {HEATMAP_HOURS.map(h => (
                <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: SC.textFaint }}>{h}h</div>
              ))}
            </div>
            {HEATMAP_DATA.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {row.map((val, ci) => (
                  <div key={ci} style={{
                    flex: 1, height: 28, borderRadius: 4,
                    background: heatColor(val),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: val > 65 ? '#fff' : SC.textMuted }}>{val}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </StitchPanel>
    </div>
  )
}

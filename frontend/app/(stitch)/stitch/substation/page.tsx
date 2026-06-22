import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchMetricCard from '@/components/stitch/StitchMetricCard'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import { BarSegment } from '@/components/stitch/StitchChartPlaceholder'
import { SUB_KPIS, SUB_PHASES, SUB_FEEDERS, SUB_EVENTS } from '@/components/stitch/stitchMockData'

const EVT_COLOR: Record<string, string> = { fault: SC.danger, info: SC.info, resolved: SC.success }

export default function SubstationPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: SC.cardBg, borderRadius: SC.radius.lg, border: `1px solid ${SC.cardBorder}`,
        boxShadow: SC.cardShadow, padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: SC.textDark, margin: '0 0 4px' }}>
            Main 63 kV Substation — Factory Site A
          </h2>
          <p style={{ margin: 0, fontSize: 12.5, color: SC.textMuted }}>
            Feeder SS-01 · Grid connection point · Last sync: 10:45 AM
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <StitchStatusPill label="Phase Imbalance" variant="warning" />
          <StitchStatusPill label="ENERGIZED" variant="Active" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {SUB_KPIS.map(k => <StitchMetricCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <StitchPanel title="Phase Monitoring" noPad>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: SC.pageBg }}>
                {['Phase', 'Voltage', 'Current', 'Power', 'PF', 'Status'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUB_PHASES.map((p, i) => (
                <tr key={p.phase} style={{ borderBottom: i < SUB_PHASES.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: SC.textDark }}>{p.phase}</td>
                  <td style={{ padding: '11px 14px', color: SC.textBody, fontVariantNumeric: 'tabular-nums' }}>{p.voltage}</td>
                  <td style={{ padding: '11px 14px', color: SC.textBody, fontVariantNumeric: 'tabular-nums' }}>{p.current}</td>
                  <td style={{ padding: '11px 14px', color: SC.textBody, fontVariantNumeric: 'tabular-nums' }}>{p.power}</td>
                  <td style={{ padding: '11px 14px', color: SC.textBody, fontVariantNumeric: 'tabular-nums' }}>{p.pf}</td>
                  <td style={{ padding: '11px 14px' }}><StitchStatusPill label={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </StitchPanel>

        <StitchPanel title="Feeder Load Distribution">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SUB_FEEDERS.map(f => (
              <div key={f.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: SC.textBody }}>
                    <strong style={{ color: SC.textDark }}>{f.id}</strong> {f.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: SC.textDark, fontVariantNumeric: 'tabular-nums' }}>{f.load}</span>
                </div>
                <BarSegment pct={f.pct} status={f.status} />
              </div>
            ))}
          </div>
        </StitchPanel>
      </div>

      <StitchPanel title="Event Log">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SUB_EVENTS.map((e, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              paddingBottom: i < SUB_EVENTS.length - 1 ? 10 : 0,
              borderBottom: i < SUB_EVENTS.length - 1 ? `1px solid ${SC.cardBorder}` : 'none',
            }}>
              <span style={{ fontSize: 11, color: SC.textFaint, width: 80, flexShrink: 0 }}>{e.time}</span>
              <span style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: EVT_COLOR[e.type] ?? SC.info }} />
              <span style={{ fontSize: 12.5, color: SC.textBody }}>{e.msg}</span>
            </div>
          ))}
        </div>
      </StitchPanel>
    </div>
  )
}

import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchMetricCard from '@/components/stitch/StitchMetricCard'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import StitchPlantMap from '@/components/stitch/StitchPlantMap'
import { BarSegment } from '@/components/stitch/StitchChartPlaceholder'
import {
  OVERVIEW_KPIS, OVERVIEW_SITES, OVERVIEW_TOP_CONSUMERS, OVERVIEW_ALERTS,
} from '@/components/stitch/stitchMockData'

const ALERT_DOT: Record<string, string> = { critical: SC.danger, warning: SC.warning, info: SC.info }
const KPI_ACCENTS = [SC.blue, SC.indigo, SC.warning, SC.success, SC.danger, SC.success]

export default function StitchOverviewPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SC.textDark, margin: 0 }}>Factory Overview Dashboard</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: SC.textMuted }}>Real-time energy monitoring across all sites · Sonergy Monitoring System</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
        {OVERVIEW_KPIS.map((k, i) => (
          <StitchMetricCard key={k.label} {...k} accentColor={KPI_ACCENTS[i]} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        <StitchPanel title="Plant Infrastructure Map" noPad>
          <div style={{ padding: 16 }}><StitchPlantMap /></div>
        </StitchPanel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StitchPanel title="Top Consumers">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {OVERVIEW_TOP_CONSUMERS.map(c => (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5, color: SC.textBody }}>{c.name}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: SC.textDark, fontVariantNumeric: 'tabular-nums' }}>{c.kw} kW</span>
                  </div>
                  <BarSegment pct={c.pct} />
                </div>
              ))}
            </div>
          </StitchPanel>

          <StitchPanel title="Recent Alerts"
            badge={
              <span style={{ background: SC.dangerBg, color: SC.danger, borderRadius: SC.radius.pill, padding: '2px 8px', fontSize: 10.5, fontWeight: 700 }}>
                2 active
              </span>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {OVERVIEW_ALERTS.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: ALERT_DOT[a.level] ?? SC.info }} />
                  <div>
                    <div style={{ fontSize: 11.5, color: SC.textBody }}>{a.msg}</div>
                    <div style={{ fontSize: 10.5, color: SC.textFaint, marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </StitchPanel>
        </div>
      </div>

      <StitchPanel title="All Sites" noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['Site Name', 'Status', 'Power', 'Devices', 'Alerts'].map(h => (
                <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OVERVIEW_SITES.map((s, i) => (
              <tr key={s.name} style={{ borderBottom: i < OVERVIEW_SITES.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: SC.textDark }}>{s.name}</td>
                <td style={{ padding: '12px 18px' }}><StitchStatusPill label={s.status} /></td>
                <td style={{ padding: '12px 18px', color: SC.textBody, fontVariantNumeric: 'tabular-nums' }}>{s.power}</td>
                <td style={{ padding: '12px 18px', color: SC.textBody }}>{s.devices}</td>
                <td style={{ padding: '12px 18px', fontWeight: 700, color: s.alerts > 0 ? SC.danger : SC.success }}>{s.alerts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StitchPanel>
    </div>
  )
}

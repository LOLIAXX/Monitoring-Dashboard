import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchMetricCard from '@/components/stitch/StitchMetricCard'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import { SONO_KPIS, SONO_PHASES, SONO_TRANSFORMERS } from '@/components/stitch/stitchMockData'

export default function SubstationSonergyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: SC.cardBg, borderRadius: SC.radius.lg, border: `1px solid ${SC.cardBorder}`,
        boxShadow: SC.cardShadow, padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: SC.textDark, margin: '0 0 4px' }}>
            63 kV Grid Entry Substation — Sonergy Hub
          </h2>
          <p style={{ margin: 0, fontSize: 12.5, color: SC.textMuted }}>
            Primary grid connection · Incoming feeder GE-01 · Last sync: 10:47 AM
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <StitchStatusPill label="ALL PHASES NORMAL" variant="normal" />
          <StitchStatusPill label="ENERGIZED" variant="Active" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {SONO_KPIS.map(k => <StitchMetricCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <StitchPanel title="Phase Monitoring (63 kV Bus)" noPad>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: SC.pageBg }}>
                {['Phase', 'Voltage', 'Current', 'Power', 'PF', 'Status'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SONO_PHASES.map((p, i) => (
                <tr key={p.phase} style={{ borderBottom: i < SONO_PHASES.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
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

        <StitchPanel title="Transformer Status" noPad>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: SC.pageBg }}>
                {['ID', 'Ratio', 'Capacity', 'Load', 'Status'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SONO_TRANSFORMERS.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < SONO_TRANSFORMERS.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: SC.textDark }}>{t.id}</td>
                  <td style={{ padding: '11px 14px', color: SC.textBody }}>{t.ratio}</td>
                  <td style={{ padding: '11px 14px', color: SC.textBody }}>{t.capacity}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: t.status === 'high' ? SC.warning : SC.textDark, fontVariantNumeric: 'tabular-nums' }}>{t.load}</td>
                  <td style={{ padding: '11px 14px' }}><StitchStatusPill label={t.status === 'high' ? 'High Load' : 'Normal'} variant={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </StitchPanel>
      </div>
    </div>
  )
}

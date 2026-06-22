import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import { SITES_CONFIG, FACTORIES_CONFIG } from '@/components/stitch/stitchMockData'

export default function SitesPage() {
  const addBtn = (
    <button style={{ padding: '5px 12px', borderRadius: SC.radius.sm, background: SC.blue, color: '#fff', border: 'none', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
      + Add Site
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SC.textDark, margin: 0 }}>Site &amp; Factory Configuration</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: SC.textMuted }}>Manage site hierarchy, factory layout, and geographic structure</p>
      </div>

      <StitchPanel title={`Sites (${SITES_CONFIG.length})`} noPad action={addBtn}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['Code', 'Site Name', 'Location', 'Factories', 'Zones', 'Substations', 'Devices', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SITES_CONFIG.map((s, i) => (
              <tr key={s.code} style={{ borderBottom: i < SITES_CONFIG.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontWeight: 700, color: SC.blue }}>{s.code}</td>
                <td style={{ padding: '11px 16px', fontWeight: 600, color: SC.textDark }}>{s.name}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody }}>{s.city}, Iran</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{s.factories}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{s.zones}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{s.substations}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{s.devices}</td>
                <td style={{ padding: '11px 16px' }}><StitchStatusPill label={s.status} /></td>
                <td style={{ padding: '11px 16px' }}>
                  <button style={{ fontSize: 11, color: SC.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StitchPanel>

      <StitchPanel title={`Factories (${FACTORIES_CONFIG.length})`} noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['Site', 'Factory ID', 'Name', 'Floors', 'Floor Area', 'Zones', 'Devices', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FACTORIES_CONFIG.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: i < FACTORIES_CONFIG.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontWeight: 700, color: SC.blue }}>{f.site}</td>
                <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 11, color: SC.textFaint }}>{f.id}</td>
                <td style={{ padding: '11px 16px', fontWeight: 600, color: SC.textDark }}>{f.name}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{f.floors}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody }}>{f.area}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{f.zones}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{f.devices}</td>
                <td style={{ padding: '11px 16px' }}>
                  <button style={{ fontSize: 11, color: SC.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StitchPanel>
    </div>
  )
}

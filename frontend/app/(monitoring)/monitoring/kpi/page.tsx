import { C } from '@/components/monitoring/monitoringColors'
import { IconKPI } from '@/components/monitoring/monitoringIcons'

export default function KpiPage() {
  return (
    <div className="surface-premium" style={{
      borderRadius: C.radius.lg,
      padding: '56px 32px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
        background: C.blueLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconKPI size={26} color={C.blue}/>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>KPI Explorer</h2>
      <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 420, marginInline: 'auto', lineHeight: 1.65 }}>
        Energy intensity, peak demand targets, efficiency scores, and
        target vs. actual tracking across all production zones.
      </p>
      <div style={{
        display: 'inline-block', marginTop: 20,
        background: C.skyDim, color: C.sky, borderRadius: C.radius.pill,
        padding: '4px 14px', fontSize: 11.5, fontWeight: 700,
        border: `1px solid rgba(14,165,233,0.25)`,
      }}>Coming Soon</div>
    </div>
  )
}

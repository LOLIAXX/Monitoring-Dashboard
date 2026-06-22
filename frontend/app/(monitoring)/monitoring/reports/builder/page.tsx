import { C } from '@/components/monitoring/monitoringColors'
import { IconReports } from '@/components/monitoring/monitoringIcons'

export default function ReportBuilderPage() {
  return (
    <div className="surface-premium" style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: C.radius['2xl'],
      padding: '64px 32px', textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', top: -90, left: '50%', transform: 'translateX(-50%)',
        width: 340, height: 340, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: '0 auto 22px',
          background: C.gradBlue, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 26px rgba(37,99,235,0.32)',
        }}>
          <IconReports size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.textDark, marginBottom: 10, letterSpacing: '-0.02em' }}>Report Builder</h2>
        <p style={{ fontSize: 13.5, color: C.textMuted, maxWidth: 440, marginInline: 'auto', lineHeight: 1.7 }}>
          Compose custom energy reports by selecting sites, substations, parameters,
          and time ranges, then export or schedule them.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 22,
          background: C.skyDim, color: C.teal, borderRadius: C.radius.pill,
          padding: '5px 15px', fontSize: 11.5, fontWeight: 700,
          border: '1px solid rgba(14,165,233,0.25)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.sky }} />
          Coming Soon
        </div>
      </div>
    </div>
  )
}

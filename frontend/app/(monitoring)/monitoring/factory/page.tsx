import { C } from '@/components/monitoring/monitoringColors'
import { IconFactory } from '@/components/monitoring/monitoringIcons'

export default function FactoryPage() {
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
        <IconFactory size={26} color={C.blue}/>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>
        Factory / Plant View
      </h2>
      <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 420, marginInline: 'auto', lineHeight: 1.65 }}>
        Interactive plant layout with live device status, energy flows, and
        site-level consumption breakdown. Zone drill-down and hotspots coming in Batch 3.
      </p>
      <div style={{
        display: 'inline-block', marginTop: 20,
        background: C.skyDim, color: C.sky,
        borderRadius: C.radius.pill, padding: '4px 14px',
        fontSize: 11.5, fontWeight: 700,
        border: `1px solid rgba(14,165,233,0.25)`,
      }}>Coming in Batch 3</div>
    </div>
  )
}

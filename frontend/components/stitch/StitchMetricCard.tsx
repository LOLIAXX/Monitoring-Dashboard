import { SC } from './stitchDesignTokens'

interface Props {
  label: string
  value: string
  unit?: string
  delta?: string
  sub?: string
  accentColor?: string
}

export default function StitchMetricCard({ label, value, unit, delta, sub, accentColor = SC.blue }: Props) {
  return (
    <div style={{
      background: SC.cardBg, borderRadius: SC.radius.lg,
      border: `1px solid ${SC.cardBorder}`, boxShadow: SC.cardShadow,
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: SC.textMuted, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: SC.textDark, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, fontWeight: 600, color: SC.textMuted }}>{unit}</span>}
      </div>
      {(delta || sub) && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          {delta && (
            <span style={{
              fontSize: 10.5, fontWeight: 700,
              background: accentColor + '18', color: accentColor,
              borderRadius: SC.radius.xs, padding: '2px 6px',
            }}>{delta}</span>
          )}
          {sub && <span style={{ fontSize: 10.5, color: SC.textFaint }}>{sub}</span>}
        </div>
      )}
    </div>
  )
}

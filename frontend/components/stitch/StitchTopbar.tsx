import { SC } from './stitchDesignTokens'

interface Props { pageLabel: string; userInitial: string }

export default function StitchTopbar({ pageLabel, userInitial }: Props) {
  return (
    <header style={{
      height: 60, background: SC.headerBg, borderBottom: `1px solid ${SC.headerBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: SC.textMuted, fontWeight: 600 }}>Sonergy</span>
        <span style={{ color: SC.cardBorder, fontSize: 14 }}>/</span>
        <span style={{ fontSize: 11, color: SC.textMuted, fontWeight: 600 }}>Stitch Preview</span>
        <span style={{ color: SC.cardBorder, fontSize: 14 }}>/</span>
        <h1 style={{ fontSize: 14, fontWeight: 700, color: SC.textDark, margin: 0 }}>{pageLabel}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          background: SC.blueLight, color: SC.blue,
          borderRadius: SC.radius.pill, padding: '3px 10px',
          fontSize: 10.5, fontWeight: 700, border: `1px solid rgba(37,99,235,0.20)`,
        }}>STITCH PREVIEW</span>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: SC.blue, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>{userInitial}</div>
      </div>
    </header>
  )
}

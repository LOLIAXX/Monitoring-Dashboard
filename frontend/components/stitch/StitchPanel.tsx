import { SC } from './stitchDesignTokens'

interface Props {
  title: string
  badge?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  noPad?: boolean
}

export default function StitchPanel({ title, badge, action, children, noPad }: Props) {
  return (
    <div style={{
      background: SC.cardBg, borderRadius: SC.radius.lg,
      border: `1px solid ${SC.cardBorder}`, boxShadow: SC.cardShadow,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 18px', borderBottom: `1px solid ${SC.cardBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: SC.textDark }}>{title}</span>
          {badge}
        </div>
        {action}
      </div>
      <div style={noPad ? {} : { padding: '14px 18px' }}>{children}</div>
    </div>
  )
}

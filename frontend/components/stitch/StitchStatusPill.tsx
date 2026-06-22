import { SC } from './stitchDesignTokens'

const PRESETS: Record<string, { bg: string; text: string }> = {
  Online:      { bg: SC.successBg, text: SC.success },
  Active:      { bg: SC.successBg, text: SC.success },
  normal:      { bg: SC.successBg, text: SC.success },
  Normal:      { bg: SC.successBg, text: SC.success },
  Resolved:    { bg: SC.successBg, text: SC.success },
  Offline:     { bg: SC.dangerBg,  text: SC.danger  },
  critical:    { bg: SC.dangerBg,  text: SC.danger  },
  Warning:     { bg: SC.warningBg, text: SC.warning },
  warning:     { bg: SC.warningBg, text: SC.warning },
  high:        { bg: SC.warningBg, text: SC.warning },
  'High Load': { bg: SC.warningBg, text: SC.warning },
  Maintenance: { bg: SC.warningBg, text: SC.warning },
  Inactive:    { bg: SC.cardBorder, text: SC.textMuted },
  Pending:     { bg: SC.warningBg, text: SC.warning },
  info:        { bg: SC.infoBg,    text: SC.info    },
  Ready:       { bg: SC.successBg, text: SC.success },
}

interface Props { label: string; variant?: string }

export default function StitchStatusPill({ label, variant }: Props) {
  const key   = variant ?? label
  const style = PRESETS[key] ?? { bg: SC.infoBg, text: SC.info }
  return (
    <span style={{
      background: style.bg, color: style.text,
      borderRadius: SC.radius.pill, padding: '2px 9px',
      fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap',
      textTransform: 'capitalize',
    }}>
      {label}
    </span>
  )
}

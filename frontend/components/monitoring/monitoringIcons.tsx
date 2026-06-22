/** Inline SVG icons for Sonergy Monitoring Portal navigation. */

interface IconProps { size?: number; color?: string }

export function IconOverview({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/>
    </svg>
  )
}

export function IconFactory({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 13V7l4-3v3l4-3v3l4-3v9H1z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      <rect x="6" y="9" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.2"/>
    </svg>
  )
}

export function IconTrends({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <polyline points="1,12 5,7 8,9 12,4 15,6" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
      <line x1="1" y1="14" x2="15" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconReports({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="1" width="10" height="14" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <line x1="5.5" y1="5" x2="10.5" y2="5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5.5" y1="7.5" x2="10.5" y2="7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5.5" y1="10" x2="8.5" y2="10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconComparison({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="5" width="5" height="8" rx="1" stroke={color} strokeWidth="1.4"/>
      <rect x="10" y="8" width="5" height="5" rx="1" stroke={color} strokeWidth="1.4"/>
      <line x1="3.5" y1="5" x2="3.5" y2="2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="12.5" y1="8" x2="12.5" y2="2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconKPI({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="8" cy="8" r="1.8" fill={color}/>
      <line x1="8" y1="1.5" x2="8" y2="3.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="14.5" y1="8" x2="12.5" y2="8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="10.4" y1="3.6" x2="9.3" y2="5.2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconAI({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.4"/>
      <circle cx="8" cy="2.2" r="1.2" stroke={color} strokeWidth="1.2"/>
      <circle cx="8" cy="13.8" r="1.2" stroke={color} strokeWidth="1.2"/>
      <circle cx="2.2" cy="8" r="1.2" stroke={color} strokeWidth="1.2"/>
      <circle cx="13.8" cy="8" r="1.2" stroke={color} strokeWidth="1.2"/>
      <line x1="8" y1="3.4" x2="8" y2="5" stroke={color} strokeWidth="1.2"/>
      <line x1="8" y1="11" x2="8" y2="12.6" stroke={color} strokeWidth="1.2"/>
      <line x1="3.4" y1="8" x2="5" y2="8" stroke={color} strokeWidth="1.2"/>
      <line x1="11" y1="8" x2="12.6" y2="8" stroke={color} strokeWidth="1.2"/>
    </svg>
  )
}

export function IconAdmin({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.3"/>
      <path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.5 3.5l.9.9M11.6 11.6l.9.9M12.5 3.5l-.9.9M4.4 11.6l-.9.9" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconLogout({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <polyline points="10,5 13,8 10,11" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="13" y1="8" x2="6" y2="8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function IconEnergy({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <polyline points="10,1.5 5,8.5 8.5,8.5 6,14.5 11,7.5 7.5,7.5 10,1.5" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

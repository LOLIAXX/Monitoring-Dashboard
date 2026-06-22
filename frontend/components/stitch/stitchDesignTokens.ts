/** IIS (Industrial Intelligence System) design tokens — Stitch Preview Portal */
export const SC = {
  // Sidebar (dark navy shell)
  sidebarBg:        '#0F172A',
  sidebarActiveBg:  '#2563EB',
  sidebarBorder:    'rgba(255,255,255,0.07)',
  sidebarText:      'rgba(255,255,255,0.85)',
  sidebarTextDim:   'rgba(255,255,255,0.45)',
  sidebarTextMuted: 'rgba(255,255,255,0.20)',

  // Header (light — distinct from dark monitoring header)
  headerBg:     '#FFFFFF',
  headerBorder: '#E2E8F0',
  headerText:   '#0F172A',

  // Page / cards
  pageBg:       '#F8FAFC',
  cardBg:       '#FFFFFF',
  cardBorder:   '#E2E8F0',
  cardShadow:   '0 1px 3px rgba(0,0,0,0.06)',

  // Brand palette
  blue:      '#2563EB',
  blueDark:  '#1D4ED8',
  blueLight: '#EFF6FF',
  blueMid:   '#3B82F6',
  indigo:    '#6366F1',
  indigoBg:  'rgba(99,102,241,0.10)',

  // Semantic
  success:   '#10B981',
  successBg: 'rgba(16,185,129,0.10)',
  warning:   '#F59E0B',
  warningBg: 'rgba(245,158,11,0.10)',
  danger:    '#EF4444',
  dangerBg:  'rgba(239,68,68,0.10)',
  info:      '#0EA5E9',
  infoBg:    'rgba(14,165,233,0.10)',

  // Typography
  textDark:  '#0F172A',
  textBody:  '#374151',
  textMuted: '#64748B',
  textFaint: '#94A3B8',

  // Border radii
  radius: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, pill: 9999 },
} as const

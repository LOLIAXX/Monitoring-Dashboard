/** Shared design tokens for the Sonergy Monitoring Portal + Admin Console.
 *  Premium light SaaS identity: white/blue, deep slate text, tasteful status accents.
 *  NOTE: every previously-exported key is preserved (values only refined) so all
 *  existing consumers keep working — new tokens are additive. */
export const C = {
  // Shell (dark navy sidebars / header)
  shellBg:          '#070E1A',
  sidebarBg:        '#0B1422',
  sidebarActiveBg:  '#0284C7',
  sidebarHover:     'rgba(255,255,255,0.06)',
  sidebarBorder:    'rgba(255,255,255,0.08)',
  sidebarText:      'rgba(255,255,255,0.86)',
  sidebarTextDim:   'rgba(255,255,255,0.48)',
  sidebarTextMuted: 'rgba(255,255,255,0.30)',

  // Page & cards (light)
  pageBg:         '#F4F7FB',
  pageBgPremium:  'radial-gradient(circle at 12% 10%, rgba(56,189,248,0.18), transparent 32%), radial-gradient(circle at 90% 0%, rgba(37,99,235,0.12), transparent 30%), linear-gradient(135deg,#F8FBFF 0%,#EEF6FF 45%,#F8FAFC 100%)',
  pageBgGrid:     'linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)',
  pageBgSoft:     '#F8FAFC',
  cardBg:         '#FFFFFF',
  cardBgPremium:  'linear-gradient(180deg,rgba(255,255,255,0.96) 0%,rgba(248,251,255,0.92) 100%)',
  cardBgRaised:   'linear-gradient(180deg,#FFFFFF 0%,#F8FBFF 100%)',
  cardBorder:     '#E6EBF2',
  cardBorderPremium: 'rgba(148,163,184,0.30)',
  cardBorderSoft: 'rgba(226,232,240,0.7)',
  cardShadow:     '0 1px 2px rgba(15,23,42,0.04),0 1px 3px rgba(15,23,42,0.06)',
  cardShadowMd:   '0 6px 20px rgba(15,23,42,0.08),0 2px 6px rgba(15,23,42,0.05)',
  cardShadowLg:   '0 16px 40px rgba(15,23,42,0.12),0 4px 12px rgba(15,23,42,0.06)',
  cardShadowPremium: '0 1px 0 rgba(255,255,255,0.88) inset, 0 10px 28px rgba(15,23,42,0.08), 0 2px 8px rgba(37,99,235,0.04)',
  cardShadowChart: '0 1px 0 rgba(255,255,255,0.90) inset, 0 14px 36px rgba(15,23,42,0.09), 0 8px 24px rgba(37,99,235,0.06)',

  // Brand
  blue:      '#2563EB',
  blueLight: '#EFF6FF',
  blueMid:   '#1D4ED8',
  blueDark:  '#1E3A8A',
  sky:       '#0EA5E9',
  skyDim:    'rgba(14,165,233,0.12)',
  skyWash:   'rgba(14,165,233,0.075)',
  teal:      '#0284C7',
  cyan:      '#06B6D4',
  cyanWash:  'rgba(6,182,212,0.10)',
  navy:      '#0F172A',
  indigo:    '#4F46E5',

  // Extended status / accents
  emerald:   '#10B981',
  emeraldBg: 'rgba(16,185,129,0.10)',
  amber:     '#F59E0B',
  amberBg:   'rgba(245,158,11,0.12)',
  rose:      '#F43F5E',
  roseBg:    'rgba(244,63,94,0.10)',
  violet:    '#8B5CF6',
  violetBg:  'rgba(139,92,246,0.10)',

  // Semantic (kept)
  success:   '#10B981',
  successBg: 'rgba(16,185,129,0.10)',
  warning:   '#F59E0B',
  warningBg: 'rgba(245,158,11,0.10)',
  danger:    '#EF4444',
  dangerBg:  'rgba(239,68,68,0.10)',

  // Gradients
  gradBrand:   'linear-gradient(135deg,#1D4ED8 0%,#0EA5E9 100%)',
  gradBlue:    'linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)',
  gradSky:     'linear-gradient(135deg,#0EA5E9 0%,#0284C7 100%)',
  gradEmerald: 'linear-gradient(135deg,#10B981 0%,#059669 100%)',
  gradAmber:   'linear-gradient(135deg,#F59E0B 0%,#D97706 100%)',
  gradViolet:  'linear-gradient(135deg,#8B5CF6 0%,#6366F1 100%)',
  gradShell:   'linear-gradient(180deg,#0B1422 0%,#070E1A 100%)',

  // Focus rings
  ringBlue: '0 0 0 3px rgba(37,99,235,0.16)',
  ringSky:  '0 0 0 3px rgba(14,165,233,0.16)',

  // Text
  textDark:  '#0F172A',
  textBody:  '#374151',
  textMuted: '#64748B',
  textFaint: '#94A3B8',

  // Radius (outer = inner + padding, per concentric-radius principle)
  radius: { xs: 4, sm: 6, md: 10, lg: 14, xl: 20, '2xl': 24, pill: 9999 },

  // Header
  headerBg:     '#0F172A',
  headerBorder: 'rgba(255,255,255,0.08)',

  // ── Second-pass additions (additive — nothing above changed) ─────────
  // Soft / elevated surfaces for nested panels, table heads, segmented tracks
  surfaceSoft:     '#F8FAFC',
  surfaceTint:     '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  surfacePanel:    '#F6FAFF',
  surfaceTrack:    '#EAF1FA',
  chartGrid:       'rgba(100,116,139,0.16)',
  chartAxis:       '#94A3B8',

  // Status text colours that hold WCAG AA on white (for badges/pills/labels).
  // Pair with the matching *Bg token. Keeps blue as the single identity accent;
  // these fire only on real semantic state.
  emeraldText: '#047857',
  amberText:   '#B45309',
  roseText:    '#BE123C',
  violetText:  '#6D28D9',
  blueText:    '#1D4ED8',
  skyText:     '#0369A1',

  // Motion tokens (Emil-Kowalski school: fast, purposeful, interruptible).
  // CSS-only — no animation package. Use for scoped `transition` declarations.
  ease: {
    smooth: 'cubic-bezier(0.22,1,0.36,1)',
    sharp:  'cubic-bezier(0.4,0,0.2,1)',
    out:    'cubic-bezier(0.16,1,0.3,1)',
  },
  dur: { fast: '140ms', base: '180ms', slow: '240ms' },
} as const

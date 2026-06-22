export interface NavItem {
  label: string
  shortLabel: string
  href: string
  disabled?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Factory Overview',
    items: [
      { label: 'Factory Overview', shortLabel: 'FAC', href: '/monitoring' },
    ],
  },
  {
    label: 'Trends & Reports',
    items: [
      { label: 'Monitoring & Trends', shortLabel: 'TRD', href: '/monitoring/trends' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { label: 'Analysis and Reports', shortLabel: 'ANL', href: '/monitoring/reports' },
    ],
  },
  {
    label: 'Data Analysis',
    items: [
      { label: 'AI Analysis', shortLabel: 'AI', href: '/monitoring/ai', disabled: true },
    ],
  },
]

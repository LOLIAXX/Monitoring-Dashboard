export interface StitchNavItem  { label: string; href: string }
export interface StitchNavGroup { label: string; items: StitchNavItem[] }

export const STITCH_NAV_GROUPS: StitchNavGroup[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Factory Overview',     href: '/stitch' },
      { label: 'Substation Detail',    href: '/stitch/substation' },
      { label: 'Substation (Sonergy)', href: '/stitch/substation-sonergy' },
      { label: 'Alerts Center',        href: '/stitch/alerts' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Energy Reports',  href: '/stitch/reports'   },
      { label: 'Analytics & Viz', href: '/stitch/analytics' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Sites & Factories', href: '/stitch/sites'   },
      { label: 'Users',             href: '/stitch/users'   },
      { label: 'Devices',           href: '/stitch/devices' },
    ],
  },
]

export function resolveStitchLabel(pathname: string): string {
  for (const g of STITCH_NAV_GROUPS) {
    for (const item of g.items) {
      if (item.href === '/stitch' ? pathname === '/stitch' : pathname.startsWith(item.href)) {
        return item.label
      }
    }
  }
  return 'Stitch Preview'
}

'use client'

import ListPage from '@/components/ListPage'
import { Badge, fmtDate, type Column } from '@/components/listPageHelpers'

type SiteRow = {
  company_id: number
  name: string
  location: string | null
  is_active: boolean
  created_at: string
}

const COLS: Column[] = [
  { header: 'Name',       render: r => (r as unknown as SiteRow).name },
  { header: 'Location',   render: r => (r as unknown as SiteRow).location
      ?? <span style={{ color: '#94A3B8' }}>—</span> },
  { header: 'Company ID', render: r => `#${(r as unknown as SiteRow).company_id}`, width: '110px' },
  { header: 'Active',     render: r => <Badge ok={(r as unknown as SiteRow).is_active} />, width: '80px'  },
  { header: 'Created',    render: r => fmtDate((r as unknown as SiteRow).created_at),      width: '140px' },
]

export default function SitesPage() {
  return <ListPage title="Sites" endpoint="/sites/" columns={COLS} />
}

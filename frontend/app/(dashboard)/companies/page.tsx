'use client'

import ListPage from '@/components/ListPage'
import { Badge, fmtDate, type Column } from '@/components/listPageHelpers'

type CompanyRow = {
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

const COLS: Column[] = [
  { header: 'Name',        render: r => (r as unknown as CompanyRow).name },
  { header: 'Description', render: r => (r as unknown as CompanyRow).description
      ?? <span style={{ color: '#94A3B8' }}>—</span> },
  { header: 'Active',      render: r => <Badge ok={(r as unknown as CompanyRow).is_active} />, width: '80px'  },
  { header: 'Created',     render: r => fmtDate((r as unknown as CompanyRow).created_at),      width: '140px' },
]

export default function CompaniesPage() {
  return <ListPage title="Companies" endpoint="/companies/" columns={COLS} />
}

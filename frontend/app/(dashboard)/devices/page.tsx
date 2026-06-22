'use client'

import ListPage from '@/components/ListPage'
import { Badge, fmtDate, type Column } from '@/components/listPageHelpers'

type DeviceRow = {
  site_id: number
  name: string
  device_type: string | null
  serial_number: string | null
  is_active: boolean
  created_at: string
}

const COLS: Column[] = [
  { header: 'Name',    render: r => (r as unknown as DeviceRow).name },
  { header: 'Type',    render: r => (r as unknown as DeviceRow).device_type
      ?? <span style={{ color: '#94A3B8' }}>—</span> },
  { header: 'Serial',  render: r => (r as unknown as DeviceRow).serial_number
      ?? <span style={{ color: '#94A3B8' }}>—</span> },
  { header: 'Site ID', render: r => `#${(r as unknown as DeviceRow).site_id}`, width: '80px'  },
  { header: 'Active',  render: r => <Badge ok={(r as unknown as DeviceRow).is_active} />,  width: '80px'  },
  { header: 'Created', render: r => fmtDate((r as unknown as DeviceRow).created_at),       width: '140px' },
]

export default function DevicesPage() {
  return <ListPage title="Devices" endpoint="/devices/" columns={COLS} />
}

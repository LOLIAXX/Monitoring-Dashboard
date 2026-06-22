import type { ReactNode } from 'react'

export interface Column {
  header: string
  render: (row: Record<string, unknown>) => ReactNode
  width?: string
}

export function Badge({ ok }: { ok: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      background: ok ? 'rgba(16,185,129,0.12)' : '#F1F5F9',
      color: ok ? '#047857' : '#64748B',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: ok ? '#10B981' : '#94A3B8',
      }} />
      {ok ? 'Yes' : 'No'}
    </span>
  )
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

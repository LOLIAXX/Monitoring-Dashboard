'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export interface Column {
  header: string
  render: (row: Record<string, unknown>) => ReactNode
  width?: string
}

interface Props {
  title: string
  endpoint: string
  columns: Column[]
  headerAction?: ReactNode
  actions?: (row: Record<string, unknown>) => ReactNode
  refreshKey?: number
}

const TH: CSSProperties = {
  padding: '12px 18px',
  fontSize: 11,
  color: '#64748B',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  textAlign: 'left',
  background: '#F8FAFC',
  borderBottom: '1px solid #E6EBF2',
  whiteSpace: 'nowrap',
}

const TD: CSSProperties = {
  padding: '13px 18px',
  fontSize: 14,
  color: '#1E293B',
  borderBottom: '1px solid #F1F5F9',
  verticalAlign: 'middle',
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

export default function ListPage({ title, endpoint, columns, headerAction, actions, refreshKey }: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const token = getToken()
    apiFetch<Record<string, unknown>[]>(endpoint, {}, token)
      .then(data => { setRows(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(e => { setError(e instanceof Error ? e.message : String(e)); setLoading(false) })
  }, [endpoint, refreshKey])

  return (
    <div className="table-card-premium" style={{
      borderRadius: 18,
      overflow: 'hidden',
    }}>

      {/* Card header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(148,163,184,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{title}</h2>
          {!loading && !error && (
            <span className="tnum" style={{
              background: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)',
              color: '#1D4ED8',
              fontSize: 12,
              fontWeight: 700,
              padding: '2px 10px',
              borderRadius: 999,
              border: '1px solid rgba(37,99,235,0.15)',
              minWidth: 26, textAlign: 'center',
            }}>
              {rows.length}
            </span>
          )}
        </div>
        {headerAction}
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" style={{ padding: '14px 22px', color: '#991B1B', background: '#FEF2F2', fontSize: 14, borderBottom: '1px solid #FEE2E2' }}>
          {error}
        </div>
      )}

      {/* Table */}
      {!error && (
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl-sticky" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c.header} style={{ ...TH, width: c.width }}>
                    {c.header}
                  </th>
                ))}
                {actions && (
                  <th style={{ ...TH, width: '120px', textAlign: 'right' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {columns.map((_, j) => (
                        <td key={j} style={TD}>
                          <div className="skeleton" style={{
                            height: 13, borderRadius: 5,
                            width: j === 0 ? '55%' : '70%',
                          }} />
                        </td>
                      ))}
                      {actions && <td style={TD} />}
                    </tr>
                  ))
                : rows.length === 0
                  ? (
                    <tr>
                      <td
                        colSpan={columns.length + (actions ? 1 : 0)}
                        style={{ ...TD, borderBottom: 'none', padding: '52px 16px' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          <div className="empty-plate" style={{
                            width: 44, height: 44, borderRadius: 12,
                            color: '#64748B',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M9 14h6"/>
                            </svg>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No records yet</div>
                          <div style={{ fontSize: 12.5, color: '#94A3B8' }}>Records will appear here once added.</div>
                        </div>
                      </td>
                    </tr>
                  )
                  : rows.map((row, i) => (
                    <tr key={i} className="row-hover">
                      {columns.map(c => (
                        <td key={c.header} style={TD}>
                          {c.render(row)}
                        </td>
                      ))}
                      {actions && (
                        <td style={{ ...TD, textAlign: 'right' }}>
                          {actions(row)}
                        </td>
                      )}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

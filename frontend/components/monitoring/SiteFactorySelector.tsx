'use client'

import { useEffect, useRef, useState } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { C } from './monitoringColors'

interface SiteRow {
  id: number
  name: string
  location: string | null
  is_active: boolean
}

interface Props {
  selectedKey: string | null
  onSelect: (key: string, name: string) => void
  userInitial: string
}

function abbrev(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

export default function SiteFactorySelector({ selectedKey, onSelect, userInitial }: Props) {
  // Derived from the parent's persisted selection (restored post-mount), so the
  // first server/client render is identical: no selection -> expanded (wide).
  const expanded = selectedKey === null
  const [hovered, setHovered]   = useState(false)
  const [sites, setSites]       = useState<SiteRow[]>([])
  const [loading, setLoading]   = useState(true)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const token = getToken()
    apiFetch<SiteRow[]>('/sites/', {}, token)
      .then(data => { setSites(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleSelect(key: string, name: string) {
    onSelect(key, name)
  }

  function onMouseEnter() {
    if (expanded) return
    hoverTimer.current = setTimeout(() => setHovered(true), 80)
  }
  function onMouseLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHovered(false)
  }

  const wide = expanded || hovered

  // Visual state (rest / hover / active) is driven by the `.site-row` and
  // `.icon-rail` classes in globals.css so hover feedback fires (inline
  // `background` would otherwise out-rank CSS :hover). These objects carry
  // layout only.
  const wideBtn: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left',
    borderRadius: C.radius.md,
    padding: '9px 12px', marginBottom: 3, cursor: 'pointer',
    whiteSpace: 'nowrap', minHeight: 44,
  }

  const iconBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 44, height: 44, margin: '0 auto 6px',
    borderRadius: C.radius.md,
    cursor: 'pointer', position: 'relative',
  }

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: wide ? 264 : 72, flexShrink: 0,
        background: C.shellBg,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden', zIndex: 10,
        boxShadow: hovered && !expanded ? '4px 0 24px rgba(0,0,0,0.55)' : 'none',
        position: hovered && !expanded ? 'absolute' : 'relative',
        height: hovered && !expanded ? '100vh' : undefined,
        borderRight: `1px solid ${C.sidebarBorder}`,
      }}
    >
      {/* Logo zone */}
      <div style={{
        height: 64, flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
        borderBottom: `1px solid ${C.sidebarBorder}`,
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: 36, height: 36, flexShrink: 0, borderRadius: C.radius.sm,
          background: 'linear-gradient(135deg,#1D4ED8,#0EA5E9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        {wide && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Sonergy</div>
            <div style={{ color: C.sky, fontSize: 8.5, fontWeight: 600, letterSpacing: '0.10em', marginTop: 1 }}>
              SITE SELECTOR
            </div>
          </div>
        )}
      </div>

      {/* Site list */}
      <div className="dark-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>
        {/* All Sites */}
        {wide ? (
          <button
            onClick={() => handleSelect('all', 'All Sites')}
            className="site-row"
            data-active={selectedKey === 'all'}
            style={{
              ...wideBtn,
              color: selectedKey === 'all' ? '#fff' : C.sidebarTextDim,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>All Sites</span>
            </div>
          </button>
        ) : (
          <button title="All Sites" onClick={() => handleSelect('all', 'All Sites')} className="icon-rail" data-active={selectedKey === 'all'} style={{
            ...iconBtn, color: '#fff',
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        )}

        <div style={{ height: 1, background: C.sidebarBorder, margin: '4px 4px 8px' }}/>

        {loading ? (
          <div style={{ color: C.sidebarTextMuted, fontSize: 11, textAlign: 'center', padding: '12px 8px' }}>
            {wide ? 'Loading sites…' : '…'}
          </div>
        ) : sites.length === 0 ? (
          <div style={{ color: C.sidebarTextMuted, fontSize: 11, textAlign: 'center', padding: '12px 8px' }}>
            {wide ? 'No sites found' : '—'}
          </div>
        ) : sites.map(site => {
          const key = String(site.id)
          const active = selectedKey === key
          return wide ? (
            <button key={site.id} onClick={() => handleSelect(key, site.name)} className="site-row" data-active={active} style={{
              ...wideBtn,
              color: active ? '#fff' : site.is_active ? C.sidebarText : C.sidebarTextMuted,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: site.is_active ? C.success : 'rgba(255,255,255,0.18)',
                  boxShadow: site.is_active ? `0 0 5px ${C.success}55` : 'none',
                  transition: 'background-color 150ms ease-out',
                }}/>
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {site.name}
                  </div>
                  {site.location && (
                    <div style={{ fontSize: 10.5, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', color: active ? 'rgba(255,255,255,0.5)' : C.sidebarTextMuted }}>
                      {site.location}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ) : (
            <button
              key={site.id}
              title={`${site.name}${site.location ? ` — ${site.location}` : ''}`}
              onClick={() => handleSelect(key, site.name)}
              className="icon-rail"
              data-active={active}
              style={{
                ...iconBtn,
                color: active ? '#fff' : site.is_active ? C.sidebarText : C.sidebarTextMuted,
                fontSize: 10.5, fontWeight: 700,
              }}
            >
              {abbrev(site.name)}
              {site.is_active && (
                <span style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 5, height: 5, borderRadius: '50%', background: C.success,
                }}/>
              )}
            </button>
          )
        })}
      </div>

      {/* User footer */}
      <div style={{
        height: 60, flexShrink: 0,
        borderTop: `1px solid ${C.sidebarBorder}`,
        display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 10,
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#1D4ED8,#0EA5E9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700,
        }}>
          {userInitial}
        </div>
        {wide && (
          <div style={{ fontSize: 11, color: C.sidebarTextMuted, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedKey === null ? 'Select a site to begin'
              : selectedKey === 'all' ? 'Viewing all sites'
              : 'Site selected'}
          </div>
        )}
      </div>
    </aside>
  )
}

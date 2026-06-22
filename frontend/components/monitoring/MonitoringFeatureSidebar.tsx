'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { NAV_GROUPS } from './monitoringNav'
import {
  IconOverview, IconFactory, IconTrends, IconReports,
  IconComparison, IconKPI, IconAI, IconAdmin, IconLogout,
} from './monitoringIcons'
import { C } from './monitoringColors'

interface Props {
  hasAdminAccess: boolean
  userName: string
  userEmail: string
  onLogout: () => void
}

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  '/monitoring':                 IconFactory,
  '/monitoring/factory':         IconFactory,
  '/monitoring/trends':          IconTrends,
  '/monitoring/reports':         IconReports,
  '/monitoring/reports/builder': IconReports,
  '/monitoring/reports/kpis':    IconKPI,
  '/monitoring/comparison':      IconComparison,
  '/monitoring/kpi':             IconKPI,
  '/monitoring/ai':              IconAI,
}

export default function MonitoringFeatureSidebar({ hasAdminAccess, userName, userEmail, onLogout }: Props) {
  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()

  function isActive(href: string) {
    return href === '/monitoring' ? pathname === '/monitoring' : pathname.startsWith(href)
  }

  const navItem: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 10px', borderRadius: C.radius.sm, marginBottom: 3,
    textDecoration: 'none', fontSize: 12.5, fontWeight: 500,
    transition: 'background-color 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out',
    whiteSpace: 'nowrap', overflow: 'hidden',
  }
  const iconItem: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 44, height: 44,
    marginTop: 0, marginLeft: 'auto', marginRight: 'auto', marginBottom: 2,
    borderRadius: C.radius.sm, textDecoration: 'none',
    transition: 'background-color 150ms ease-out',
  }

  const displayName = userName || userEmail
  const initial = (displayName || '?')[0]?.toUpperCase() ?? '?'

  return (
    <aside style={{
      // h-screen: constrains the sidebar to exactly the viewport height so the
      // flex column (header / scrolling-nav / pinned-user-panel) works correctly.
      // Without this the sidebar grows with content and the user panel drifts down.
      width: expanded ? 220 : 72,
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      background: C.sidebarBg,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      borderLeft: `1px solid ${C.sidebarBorder}`,
      borderRight: `1px solid ${C.sidebarBorder}`,
    }}>

      {/* ── 1. Brand / header — fixed, never scrolls ── */}
      <div style={{
        height: 64,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: `1px solid ${C.sidebarBorder}`,
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        {expanded && (
          <div>
            <div style={{ color: C.sky, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em' }}>MONITORING PORTAL</div>
            <div style={{ color: C.sidebarTextMuted, fontSize: 9.5, marginTop: 2 }}>Feature Navigation</div>
          </div>
        )}
        <button
          onClick={() => setExpanded(e => !e)}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.sidebarBorder}`,
            borderRadius: C.radius.sm,
            width: 28, height: 28, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: C.sidebarTextDim, fontSize: 13,
            marginLeft: expanded ? 0 : 'auto',
            transition: 'background-color 150ms ease-out',
          }}
        >
          {expanded ? '‹' : '›'}
        </button>
      </div>

      {/* ── 2. Nav — flex-1 + overflow-y-auto: only this section scrolls ── */}
      <nav
        className="dark-scroll"
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 6px' }}
      >
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: expanded ? 18 : 8 }}>
            {expanded && (
              <div style={{
                fontSize: 8.5, fontWeight: 700, letterSpacing: '0.10em',
                color: C.sidebarTextMuted, textTransform: 'uppercase',
                padding: '0 8px', marginBottom: 5,
              }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const active    = isActive(item.href)
              const dimmed    = item.disabled ?? false
              const Icon      = ICON_MAP[item.href] ?? IconOverview
              const iconColor = active ? '#fff' : dimmed ? C.sidebarTextMuted : C.sidebarTextDim

              if (expanded) {
                return (
                  <Link
                    key={item.href}
                    href={dimmed ? '#' : item.href}
                    onClick={dimmed ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      ...navItem,
                      background: active
                        ? 'linear-gradient(90deg,rgba(14,165,233,0.22),rgba(14,165,233,0.08))'
                        : 'transparent',
                      color: active ? '#fff' : dimmed ? C.sidebarTextMuted : C.sidebarText,
                      cursor: dimmed ? 'default' : 'pointer',
                      border: `1px solid ${active ? 'rgba(14,165,233,0.32)' : 'transparent'}`,
                      boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    <Icon size={15} color={iconColor} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {dimmed && (
                      <span style={{
                        fontSize: 8.5, fontWeight: 700,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: C.radius.xs, padding: '2px 5px',
                        color: C.sidebarTextMuted,
                      }}>SOON</span>
                    )}
                  </Link>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={dimmed ? '#' : item.href}
                  onClick={dimmed ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                  aria-current={active ? 'page' : undefined}
                  title={item.label + (dimmed ? ' (Coming Soon)' : '')}
                  style={{
                    ...iconItem,
                    background: active ? C.sidebarActiveBg : 'transparent',
                    border: `1px solid ${active ? 'rgba(255,255,255,0.16)' : 'transparent'}`,
                    boxShadow: active ? '0 0 0 3px rgba(14,165,233,0.10)' : 'none',
                    cursor: dimmed ? 'default' : 'pointer',
                  }}
                >
                  <Icon size={17} color={iconColor} />
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── 3. User panel — flexShrink-0: always pinned at the bottom ── */}
      <div style={{
        flexShrink: 0,
        borderTop: `1px solid ${C.sidebarBorder}`,
        padding: '9px 7px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        {expanded ? (
          <>
            {/* Avatar + name + role */}
            <div style={{
              padding: '9px 10px', marginBottom: 5,
              background: 'linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))',
              borderRadius: C.radius.sm,
              border: `1px solid ${C.sidebarBorder}`,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: hasAdminAccess ? 8 : 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1D4ED8,#0EA5E9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{initial}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName || '...'}
                  </div>
                  <div style={{ fontSize: 10, color: C.sidebarTextMuted, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hasAdminAccess ? 'Administrator' : 'Operator'}
                  </div>
                </div>
              </div>

              {/* Admin Console — only when user has admin access, opens in new tab */}
              {hasAdminAccess && (
                <a
                  href="/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 8px', borderRadius: C.radius.xs,
                    background: 'rgba(14,165,233,0.10)',
                    border: '1px solid rgba(14,165,233,0.20)',
                    textDecoration: 'none', color: C.sky,
                    fontSize: 11.5, fontWeight: 600,
                    minHeight: 30,
                  }}
                >
                  <IconAdmin size={12} color={C.sky} />
                  <span style={{ flex: 1 }}>Admin Console</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={onLogout}
              style={{ ...navItem, background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: C.sidebarTextDim }}
            >
              <IconLogout size={14} color={C.sidebarTextDim} /><span>Sign out</span>
            </button>
          </>
        ) : (
          <>
            {/* Collapsed: avatar */}
            <div title={displayName} style={{ ...iconItem, marginBottom: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,#1D4ED8,#0EA5E9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 700,
              }}>{initial}</div>
            </div>

            {/* Collapsed: Admin Console icon — only when user has admin access */}
            {hasAdminAccess && (
              <a
                href="/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                title="Admin Console"
                style={{ ...iconItem, marginBottom: 4 }}
              >
                <IconAdmin size={17} color={C.sidebarTextMuted} />
              </a>
            )}

            {/* Collapsed: sign out */}
            <button
              onClick={onLogout}
              title="Sign out"
              style={{ ...iconItem, background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
            >
              <IconLogout size={17} color={C.sidebarTextMuted} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

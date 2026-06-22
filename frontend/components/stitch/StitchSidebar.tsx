'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { STITCH_NAV_GROUPS } from './stitchNav'
import { SC } from './stitchDesignTokens'

interface Props { isSuperuser: boolean; onLogout: () => void }

export default function StitchSidebar({ isSuperuser, onLogout }: Props) {
  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()

  function active(href: string) {
    return href === '/stitch' ? pathname === '/stitch' : pathname.startsWith(href)
  }

  const linkBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '7px 10px', borderRadius: SC.radius.sm,
    textDecoration: 'none', fontSize: 12.5, fontWeight: 500,
    whiteSpace: 'nowrap', overflow: 'hidden',
    transition: 'background-color 150ms',
    marginBottom: 2,
  }

  return (
    <aside style={{
      width: expanded ? 220 : 56, flexShrink: 0,
      background: SC.sidebarBg, display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease', overflow: 'hidden',
    }}>
      <div style={{
        height: 60, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 12px',
        borderBottom: `1px solid ${SC.sidebarBorder}`,
      }}>
        {expanded && (
          <div>
            <div style={{ color: SC.blue, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em' }}>STITCH PREVIEW</div>
            <div style={{ color: SC.sidebarTextMuted, fontSize: 9.5, marginTop: 2 }}>IIS Design Portal</div>
          </div>
        )}
        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${SC.sidebarBorder}`,
          borderRadius: SC.radius.sm, width: 28, height: 28, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: SC.sidebarTextDim, fontSize: 13,
          marginLeft: expanded ? 0 : 'auto',
        }}>
          {expanded ? '‹' : '›'}
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 6px' }}>
        {STITCH_NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: expanded ? 18 : 8 }}>
            {expanded && (
              <div style={{
                fontSize: 8.5, fontWeight: 700, letterSpacing: '0.10em',
                color: SC.sidebarTextMuted, textTransform: 'uppercase',
                padding: '0 8px', marginBottom: 5,
              }}>{group.label}</div>
            )}
            {group.items.map(item => {
              const isActive = active(item.href)
              return (
                <Link key={item.href} href={item.href}
                  title={expanded ? undefined : item.label}
                  style={{
                    ...linkBase,
                    background: isActive ? SC.sidebarActiveBg : 'transparent',
                    color: isActive ? '#fff' : SC.sidebarText,
                    borderLeft: expanded ? `2px solid ${isActive ? SC.blue : 'transparent'}` : 'none',
                    paddingLeft: expanded ? 8 : 0,
                    justifyContent: expanded ? 'flex-start' : 'center',
                  }}
                >
                  {expanded
                    ? <span style={{ flex: 1 }}>{item.label}</span>
                    : <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? '#fff' : SC.sidebarTextDim }}>
                        {item.label.slice(0, 3).toUpperCase()}
                      </span>
                  }
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ flexShrink: 0, borderTop: `1px solid ${SC.sidebarBorder}`, padding: '10px 6px' }}>
        {isSuperuser && expanded && (
          <Link href="/monitoring" style={{ ...linkBase, display: 'flex', marginBottom: 4, color: SC.sidebarTextDim, background: 'transparent' }}>
            ← Monitoring Portal
          </Link>
        )}
        <button onClick={onLogout} style={{
          ...(linkBase as React.CSSProperties),
          background: 'none', border: 'none', cursor: 'pointer',
          width: '100%', color: SC.sidebarTextDim,
          justifyContent: expanded ? 'flex-start' : 'center',
        }}>
          {expanded ? 'Sign out' : '×'}
        </button>
      </div>
    </aside>
  )
}

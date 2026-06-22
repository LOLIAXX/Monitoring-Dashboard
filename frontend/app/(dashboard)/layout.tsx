'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getToken, removeToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { C } from '@/components/monitoring/monitoringColors'

interface UserInfo {
  id: number
  email: string
  full_name?: string | null
  is_superuser: boolean
  permissions: string[]
}

const NAV = [
  { label: 'Overview',    href: '/dashboard'   },
  { label: 'Users',       href: '/users'       },
  { label: 'Roles',       href: '/roles'       },
  { label: 'Permissions', href: '/permissions' },
  { label: 'Factories',   href: '/factories'   },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser]     = useState<UserInfo | null>(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    apiFetch<UserInfo>('/auth/me', {}, token)
      .then(u => {
        const hasAccess = u.is_superuser || u.permissions?.includes('admin.access')
        if (!hasAccess) { setDenied(true); return }
        setUser(u)
      })
      .catch(() => { removeToken(); router.push('/login') })
  }, [router])

  function logout() { removeToken(); router.push('/login') }

  if (denied) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        background: C.pageBgPremium,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 380, padding: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Access Denied</h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
            You do not have permission to access the Admin Console. Contact your administrator.
          </p>
          <button onClick={() => router.push('/monitoring')} style={{
            background: C.gradBrand, color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Go to Monitoring
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <aside style={{ width: 224, flexShrink: 0, background: C.gradShell, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 11, padding: '0 20px', borderBottom: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: C.gradBrand, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Sonergy</div>
            <div style={{ color: C.sky, fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', marginTop: 1 }}>ADMIN CONSOLE</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', color: C.sidebarTextMuted, textTransform: 'uppercase', padding: '0 10px 8px' }}>
            Management
          </div>
          {NAV.map(({ label, href }) => (
            <Link key={href} href={href} className="nav-link" data-active={pathname === href} style={{
              display: 'flex', alignItems: 'center', padding: '9px 13px',
              borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
            }}>
              {label}
            </Link>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.sidebarBorder}` }}>
            <Link href="/monitoring" className="hover-lift" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 13px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', color: C.sky,
              background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)',
            }}>
              Monitoring Portal <span style={{ fontSize: 15 }}>→</span>
            </Link>
          </div>
        </nav>

        <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.gradBrand, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
              {((user?.full_name ?? user?.email) || '?')[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, color: '#fff', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name || user?.email || '…'}
              </p>
              <p style={{ margin: 0, color: C.sidebarTextMuted, fontSize: 10.5 }}>Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="hover-lift" style={{
            width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${C.sidebarBorder}`, cursor: 'pointer',
            color: C.sidebarTextDim, fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 9,
          }}>
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #E6EBF2', display: 'flex', alignItems: 'center', gap: 10, padding: '0 32px' }}>
          <span style={{ fontSize: 11.5, color: C.textFaint, fontWeight: 600 }}>Admin</span>
          <span style={{ color: '#CBD5E1', fontSize: 15 }}>/</span>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.textDark, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
            {pathname.split('/').filter(Boolean).pop() ?? 'Dashboard'}
          </h1>
        </header>
        <main className="sonergy-page" style={{ flex: 1, overflow: 'auto', padding: 32, background: C.pageBgPremium }}>
          {children}
        </main>
      </div>
    </div>
  )
}

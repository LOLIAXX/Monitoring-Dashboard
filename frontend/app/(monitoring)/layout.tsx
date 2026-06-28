'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthGuard } from '@/lib/useAuthGuard'
import SiteFactorySelector from '@/components/monitoring/SiteFactorySelector'
import MonitoringFeatureSidebar from '@/components/monitoring/MonitoringFeatureSidebar'
import { NAV_GROUPS } from '@/components/monitoring/monitoringNav'
import { C } from '@/components/monitoring/monitoringColors'

interface UserInfo {
  id: number
  email: string
  full_name?: string | null
  is_superuser: boolean
  permissions: string[]
}

const LS_KEY      = 'em_monitoring_site'
const LS_KEY_NAME = 'em_monitoring_site_name'

function readLS(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

function resolvePageLabel(pathname: string): string {
  if (pathname === '/monitoring') return 'Factory Overview'
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href !== '/monitoring' && pathname.startsWith(item.href)) return item.label
    }
  }
  return 'Monitoring'
}

export default function MonitoringLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const { user, logout } = useAuthGuard(false)
  const [selectedKey, setSelectedKey]   = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string>('')

  useEffect(() => {
    const storedKey = readLS(LS_KEY)
    if (storedKey !== null) { setSelectedKey(storedKey); setSelectedName(readLS(LS_KEY_NAME) ?? '') }
  }, [])

  function handleSiteSelect(key: string, name: string) {
    setSelectedKey(key); setSelectedName(name)
    localStorage.setItem(LS_KEY, key); localStorage.setItem(LS_KEY_NAME, name)
  }

  const featureVisible = selectedKey !== null
  const pageLabel      = resolvePageLabel(pathname)
  const hasAdminAccess = (user?.permissions?.includes('admin.access') ?? false) || (user?.is_superuser ?? false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif", position: 'relative' }}>
      <SiteFactorySelector selectedKey={selectedKey} onSelect={handleSiteSelect} userInitial={user?.email?.[0]?.toUpperCase() ?? '?'} />

      {featureVisible && (
        <MonitoringFeatureSidebar
          hasAdminAccess={hasAdminAccess}
          userName={user?.full_name ?? user?.email ?? ''}
          userEmail={user?.email ?? ''}
          onLogout={logout}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ height: 64, background: C.headerBg, borderBottom: `1px solid ${C.headerBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: C.sidebarTextMuted, fontWeight: 500, letterSpacing: '0.02em' }}>Sonergy Monitoring</span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>/</span>
            <h1 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>{pageLabel}</h1>
            {featureVisible && selectedName && selectedName !== 'All Sites' && (
              <><span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>/</span><span style={{ fontSize: 13, color: C.sidebarTextDim }}>{selectedName}</span></>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.success, display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }}/>
              <span style={{ fontSize: 11, color: C.success, fontWeight: 700, letterSpacing: '0.07em' }}>LIVE</span>
            </div>
            {featureVisible && (
              <span style={{ background: selectedKey === 'all' ? 'rgba(255,255,255,0.07)' : C.skyDim, color: selectedKey === 'all' ? C.sidebarTextDim : C.sky, borderRadius: C.radius.pill, padding: '3px 12px', fontSize: 11.5, fontWeight: 600, border: `1px solid ${selectedKey === 'all' ? C.sidebarBorder : 'rgba(14,165,233,0.28)'}` }}>
                {selectedKey === 'all' ? 'All Sites' : selectedName}
              </span>
            )}
          </div>
        </header>
        <main className="sonergy-page" style={{ flex: 1, overflow: 'auto', padding: 24, background: C.pageBgPremium }}>
          {featureVisible ? children : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 320 }}>
              <div className="surface-premium" style={{ textAlign: 'center', maxWidth: 400, borderRadius: C.radius.xl, padding: '34px 32px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px', background: 'linear-gradient(135deg,#1D4ED8,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(14,165,233,0.25)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: C.textDark, marginBottom: 8 }}>Select a Site or Factory</h2>
                <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.65 }}>Choose a production site from the left panel to start monitoring.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

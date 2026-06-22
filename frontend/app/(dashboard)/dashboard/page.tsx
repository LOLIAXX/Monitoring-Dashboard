'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { C } from '@/components/monitoring/monitoringColors'

interface Stats { users: number; roles: number; permissions: number; factories: number }

function StatCard({ label, value, accent, grad, icon }: {
  label: string; value: number; accent: string; grad: string; icon: React.ReactNode
}) {
  return (
    <div className="kpi-premium card-interactive" style={{ borderRadius: 18, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 6px 16px ${accent}33` }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 11.5, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p className="tnum" style={{ margin: '3px 0 0', fontSize: 30, fontWeight: 800, color: C.textDark, letterSpacing: '-0.02em' }}>{value}</p>
      </div>
    </div>
  )
}

const SVG = {
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  roles: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  permissions: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  factories: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 7v14"/><path d="M21 7v14"/><path d="M3 7l9-4 9 4"/><path d="M9 21V9h6v12"/></svg>,
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, roles: 0, permissions: 0, factories: 0 })
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'
    fetch(`${base}/health`).then(r => setApiOk(r.ok)).catch(() => setApiOk(false))
    const token = getToken()
    if (!token) return
    Promise.allSettled([
      apiFetch<unknown[]>('/users/', {}, token),
      apiFetch<unknown[]>('/roles/', {}, token),
      apiFetch<unknown[]>('/permissions/', {}, token),
      apiFetch<unknown[]>('/factories/', {}, token),
    ]).then(([u, r, p, f]) => setStats({
      users:       u.status === 'fulfilled' ? u.value.length : 0,
      roles:       r.status === 'fulfilled' ? r.value.length : 0,
      permissions: p.status === 'fulfilled' ? p.value.length : 0,
      factories:   f.status === 'fulfilled' ? f.value.length : 0,
    }))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.textDark, letterSpacing: '-0.02em' }}>Overview</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: C.textMuted }}>Access management summary</p>
      </div>
      <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Users"       value={stats.users}       accent={C.blue}    grad={C.gradBlue}    icon={SVG.users} />
        <StatCard label="Roles"       value={stats.roles}       accent={C.emerald} grad={C.gradEmerald} icon={SVG.roles} />
        <StatCard label="Permissions" value={stats.permissions} accent={C.indigo}  grad={C.gradViolet}  icon={SVG.permissions} />
        <StatCard label="Factories"   value={stats.factories}   accent={C.sky}     grad={C.gradSky}     icon={SVG.factories} />
      </div>
      <div className="surface-premium" style={{ borderRadius: 18, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
          <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: apiOk === true ? C.success : apiOk === false ? C.danger : C.textFaint }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.textDark }}>
            Backend {apiOk === true ? 'Connected' : apiOk === false ? 'Unreachable' : 'Checking...'}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: C.textMuted }}>
          API endpoint: {process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}
        </p>
      </div>
    </div>
  )
}

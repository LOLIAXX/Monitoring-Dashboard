'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import Modal from '@/components/Modal'

type FactoryRow = { id: number; code: string; name: string; city: string | null; is_active: boolean }
type AccessRow  = { user_id: number; factory_id: number; access_level: string; is_default: boolean }
type UserRow    = { id: number; email: string; full_name: string | null }

export default function FactoriesPage() {
  const [factories, setFactories]         = useState<FactoryRow[]>([])
  const [users, setUsers]                 = useState<UserRow[]>([])
  const [loading, setLoading]             = useState(true)
  const [selected, setSelected]           = useState<FactoryRow | null>(null)
  const [access, setAccess]               = useState<AccessRow[]>([])
  const [accessLoading, setAccessLoading] = useState(false)
  const [accessError, setAccessError]     = useState<string | null>(null)
  const [newUserId, setNewUserId]         = useState('')
  const [newLevel, setNewLevel]           = useState('viewer')
  const [assigning, setAssigning]         = useState(false)
  const [assignError, setAssignError]     = useState<string | null>(null)
  const [removingId, setRemovingId]       = useState<number | null>(null)
  const [defaulting, setDefaulting]       = useState<number | null>(null)

  useEffect(() => {
    const token = getToken()
    Promise.allSettled([
      apiFetch<FactoryRow[]>('/factories/', {}, token),
      apiFetch<UserRow[]>('/users/', {}, token),
    ]).then(([f, u]) => {
      if (f.status === 'fulfilled') setFactories(f.value)
      if (u.status === 'fulfilled') setUsers(u.value)
      setLoading(false)
    })
  }, [])

  function openFactory(factory: FactoryRow) {
    setSelected(factory); setAccessError(null); setAssignError(null); setNewUserId(''); setNewLevel('viewer')
    setAccessLoading(true)
    apiFetch<AccessRow[]>(`/factories/${factory.id}/access`, {}, getToken())
      .then(d => { setAccess(Array.isArray(d) ? d : []); setAccessLoading(false) })
      .catch(e => { setAccessError(e instanceof Error ? e.message : String(e)); setAccessLoading(false) })
  }

  async function handleAssign() {
    if (!selected || !newUserId) return
    setAssigning(true); setAssignError(null)
    try {
      await apiFetch(`/factories/${selected.id}/access`, { method: 'POST', body: JSON.stringify({ user_id: Number(newUserId), access_level: newLevel, is_default: false }) }, getToken())
      const updated = await apiFetch<AccessRow[]>(`/factories/${selected.id}/access`, {}, getToken())
      setAccess(Array.isArray(updated) ? updated : []); setNewUserId('')
    } catch (e) { setAssignError(e instanceof Error ? e.message : String(e)) }
    finally { setAssigning(false) }
  }

  async function handleRemove(userId: number) {
    if (!selected) return
    setRemovingId(userId)
    try {
      await apiFetch(`/factories/${selected.id}/access/${userId}`, { method: 'DELETE' }, getToken())
      setAccess(prev => prev.filter(a => a.user_id !== userId))
    } catch { /* ignore */ }
    finally { setRemovingId(null) }
  }

  async function handleSetDefault(userId: number) {
    if (!selected) return
    const existing = access.find(a => a.user_id === userId)
    if (!existing) return
    setDefaulting(userId)
    try {
      await apiFetch(`/factories/${selected.id}/access`, { method: 'POST', body: JSON.stringify({ user_id: userId, access_level: existing.access_level, is_default: true }) }, getToken())
      setAccess(prev => prev.map(a => ({ ...a, is_default: a.user_id === userId })))
    } catch { /* ignore */ }
    finally { setDefaulting(null) }
  }

  function uName(id: number) { const u = users.find(u => u.id === id); return u ? (u.full_name || u.email) : `User #${id}` }
  function uEmail(id: number) { return users.find(u => u.id === id)?.email ?? '' }

  const unassigned = users.filter(u => !access.find(a => a.user_id === u.id))

  if (loading) return <div style={{ color: '#64748B', padding: 40, textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Factories</h2>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748B' }}>Manage factory access -- assign users and set defaults</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {factories.map(factory => (
          <div key={factory.id} className="table-card-premium" style={{ borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{factory.name}</span>
                <span style={{ background: factory.is_active ? '#D1FAE5' : '#FEE2E2', color: factory.is_active ? '#065F46' : '#991B1B', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{factory.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                <code style={{ fontFamily: 'monospace', background: '#F1F5F9', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>{factory.code}</code>
                {factory.city && <span style={{ marginLeft: 8 }}>{factory.city}</span>}
              </div>
            </div>
            <button onClick={() => openFactory(factory)} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Manage Access</button>
          </div>
        ))}
        {factories.length === 0 && <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 14, padding: 40 }}>No factories found.</div>}
      </div>

      {selected && (
        <Modal title={`Access -- ${selected.name}`} onClose={() => setSelected(null)} width={580}
          footer={<button onClick={() => setSelected(null)} style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Close</button>}
        >
          <div style={{ marginBottom: 16, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Assign User</p>
            {assignError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '7px 10px', fontSize: 12, marginBottom: 10 }}>{assignError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={newUserId} onChange={e => setNewUserId(e.target.value)} style={{ flex: 1, padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, background: '#fff' }}>
                <option value="">Select user...</option>
                {unassigned.map(u => <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} (${u.email})` : u.email}</option>)}
              </select>
              <select value={newLevel} onChange={e => setNewLevel(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, background: '#fff' }}>
                <option value="viewer">Viewer</option>
                <option value="operator">Operator</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleAssign} disabled={assigning || !newUserId} style={{ background: !newUserId ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: !newUserId ? 'default' : 'pointer' }}>
                {assigning ? '...' : 'Assign'}
              </button>
            </div>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Current Access ({access.length})</p>
          {accessError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 10 }}>{accessError}</div>}
          {accessLoading ? <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Loading...</p>
            : access.length === 0
              ? <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No users assigned yet.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {access.map(row => (
                    <div key={row.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#1D4ED8,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {(uName(row.user_id) || '?')[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{uName(row.user_id)}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{uEmail(row.user_id)}</div>
                      </div>
                      <span style={{ background: '#EFF6FF', color: '#1D4ED8', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{row.access_level}</span>
                      <button onClick={() => handleSetDefault(row.user_id)} disabled={defaulting !== null || row.is_default}
                        style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, border: '1px solid', cursor: row.is_default ? 'default' : 'pointer', background: row.is_default ? '#D1FAE5' : 'none', color: row.is_default ? '#065F46' : '#64748B', borderColor: row.is_default ? '#A7F3D0' : '#E2E8F0', whiteSpace: 'nowrap' }}>
                        {defaulting === row.user_id ? '...' : row.is_default ? 'Default' : 'Set Default'}
                      </button>
                      <button onClick={() => handleRemove(row.user_id)} disabled={removingId !== null}
                        style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#DC2626' }}>
                        {removingId === row.user_id ? '...' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>}
        </Modal>
      )}
    </div>
  )
}

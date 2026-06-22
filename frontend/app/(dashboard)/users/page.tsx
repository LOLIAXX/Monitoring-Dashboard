'use client'

import { useState } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import ListPage, { Badge, fmtDate, type Column } from '@/components/ListPage'
import Modal from '@/components/Modal'
import { INPUT, LABEL, FIELD } from '@/components/formStyles'

type UserRow = { id: number; email: string; full_name: string | null; is_active: boolean; is_superuser: boolean; created_at: string }
type RoleRow = { id: number; name: string; is_system: boolean }
type FactoryAccess = { factory_id: number; access_level: string; is_default: boolean }
type FactoryRow = { id: number; code: string; name: string }
type FormState = { email: string; full_name: string; password: string; is_active: boolean; is_superuser: boolean }
const EMPTY: FormState = { email: '', full_name: '', password: '', is_active: true, is_superuser: false }

function RoleBadge({ name }: { name: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Super Admin':       { bg: '#FEF3C7', color: '#92400E' },
    'admin':             { bg: '#DBEAFE', color: '#1E40AF' },
    'CEO':               { bg: '#F3E8FF', color: '#6B21A8' },
    'Energy Manager':    { bg: '#D1FAE5', color: '#065F46' },
    'Technical Manager': { bg: '#CFFAFE', color: '#155E75' },
    'Operator':          { bg: '#FEE2E2', color: '#991B1B' },
  }
  const c = map[name] ?? { bg: '#F1F5F9', color: '#475569' }
  return <span style={{ background: c.bg, color: c.color, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{name}</span>
}

export default function UsersPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [modal, setModal]           = useState<null | 'create' | 'edit'>(null)
  const [editTarget, setEditTarget] = useState<UserRow | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<UserRow | null>(null)
  const [form, setForm]             = useState<FormState>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [allRoles, setAllRoles]     = useState<RoleRow[]>([])
  const [userRoles, setUserRoles]   = useState<Set<number>>(new Set())
  const [rolesSaving, setRolesSaving] = useState<number | null>(null)
  const [rolesError, setRolesError] = useState<string | null>(null)
  const [rolesDirty, setRolesDirty] = useState(false)

  const [allFactories, setAllFactories] = useState<FactoryRow[]>([])
  const [userFactories, setUserFactories] = useState<FactoryAccess[]>([])
  const [factorySaving, setFactorySaving] = useState<number | null>(null)
  const [factoryError, setFactoryError] = useState<string | null>(null)

  function openCreate() { setForm(EMPTY); setFormError(null); setModal('create') }

  function openEdit(row: UserRow) {
    setEditTarget(row)
    setForm({ email: row.email, full_name: row.full_name ?? '', password: '', is_active: row.is_active, is_superuser: row.is_superuser })
    setFormError(null); setRolesError(null); setFactoryError(null); setRolesDirty(false)
    setModal('edit')
    const token = getToken()
    apiFetch<RoleRow[]>('/roles/', {}, token).then(d => setAllRoles(Array.isArray(d) ? d : []))
    apiFetch<{ id: number }[]>(`/users/${row.id}/roles`, {}, token)
      .then(d => setUserRoles(new Set(Array.isArray(d) ? d.map(r => r.id) : [])))
      .catch(() => setUserRoles(new Set()))
    apiFetch<FactoryRow[]>('/factories/', {}, token).then(d => setAllFactories(Array.isArray(d) ? d : []))
    apiFetch<FactoryAccess[]>(`/users/${row.id}/factories`, {}, token)
      .then(d => setUserFactories(Array.isArray(d) ? d : []))
      .catch(() => setUserFactories([]))
  }

  function closeModal() {
    if (rolesDirty) setRefreshKey(k => k + 1)
    setModal(null); setEditTarget(null); setFormError(null); setRolesError(null); setFactoryError(null)
    setRolesDirty(false); setUserRoles(new Set()); setUserFactories([])
  }

  async function handleSave() {
    setSaving(true); setFormError(null)
    const token = getToken()
    try {
      if (modal === 'create') {
        await apiFetch('/users/', { method: 'POST', body: JSON.stringify({ email: form.email, full_name: form.full_name || null, password: form.password, is_active: form.is_active, is_superuser: form.is_superuser }) }, token)
      } else if (editTarget) {
        const body: Record<string, unknown> = { email: form.email, full_name: form.full_name || null, is_active: form.is_active, is_superuser: form.is_superuser }
        if (form.password) body.password = form.password
        await apiFetch(`/users/${editTarget.id}`, { method: 'PUT', body: JSON.stringify(body) }, token)
      }
      setRefreshKey(k => k + 1); closeModal()
    } catch (e) { setFormError(e instanceof Error ? e.message : String(e)) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirmTarget) return
    setDeleting(true); setDeleteError(null)
    try {
      await apiFetch(`/users/${confirmTarget.id}`, { method: 'DELETE' }, getToken())
      setRefreshKey(k => k + 1); setConfirmTarget(null)
    } catch (e) { setDeleteError(e instanceof Error ? e.message : String(e)) }
    finally { setDeleting(false) }
  }

  async function toggleActive(row: UserRow) {
    try {
      await apiFetch(`/users/${row.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !row.is_active }) }, getToken())
      setRefreshKey(k => k + 1)
    } catch { /* ignore */ }
  }

  async function toggleRole(role: RoleRow) {
    if (!editTarget || rolesSaving !== null) return
    setRolesSaving(role.id); setRolesError(null)
    const token = getToken()
    const assigned = userRoles.has(role.id)
    try {
      if (assigned) {
        await apiFetch(`/users/${editTarget.id}/roles/${role.id}`, { method: 'DELETE' }, token)
        setUserRoles(prev => { const s = new Set(prev); s.delete(role.id); return s })
      } else {
        await apiFetch(`/users/${editTarget.id}/roles`, { method: 'POST', body: JSON.stringify({ role_id: role.id }) }, token)
        setUserRoles(prev => new Set([...prev, role.id]))
      }
      setRolesDirty(true)
    } catch (e) { setRolesError(e instanceof Error ? e.message : String(e)) }
    finally { setRolesSaving(null) }
  }

  async function toggleFactory(factory: FactoryRow) {
    if (!editTarget || factorySaving !== null) return
    setFactorySaving(factory.id); setFactoryError(null)
    const token = getToken()
    const existing = userFactories.find(f => f.factory_id === factory.id)
    try {
      if (existing) {
        await apiFetch(`/factories/${factory.id}/access/${editTarget.id}`, { method: 'DELETE' }, token)
        setUserFactories(prev => prev.filter(f => f.factory_id !== factory.id))
      } else {
        await apiFetch(`/factories/${factory.id}/access`, { method: 'POST', body: JSON.stringify({ user_id: editTarget.id, access_level: 'viewer', is_default: userFactories.length === 0 }) }, token)
        setUserFactories(prev => [...prev, { factory_id: factory.id, access_level: 'viewer', is_default: prev.length === 0 }])
      }
    } catch (e) { setFactoryError(e instanceof Error ? e.message : String(e)) }
    finally { setFactorySaving(null) }
  }

  async function setDefaultFactory(factory: FactoryRow) {
    if (!editTarget || factorySaving !== null) return
    const existing = userFactories.find(f => f.factory_id === factory.id)
    if (!existing) return
    setFactorySaving(factory.id); setFactoryError(null)
    try {
      await apiFetch(`/factories/${factory.id}/access`, { method: 'POST', body: JSON.stringify({ user_id: editTarget.id, access_level: existing.access_level, is_default: true }) }, getToken())
      setUserFactories(prev => prev.map(f => ({ ...f, is_default: f.factory_id === factory.id })))
    } catch (e) { setFactoryError(e instanceof Error ? e.message : String(e)) }
    finally { setFactorySaving(null) }
  }

  const COLS: Column[] = [
    { header: 'Email',     render: r => (r as unknown as UserRow).email },
    { header: 'Full Name', render: r => (r as unknown as UserRow).full_name ?? <span style={{ color: '#94A3B8' }}>--</span> },
    { header: 'Active',    render: r => <Badge ok={(r as unknown as UserRow).is_active} />,    width: '70px' },
    { header: 'Superuser', render: r => <Badge ok={(r as unknown as UserRow).is_superuser} />, width: '90px' },
    { header: 'Created',   render: r => fmtDate((r as unknown as UserRow).created_at),         width: '130px' },
  ]

  const SEC = { borderTop: '1px solid #E2E8F0', marginTop: 16, paddingTop: 16 } as const
  const SH  = { margin: '0 0 10px' as const, fontSize: 13, fontWeight: 600, color: '#374151' }
  const ERR = { background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 10 }

  return (
    <>
      <ListPage title="Users" endpoint="/users/" columns={COLS} refreshKey={refreshKey}
        headerAction={<button onClick={openCreate} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add User</button>}
        actions={row => {
          const u = row as unknown as UserRow
          return (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => toggleActive(u)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: u.is_active ? '#065F46' : '#6B7280' }}>
                {u.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => openEdit(u)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: '#374151' }}>Edit</button>
              <button onClick={() => setConfirmTarget(u)} style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: '#DC2626' }}>Delete</button>
            </div>
          )
        }}
      />

      {modal && (
        <Modal title={modal === 'create' ? 'Add User' : `Edit: ${editTarget?.email}`} onClose={closeModal} width={560}
          footer={<>
            <button onClick={closeModal} style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
          </>}
        >
          {formError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
          <div style={FIELD}><label style={LABEL}>Email *</label><input style={INPUT} type="email" value={form.email} placeholder="user@example.com" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div style={FIELD}><label style={LABEL}>Full Name</label><input style={INPUT} type="text" value={form.full_name} placeholder="Optional" onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
          <div style={FIELD}>
            <label style={LABEL}>{modal === 'create' ? 'Password *' : 'New Password'}</label>
            <input style={INPUT} type="password" value={form.password} placeholder={modal === 'edit' ? 'Leave blank to keep current' : ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={form.is_superuser} onChange={e => setForm(f => ({ ...f, is_superuser: e.target.checked }))} /> Superuser</label>
          </div>

          {modal === 'edit' && (<>
            <div style={SEC}>
              <p style={SH}>Roles</p>
              {rolesError && <div style={ERR}>{rolesError}</div>}
              {allRoles.length === 0
                ? <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Loading...</p>
                : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                    {allRoles.map(role => (
                      <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: rolesSaving !== null ? 'wait' : 'pointer' }}>
                        <input type="checkbox" checked={userRoles.has(role.id)} disabled={rolesSaving !== null} onChange={() => toggleRole(role)} />
                        <RoleBadge name={role.name} />
                        {rolesSaving === role.id && <span style={{ fontSize: 11, color: '#94A3B8' }}>...</span>}
                      </label>
                    ))}
                  </div>}
            </div>
            <div style={SEC}>
              <p style={SH}>Factory Access</p>
              {factoryError && <div style={ERR}>{factoryError}</div>}
              {allFactories.length === 0
                ? <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>No factories available.</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {allFactories.map(factory => {
                      const acc = userFactories.find(f => f.factory_id === factory.id)
                      return (
                        <div key={factory.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: acc ? '#EFF6FF' : '#F8FAFC', border: `1px solid ${acc ? '#BFDBFE' : '#E2E8F0'}` }}>
                          <input type="checkbox" checked={!!acc} disabled={factorySaving !== null} onChange={() => toggleFactory(factory)} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{factory.name}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>{factory.code}</div>
                          </div>
                          {acc && (
                            <button onClick={() => setDefaultFactory(factory)} disabled={factorySaving !== null || !!acc.is_default}
                              style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, border: '1px solid', cursor: acc.is_default ? 'default' : 'pointer', background: acc.is_default ? '#D1FAE5' : 'none', color: acc.is_default ? '#065F46' : '#64748B', borderColor: acc.is_default ? '#A7F3D0' : '#E2E8F0' }}>
                              {acc.is_default ? 'Default' : 'Set Default'}
                            </button>
                          )}
                          {factorySaving === factory.id && <span style={{ fontSize: 11, color: '#94A3B8' }}>...</span>}
                        </div>
                      )
                    })}
                  </div>}
            </div>
          </>)}
        </Modal>
      )}

      {confirmTarget && (
        <Modal title="Delete User" onClose={() => { setConfirmTarget(null); setDeleteError(null) }}
          footer={<>
            <button onClick={() => setConfirmTarget(null)} style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleDelete} disabled={deleting} style={{ background: deleting ? '#FCA5A5' : '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: deleting ? 'default' : 'pointer' }}>{deleting ? 'Deleting...' : 'Delete'}</button>
          </>}
        >
          {deleteError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{deleteError}</div>}
          <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>Delete user <strong>{confirmTarget.email}</strong>? This cannot be undone.</p>
        </Modal>
      )}
    </>
  )
}

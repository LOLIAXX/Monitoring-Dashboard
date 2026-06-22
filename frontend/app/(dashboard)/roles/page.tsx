'use client'

import { useState } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import ListPage, { Badge, fmtDate, type Column } from '@/components/ListPage'
import Modal from '@/components/Modal'
import { INPUT, LABEL, FIELD } from '@/components/formStyles'

type PermRow = { id: number; name: string; description: string | null }
type RoleRow = { id: number; name: string; description: string | null; is_system: boolean; created_at: string; permissions: PermRow[] }
type FormState = { name: string; description: string }
const EMPTY: FormState = { name: '', description: '' }

const MODULE_ORDER = ['admin','users','roles','permissions','factories','monitoring','energy','reports','companies','sites','devices','access','other']

function groupPerms(perms: PermRow[]): Record<string, PermRow[]> {
  const g: Record<string, PermRow[]> = {}
  for (const p of perms) {
    const k = p.name.includes('.') ? p.name.split('.')[0] : p.name.includes(':') ? p.name.split(':')[0] : 'other'
    ;(g[k] ??= []).push(p)
  }
  return g
}

export default function RolesPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [modal, setModal]           = useState<null | 'create' | 'edit'>(null)
  const [editTarget, setEditTarget] = useState<RoleRow | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<RoleRow | null>(null)
  const [form, setForm]             = useState<FormState>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [allPerms, setAllPerms]     = useState<PermRow[]>([])
  const [permLoading, setPermLoading] = useState(false)
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set())
  const [permSaving, setPermSaving] = useState<number | null>(null)
  const [permError, setPermError]   = useState<string | null>(null)
  const [permsDirty, setPermsDirty] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  function openCreate() { setForm(EMPTY); setFormError(null); setModal('create') }

  function openEdit(row: RoleRow) {
    setEditTarget(row); setForm({ name: row.name, description: row.description ?? '' })
    setFormError(null); setPermError(null); setPermsDirty(false)
    setAssignedIds(new Set(row.permissions.map(p => p.id)))
    setModal('edit'); setPermLoading(true)
    apiFetch<PermRow[]>('/permissions/', {}, getToken())
      .then(d => { setAllPerms(Array.isArray(d) ? d : []); setPermLoading(false) })
      .catch(() => setPermLoading(false))
  }

  function closeModal() {
    if (permsDirty) setRefreshKey(k => k + 1)
    setModal(null); setEditTarget(null); setFormError(null); setPermError(null); setPermsDirty(false)
  }

  async function handleSave() {
    setSaving(true); setFormError(null)
    const token = getToken()
    try {
      if (modal === 'create') {
        await apiFetch('/roles/', { method: 'POST', body: JSON.stringify({ name: form.name, description: form.description || null }) }, token)
      } else if (editTarget) {
        await apiFetch(`/roles/${editTarget.id}`, { method: 'PUT', body: JSON.stringify({ name: form.name, description: form.description || null }) }, token)
      }
      setRefreshKey(k => k + 1); setPermsDirty(false); closeModal()
    } catch (e) { setFormError(e instanceof Error ? e.message : String(e)) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirmTarget) return
    setDeleting(true); setDeleteError(null)
    try {
      await apiFetch(`/roles/${confirmTarget.id}`, { method: 'DELETE' }, getToken())
      setRefreshKey(k => k + 1); setConfirmTarget(null)
    } catch (e) { setDeleteError(e instanceof Error ? e.message : String(e)) }
    finally { setDeleting(false) }
  }

  async function togglePerm(perm: PermRow) {
    if (!editTarget || permSaving !== null) return
    setPermSaving(perm.id); setPermError(null)
    const token = getToken()
    const assigned = assignedIds.has(perm.id)
    try {
      if (assigned) {
        await apiFetch(`/roles/${editTarget.id}/permissions/${perm.id}`, { method: 'DELETE' }, token)
        setAssignedIds(prev => { const s = new Set(prev); s.delete(perm.id); return s })
      } else {
        await apiFetch(`/roles/${editTarget.id}/permissions`, { method: 'POST', body: JSON.stringify({ permission_id: perm.id }) }, token)
        setAssignedIds(prev => new Set([...prev, perm.id]))
      }
      setPermsDirty(true)
    } catch (e) { setPermError(e instanceof Error ? e.message : String(e)) }
    finally { setPermSaving(null) }
  }

  async function handleDuplicate(row: RoleRow) {
    setDuplicating(true)
    const token = getToken()
    try {
      const newRole = await apiFetch<{ id: number }>('/roles/', { method: 'POST', body: JSON.stringify({ name: `${row.name} (copy)`, description: row.description || null }) }, token)
      for (const perm of row.permissions) {
        await apiFetch(`/roles/${newRole.id}/permissions`, { method: 'POST', body: JSON.stringify({ permission_id: perm.id }) }, token)
      }
      setRefreshKey(k => k + 1)
    } catch { /* ignore */ }
    finally { setDuplicating(false) }
  }

  const COLS: Column[] = [
    { header: 'Name',        render: r => (r as unknown as RoleRow).name },
    { header: 'Description', render: r => (r as unknown as RoleRow).description ?? <span style={{ color: '#94A3B8' }}>--</span> },
    { header: 'System',      render: r => <Badge ok={(r as unknown as RoleRow).is_system} />, width: '70px' },
    { header: 'Perms',       render: r => (r as unknown as RoleRow).permissions?.length ?? 0,  width: '70px' },
    { header: 'Created',     render: r => fmtDate((r as unknown as RoleRow).created_at),       width: '130px' },
  ]

  const groups = groupPerms(allPerms)
  const orderedKeys = [...MODULE_ORDER.filter(k => groups[k]), ...Object.keys(groups).filter(k => !MODULE_ORDER.includes(k))]

  return (
    <>
      <ListPage title="Roles" endpoint="/roles/" columns={COLS} refreshKey={refreshKey}
        headerAction={<button onClick={openCreate} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Role</button>}
        actions={row => {
          const r = row as unknown as RoleRow
          return (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => !duplicating && handleDuplicate(r)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: '#374151' }}>Duplicate</button>
              <button onClick={() => openEdit(r)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: '#374151' }}>Edit</button>
              <button disabled={r.is_system} onClick={() => !r.is_system && setConfirmTarget(r)}
                title={r.is_system ? 'System roles cannot be deleted' : undefined}
                style={{ background: 'none', border: `1px solid ${r.is_system ? '#E2E8F0' : '#FCA5A5'}`, borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: r.is_system ? 'default' : 'pointer', color: r.is_system ? '#94A3B8' : '#DC2626' }}>Delete</button>
            </div>
          )
        }}
      />

      {modal && (
        <Modal title={modal === 'create' ? 'Add Role' : `Edit: ${editTarget?.name}`} onClose={closeModal} width={600}
          footer={<>
            <button onClick={closeModal} style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
          </>}
        >
          {formError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
          <div style={FIELD}><label style={LABEL}>Name *</label><input style={INPUT} type="text" value={form.name} placeholder="e.g. Energy Manager" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div style={FIELD}><label style={LABEL}>Description</label><input style={INPUT} type="text" value={form.description} placeholder="Optional" onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>

          {modal === 'edit' && (
            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 8, paddingTop: 16 }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Permissions</p>
              {permError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>{permError}</div>}
              {permLoading ? <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Loading...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orderedKeys.map(key => (
                    <div key={key}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>{key}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
                        {groups[key].map(perm => (
                          <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, cursor: permSaving !== null ? 'wait' : 'pointer', color: '#374151' }}>
                            <input type="checkbox" checked={assignedIds.has(perm.id)} disabled={permSaving !== null} onChange={() => togglePerm(perm)} />
                            <span style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{perm.name}</span>
                            {permSaving === perm.id && <span style={{ fontSize: 10, color: '#94A3B8' }}>...</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {confirmTarget && (
        <Modal title="Delete Role" onClose={() => { setConfirmTarget(null); setDeleteError(null) }}
          footer={<>
            <button onClick={() => setConfirmTarget(null)} style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleDelete} disabled={deleting} style={{ background: deleting ? '#FCA5A5' : '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: deleting ? 'default' : 'pointer' }}>{deleting ? 'Deleting...' : 'Delete'}</button>
          </>}
        >
          {deleteError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{deleteError}</div>}
          <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>Delete role <strong>{confirmTarget.name}</strong>? This cannot be undone.</p>
        </Modal>
      )}
    </>
  )
}

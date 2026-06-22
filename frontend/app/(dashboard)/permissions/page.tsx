'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import Modal from '@/components/Modal'
import { INPUT, LABEL, FIELD } from '@/components/formStyles'

type PermRow   = { id: number; name: string; description: string | null }
type FormState = { name: string; description: string }
const EMPTY: FormState = { name: '', description: '' }

const META: Record<string, { label: string; color: string; bg: string }> = {
  admin:       { label: 'Admin',       color: '#92400E', bg: '#FEF3C7' },
  users:       { label: 'Users',       color: '#1E40AF', bg: '#DBEAFE' },
  roles:       { label: 'Roles',       color: '#065F46', bg: '#D1FAE5' },
  permissions: { label: 'Permissions', color: '#6B21A8', bg: '#F3E8FF' },
  factories:   { label: 'Factories',   color: '#155E75', bg: '#CFFAFE' },
  monitoring:  { label: 'Monitoring',  color: '#0C4A6E', bg: '#E0F2FE' },
  energy:      { label: 'Energy',      color: '#713F12', bg: '#FEF9C3' },
  reports:     { label: 'Reports',     color: '#1E3A5F', bg: '#E0EFFE' },
  companies:   { label: 'Companies',   color: '#374151', bg: '#F3F4F6' },
  sites:       { label: 'Sites',       color: '#374151', bg: '#F3F4F6' },
  devices:     { label: 'Devices',     color: '#374151', bg: '#F3F4F6' },
  access:      { label: 'Access',      color: '#374151', bg: '#F3F4F6' },
  other:       { label: 'Other',       color: '#374151', bg: '#F3F4F6' },
}
const ORDER = ['admin','users','roles','permissions','factories','monitoring','energy','reports','companies','sites','devices','access','other']

function group(perms: PermRow[]): Record<string, PermRow[]> {
  const g: Record<string, PermRow[]> = {}
  for (const p of perms) {
    const k = p.name.includes('.') ? p.name.split('.')[0] : p.name.includes(':') ? p.name.split(':')[0] : 'other'
    ;(g[k] ??= []).push(p)
  }
  return g
}

export default function PermissionsPage() {
  const [perms, setPerms]           = useState<PermRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState<null | 'create' | 'edit'>(null)
  const [editTarget, setEditTarget] = useState<PermRow | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PermRow | null>(null)
  const [form, setForm]             = useState<FormState>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    apiFetch<PermRow[]>('/permissions/', {}, getToken())
      .then(d => { setPerms(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [refreshKey])

  function openCreate() { setForm(EMPTY); setFormError(null); setModal('create') }
  function openEdit(p: PermRow) { setEditTarget(p); setForm({ name: p.name, description: p.description ?? '' }); setFormError(null); setModal('edit') }
  function closeModal() { setModal(null); setEditTarget(null); setFormError(null) }

  async function handleSave() {
    setSaving(true); setFormError(null)
    const token = getToken()
    try {
      if (modal === 'create') {
        await apiFetch('/permissions/', { method: 'POST', body: JSON.stringify({ name: form.name, description: form.description || null }) }, token)
      } else if (editTarget) {
        await apiFetch(`/permissions/${editTarget.id}`, { method: 'PUT', body: JSON.stringify({ name: form.name, description: form.description || null }) }, token)
      }
      setRefreshKey(k => k + 1); closeModal()
    } catch (e) { setFormError(e instanceof Error ? e.message : String(e)) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirmTarget) return
    setDeleting(true); setDeleteError(null)
    try {
      await apiFetch(`/permissions/${confirmTarget.id}`, { method: 'DELETE' }, getToken())
      setRefreshKey(k => k + 1); setConfirmTarget(null)
    } catch (e) { setDeleteError(e instanceof Error ? e.message : String(e)) }
    finally { setDeleting(false) }
  }

  const filtered = search ? perms.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.description ?? '').toLowerCase().includes(search.toLowerCase())) : perms
  const groups   = group(filtered)
  const keys     = [...ORDER.filter(k => groups[k]), ...Object.keys(groups).filter(k => !ORDER.includes(k))]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Permissions</h2>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748B' }}>{perms.length} total across {Object.keys(group(perms)).length} modules</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search permissions..." style={{ padding: '7px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, width: 200, outline: 'none' }} />
          <button onClick={openCreate} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Permission</button>
        </div>
      </div>

      {loading ? <div style={{ color: '#64748B', fontSize: 14, padding: 32, textAlign: 'center' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {keys.map(key => {
            const m = META[key] ?? META.other
            const items = groups[key]
            return (
              <div key={key} className="table-card-premium" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(148,163,184,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: m.bg, color: m.color, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{m.label}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{items.length} permission{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ padding: '10px 0' }}>
                  {items.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 18px', borderBottom: i < items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <code style={{ fontSize: 12, fontFamily: 'monospace', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4, padding: '2px 7px', color: '#1E293B', flexShrink: 0 }}>{p.name}</code>
                      <span style={{ flex: 1, fontSize: 13, color: '#64748B', marginLeft: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description ?? '--'}</span>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                        <button onClick={() => openEdit(p)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, padding: '2px 9px', fontSize: 11, cursor: 'pointer', color: '#374151' }}>Edit</button>
                        <button onClick={() => setConfirmTarget(p)} style={{ background: 'none', border: '1px solid #FCA5A5', borderRadius: 4, padding: '2px 9px', fontSize: 11, cursor: 'pointer', color: '#DC2626' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {keys.length === 0 && <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 14, padding: 40 }}>No permissions match.</div>}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Add Permission' : 'Edit Permission'} onClose={closeModal}
          footer={<>
            <button onClick={closeModal} style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
          </>}
        >
          {formError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
          <div style={FIELD}><label style={LABEL}>Name *</label><input style={INPUT} type="text" value={form.name} placeholder="e.g. users.read" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div style={FIELD}><label style={LABEL}>Description</label><input style={INPUT} type="text" value={form.description} placeholder="Optional" onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        </Modal>
      )}

      {confirmTarget && (
        <Modal title="Delete Permission" onClose={() => { setConfirmTarget(null); setDeleteError(null) }}
          footer={<>
            <button onClick={() => setConfirmTarget(null)} style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleDelete} disabled={deleting} style={{ background: deleting ? '#FCA5A5' : '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: deleting ? 'default' : 'pointer' }}>{deleting ? 'Deleting...' : 'Delete'}</button>
          </>}
        >
          {deleteError && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{deleteError}</div>}
          <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>Delete <code>{confirmTarget.name}</code>? Permissions in use by roles cannot be deleted.</p>
        </Modal>
      )}
    </div>
  )
}

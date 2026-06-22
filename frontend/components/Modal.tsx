'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}

export default function Modal({ title, onClose, children, footer, width = 480 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="animate-overlay-in blur-fallback"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="animate-modal-pop"
        style={{
          background: '#fff', borderRadius: 20, border: '1px solid #E6EBF2',
          width: `min(${width}px, 100%)`,
          boxShadow: '0 24px 70px rgba(15,23,42,0.22),0 8px 20px rgba(15,23,42,0.10)',
          display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid #EEF2F7',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" className="modal-x press" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94A3B8', fontSize: 22, lineHeight: 1,
            width: 40, height: 40, borderRadius: 10, marginRight: -8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: 22, overflowY: 'auto', flex: 1 }}>{children}</div>

        {footer && (
          <div style={{
            padding: '16px 22px', borderTop: '1px solid #EEF2F7', background: '#FBFCFE',
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

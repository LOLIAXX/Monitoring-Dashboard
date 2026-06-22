import type { CSSProperties } from 'react'

/** Shared form field styles for admin CRUD modals.
 *  Focus ring is applied app-wide from globals.css (input:focus). */
export const INPUT: CSSProperties = {
  width: '100%', border: '1px solid #D5DDE7', borderRadius: 10,
  padding: '9px 13px', fontSize: 14, color: '#0F172A',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

export const LABEL: CSSProperties = {
  display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569',
  marginBottom: 6, letterSpacing: '0.01em',
}

export const FIELD: CSSProperties = { marginBottom: 18 }

'use client'

import { usePathname } from 'next/navigation'
import StitchSidebar from './StitchSidebar'
import StitchTopbar from './StitchTopbar'
import { SC } from './stitchDesignTokens'
import { resolveStitchLabel } from './stitchNav'

interface Props {
  userInitial: string
  isSuperuser: boolean
  onLogout: () => void
  children: React.ReactNode
}

export default function StitchShell({ userInitial, isSuperuser, onLogout, children }: Props) {
  const pathname  = usePathname()
  const pageLabel = resolveStitchLabel(pathname)

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'Inter','-apple-system','BlinkMacSystemFont','Segoe UI',sans-serif",
    }}>
      <StitchSidebar isSuperuser={isSuperuser} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <StitchTopbar pageLabel={pageLabel} userInitial={userInitial} />
        <main style={{ flex: 1, overflow: 'auto', padding: 24, background: SC.pageBg }}>
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, removeToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import StitchShell from '@/components/stitch/StitchShell'

interface UserInfo { id: number; email: string; is_superuser: boolean }

export default function StitchLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    apiFetch<UserInfo>('/auth/me', {}, token)
      .then(setUser)
      .catch(() => { removeToken(); router.push('/login') })
  }, [router])

  function logout() { removeToken(); router.push('/login') }

  return (
    <StitchShell
      userInitial={user?.email?.[0]?.toUpperCase() ?? '?'}
      isSuperuser={user?.is_superuser ?? false}
      onLogout={logout}
    >
      {children}
    </StitchShell>
  )
}

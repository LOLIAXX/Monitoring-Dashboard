'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    apiFetch<{ is_superuser: boolean }>('/auth/me', {}, token)
      .then(() => router.push('/monitoring'))
      .catch(() => router.push('/login'))
  }, [router])

  return null
}

'use client'

import { useState, useEffect } from 'react'

export default function Clock() {
  const [clockStr, setClockStr] = useState('--:--:--')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const now = new Date()
      setClockStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) return <>--:--:--</>

  return <>{clockStr}</>
}

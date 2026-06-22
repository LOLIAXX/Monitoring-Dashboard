'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { apiLogin } from '@/lib/api'
import { setToken } from '@/lib/auth'

// Dev-only bypass: set NEXT_PUBLIC_DEV_AUTH_BYPASS=true in .env.local
// Resolved at build time — undefined in production builds unless explicitly set
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      setToken(data.access_token)
      router.push('/monitoring')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  function handleDevBypass() {
    setToken('dev-bypass-token')
    router.push('/monitoring')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    borderRadius: 11, border: '1px solid #D5DDE7',
    fontSize: 14, color: '#0F172A',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6,
  }

  const features = [
    {
      title: 'Real-time telemetry',
      desc: 'Live power, voltage, and load across every connected asset.',
      icon: <><path d="M3 12h4l3 8 4-16 3 8h4" /></>,
    },
    {
      title: 'Site & factory analytics',
      desc: 'Drill from the whole plant down to a single substation.',
      icon: <><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" /><rect x="13" y="7" width="3" height="10" /></>,
    },
    {
      title: 'Alerts & efficiency',
      desc: 'Catch abnormal usage and act before it costs you.',
      icon: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    },
  ]

  return (
    <>
      <style>{`
        .login-shell {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          font-family: 'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        }
        .login-brand {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 52px;
          color: #fff;
          background:
            radial-gradient(900px 480px at 12% -8%, rgba(14,165,233,0.34), transparent 58%),
            radial-gradient(760px 520px at 108% 112%, rgba(37,99,235,0.40), transparent 55%),
            linear-gradient(155deg, #0B1B3B 0%, #0C2A63 52%, #0A1730 100%);
        }
        .login-brand::after {
          content: "";
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(120% 90% at 30% 10%, #000 38%, transparent 78%);
          -webkit-mask-image: radial-gradient(120% 90% at 30% 10%, #000 38%, transparent 78%);
        }
        .login-brand > * { position: relative; z-index: 1; }
        .login-form-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background:
            radial-gradient(820px 420px at 100% -10%, rgba(37,99,235,0.13), transparent 60%),
            radial-gradient(680px 360px at 0% 100%, rgba(14,165,233,0.12), transparent 56%),
            linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px),
            linear-gradient(135deg,#F8FBFF 0%,#EEF6FF 45%,#F8FAFC 100%);
          background-size: auto, auto, 34px 34px, 34px 34px, auto;
        }
        @media (max-width: 920px) {
          .login-shell { grid-template-columns: 1fr; }
          .login-brand { display: none; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .login-card { animation: fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        }
      `}</style>

      <div className="login-shell">

        {/* ── Brand / value panel ── */}
        <aside className="login-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg,#2563EB 0%,#0EA5E9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 22px rgba(14,165,233,0.45)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>Sonergy</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: '#7DD3FC' }}>MONITORING SYSTEM</div>
            </div>
          </div>

          <div style={{ maxWidth: 420 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', textWrap: 'balance' }}>
              Industrial energy,<br />under control.
            </h1>
            <p style={{ margin: '14px 0 30px', fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 380 }}>
              One console for every site, factory, and device on your network.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {features.map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {f.icon}
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{f.title}</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 2, lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#34D399',
              boxShadow: '0 0 8px rgba(52,211,153,0.8)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            All monitoring services operational
          </div>
        </aside>

        {/* ── Form panel ── */}
        <main className="login-form-wrap">
          <div style={{ width: '100%', maxWidth: 408 }}>

            {/* Compact brand mark — shows on mobile where the panel is hidden */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 26 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: 'linear-gradient(135deg,#1D4ED8 0%,#0EA5E9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(14,165,233,0.32)',
              }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>Sonergy</span>
            </div>

            <div className="login-card surface-premium" style={{
              borderRadius: 20,
              padding: '30px 30px 32px',
            }}>
              <div style={{ marginBottom: 22 }}>
                <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Sign in
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#64748B' }}>
                  Welcome back. Access your energy console.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div role="alert" style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '11px 14px', borderRadius: 11,
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    color: '#DC2626', fontSize: 13, fontWeight: 500, marginBottom: 20,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="admin@example.com"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      style={{ ...inputStyle, paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      title={showPw ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', top: '50%', right: 6, transform: 'translateY(-50%)',
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: 'transparent', cursor: 'pointer', color: '#94A3B8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'color 0.15s, background-color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
                    >
                      {showPw ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="press"
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading
                      ? '#93C5FD'
                      : 'linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)',
                    color: '#fff', fontSize: 14.5, fontWeight: 700, letterSpacing: '0.01em',
                    boxShadow: loading ? 'none' : '0 8px 20px rgba(37,99,235,0.30)',
                    transition: 'filter 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.07)' }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = 'none' }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>

                {DEV_BYPASS && (
                  <button
                    type="button"
                    onClick={handleDevBypass}
                    style={{
                      marginTop: 10, width: '100%', padding: '10px 16px',
                      borderRadius: 11, border: '1.5px dashed #F59E0B', cursor: 'pointer',
                      background: '#FFFBEB', color: '#92400E',
                      fontSize: 13, fontWeight: 600, letterSpacing: '0.01em',
                    }}
                  >
                    Dev bypass (skip auth)
                  </button>
                )}
              </form>
            </div>

            <p style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 22,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secure session · Sonergy Energy Monitoring
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

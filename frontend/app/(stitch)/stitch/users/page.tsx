import { SC } from '@/components/stitch/stitchDesignTokens'
import StitchPanel from '@/components/stitch/StitchPanel'
import StitchStatusPill from '@/components/stitch/StitchStatusPill'
import { USERS_DATA, ROLES_DATA } from '@/components/stitch/stitchMockData'

const ROLE_STYLE: Record<string, { bg: string; text: string }> = {
  'Super Admin':  { bg: SC.dangerBg,  text: SC.danger  },
  'Site Manager': { bg: SC.blueLight, text: SC.blue     },
  'Analyst':      { bg: SC.indigoBg,  text: SC.indigo   },
  'Operator':     { bg: SC.successBg, text: SC.success  },
}

export default function UsersPage() {
  const stats = [
    { label: 'Total Users',   value: String(USERS_DATA.length),                                        color: SC.blue      },
    { label: 'Active',        value: String(USERS_DATA.filter(u => u.status === 'Active').length),     color: SC.success   },
    { label: 'Site Managers', value: String(USERS_DATA.filter(u => u.role === 'Site Manager').length), color: SC.indigo    },
    { label: 'Roles Defined', value: String(ROLES_DATA.length),                                        color: SC.textMuted },
  ]

  const inviteBtn = (
    <button style={{ padding: '5px 12px', borderRadius: SC.radius.sm, background: SC.blue, color: '#fff', border: 'none', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
      + Invite User
    </button>
  )

  const card: React.CSSProperties = {
    background: SC.cardBg, borderRadius: SC.radius.lg,
    border: `1px solid ${SC.cardBorder}`, boxShadow: SC.cardShadow,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SC.textDark, margin: 0 }}>User Management &amp; Permissions</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: SC.textMuted }}>Manage team members, roles, and site access levels</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: SC.textMuted, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <StitchPanel title="All Users" noPad action={inviteBtn}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['Name', 'Email', 'Role', 'Site Access', 'Last Active', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS_DATA.map((u, i) => {
              const rs = ROLE_STYLE[u.role] ?? { bg: SC.blueLight, text: SC.blue }
              return (
                <tr key={u.id} style={{ borderBottom: i < USERS_DATA.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: SC.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {u.name[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: SC.textDark }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', color: SC.textMuted }}>{u.email}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ background: rs.bg, color: rs.text, borderRadius: SC.radius.pill, padding: '2px 8px', fontSize: 10.5, fontWeight: 700 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '11px 16px', color: SC.textBody }}>{u.site}</td>
                  <td style={{ padding: '11px 16px', color: SC.textFaint, fontSize: 11.5 }}>{u.lastActive}</td>
                  <td style={{ padding: '11px 16px' }}><StitchStatusPill label={u.status} /></td>
                  <td style={{ padding: '11px 16px' }}>
                    <button style={{ fontSize: 11, color: SC.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </StitchPanel>

      <StitchPanel title="Roles" noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SC.pageBg }}>
              {['Role Name', 'Users', 'Description', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: SC.textMuted, letterSpacing: '0.04em', borderBottom: `1px solid ${SC.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES_DATA.map((r, i) => (
              <tr key={r.name} style={{ borderBottom: i < ROLES_DATA.length - 1 ? `1px solid ${SC.cardBorder}` : 'none' }}>
                <td style={{ padding: '11px 16px', fontWeight: 700, color: SC.textDark }}>{r.name}</td>
                <td style={{ padding: '11px 16px', color: SC.textBody, textAlign: 'center' }}>{r.users}</td>
                <td style={{ padding: '11px 16px', color: SC.textMuted }}>{r.desc}</td>
                <td style={{ padding: '11px 16px' }}>
                  <button style={{ fontSize: 11, color: SC.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StitchPanel>
    </div>
  )
}

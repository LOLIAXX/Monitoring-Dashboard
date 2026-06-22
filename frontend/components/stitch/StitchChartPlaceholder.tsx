import { SC } from './stitchDesignTokens'

export function Sparkline({ values, color = SC.blue, width = 120, height = 36 }: {
  values: number[]
  color?: string
  width?: number
  height?: number
}) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const p = 3
  const pts = values.map((v, i) => {
    const x = p + (i / (values.length - 1)) * (width - p * 2)
    const y = height - p - ((v - min) / range) * (height - p * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const last = pts.split(' ').at(-1)!.split(',')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  )
}

export function BarSegment({ pct, color = SC.blue, status }: { pct: number; color?: string; status?: string }) {
  const fill = status === 'high'
    ? `linear-gradient(90deg,${SC.warning},${SC.danger})`
    : `linear-gradient(90deg,${color},${SC.blueMid})`
  return (
    <div style={{ height: 5, background: SC.cardBorder, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 3, width: `${Math.round(pct * 100)}%`, background: fill }} />
    </div>
  )
}

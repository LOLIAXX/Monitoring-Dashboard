'use client'

import { useState } from 'react'
import { PLANT_ZONES, MAIN_SUBSTATION, CANVAS_W, CANVAS_H, computeBuildings } from './PlantMapData'

interface Tooltip {
  x: number; y: number
  title: string; kwh: number; devices: number; status: string
}

const STATUS_COLOR: Record<string, string> = {
  ok: '#10B981', warning: '#F59E0B', alert: '#EF4444',
}

export default function PlantMap() {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const [hoveredMain, setHoveredMain] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{ width: '100%', height: 'auto', display: 'block', background: '#0A1628', borderRadius: 10 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="sg-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} fill="url(#sg-grid)"/>

        {/* Roads */}
        <rect x={0}   y={78}  width={CANVAS_W} height={12} fill="rgba(255,255,255,0.035)"/>
        <rect x={0}   y={258} width={CANVAS_W} height={12} fill="rgba(255,255,255,0.035)"/>
        <rect x={270} y={78}  width={10} height={CANVAS_H - 78} fill="rgba(255,255,255,0.035)"/>
        <rect x={545} y={78}  width={10} height={CANVAS_H - 78} fill="rgba(255,255,255,0.035)"/>
        <rect x={735} y={258} width={10} height={CANVAS_H - 258} fill="rgba(255,255,255,0.035)"/>

        {/* HV power lines from main substation */}
        {[
          [445,60,140,95],[445,60,415,95],[445,60,700,95],
          [445,60,115,275],[445,60,345,275],[445,60,600,275],[445,60,820,275],
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(245,158,11,0.20)" strokeWidth={0.8} strokeDasharray="4 3"/>
        ))}

        {/* Zones */}
        {PLANT_ZONES.map(zone => {
          const buildings = computeBuildings(zone)
          const sc = STATUS_COLOR[zone.status]

          return (
            <g
              key={zone.id}
              className="zone-group"
              onMouseEnter={() => setTooltip({ x: zone.x + zone.w / 2, y: zone.y, title: zone.label, kwh: zone.kwh, devices: zone.deviceCount, status: zone.status })}
              onMouseLeave={() => setTooltip(null)}
            >
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={8} fill={zone.color} stroke={zone.borderColor} strokeWidth={1}/>
              {/* Label bar */}
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.labelH} rx={8} fill="rgba(255,255,255,0.04)"/>
              <rect x={zone.x} y={zone.y + zone.labelH - 1} width={zone.w} height={1} fill="rgba(255,255,255,0.07)"/>
              <circle cx={zone.x + 10} cy={zone.y + zone.labelH / 2} r={3} fill={sc}/>
              <text x={zone.x + 19} y={zone.y + zone.labelH / 2 + 3.5} fontSize={7.5} fontWeight={700} letterSpacing={0.5} fill="rgba(255,255,255,0.75)" style={{ userSelect: 'none' }}>
                {zone.shortLabel}
              </text>
              {/* Buildings */}
              {buildings.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={2.5} fill={zone.buildingFill} stroke={zone.borderColor} strokeWidth={0.7}/>
              ))}
              {/* Mini substations */}
              {zone.substations.map(s => (
                <g key={s.label}>
                  <rect x={s.x} y={s.y} width={18} height={12} rx={2} fill="rgba(245,158,11,0.22)" stroke="rgba(245,158,11,0.65)" strokeWidth={0.9}/>
                  <text x={s.x + 9} y={s.y + 8.5} fontSize={5} textAnchor="middle" fill="rgba(252,211,77,0.9)" fontWeight={700} style={{ userSelect: 'none' }}>{s.kvLevel}</text>
                </g>
              ))}
            </g>
          )
        })}

        {/* Main 63kV Substation */}
        <g
          className="substation-main"
          onMouseEnter={() => setHoveredMain(true)}
          onMouseLeave={() => setHoveredMain(false)}
        >
          <circle cx={MAIN_SUBSTATION.x + 45} cy={MAIN_SUBSTATION.y + 26} r={hoveredMain ? 46 : 38} fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth={1.5} style={{ transition: 'r 0.2s ease' }}/>
          <circle cx={MAIN_SUBSTATION.x + 45} cy={MAIN_SUBSTATION.y + 26} r={hoveredMain ? 56 : 48} fill="none" stroke="rgba(245,158,11,0.07)" strokeWidth={1} style={{ transition: 'r 0.2s ease' }}/>
          <rect x={MAIN_SUBSTATION.x} y={MAIN_SUBSTATION.y} width={MAIN_SUBSTATION.w} height={MAIN_SUBSTATION.h} rx={7} fill="#110D00" stroke="#F59E0B" strokeWidth={1.5}/>
          <text x={MAIN_SUBSTATION.x + 45} y={MAIN_SUBSTATION.y + 21} fontSize={13} textAnchor="middle" fill="#F59E0B" style={{ userSelect: 'none' }}>⚡</text>
          <text x={MAIN_SUBSTATION.x + 45} y={MAIN_SUBSTATION.y + 34} fontSize={7.5} textAnchor="middle" fill="#FCD34D" fontWeight={700} letterSpacing={0.5} style={{ userSelect: 'none' }}>{MAIN_SUBSTATION.label}</text>
          <text x={MAIN_SUBSTATION.x + 45} y={MAIN_SUBSTATION.y + 46} fontSize={6.5} textAnchor="middle" fill="rgba(252,211,77,0.6)" style={{ userSelect: 'none' }}>{MAIN_SUBSTATION.kvLevel}</text>
        </g>

        {/* Zone tooltip */}
        {tooltip && (() => {
          const TW = 142, TH = 68
          const tx = Math.min(Math.max(tooltip.x - TW / 2, 4), CANVAS_W - TW - 4)
          const ty = tooltip.y - TH - 10 < 0 ? tooltip.y + 22 : tooltip.y - TH - 10
          const sc = STATUS_COLOR[tooltip.status] ?? '#10B981'
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={TW} height={TH} rx={6} fill="rgba(7,14,26,0.96)" stroke="rgba(14,165,233,0.4)" strokeWidth={1}/>
              <circle cx={tx + 12} cy={ty + 14} r={3.5} fill={sc}/>
              <text x={tx + 22} y={ty + 18} fontSize={8.5} fontWeight={700} fill="rgba(255,255,255,0.9)" style={{ userSelect: 'none' }}>{tooltip.title}</text>
              <line x1={tx + 6} y1={ty + 25} x2={tx + TW - 6} y2={ty + 25} stroke="rgba(255,255,255,0.07)" strokeWidth={0.8}/>
              <text x={tx + 8} y={ty + 37} fontSize={7.5} fill="rgba(255,255,255,0.45)" style={{ userSelect: 'none' }}>Daily energy</text>
              <text x={tx + TW - 8} y={ty + 37} fontSize={8} fontWeight={700} fill="#38BDF8" textAnchor="end" style={{ userSelect: 'none', fontVariantNumeric: 'tabular-nums' }}>{tooltip.kwh.toLocaleString()} kWh</text>
              <text x={tx + 8} y={ty + 50} fontSize={7.5} fill="rgba(255,255,255,0.45)" style={{ userSelect: 'none' }}>Active devices</text>
              <text x={tx + TW - 8} y={ty + 50} fontSize={8} fontWeight={700} fill="rgba(255,255,255,0.8)" textAnchor="end" style={{ userSelect: 'none' }}>{tooltip.devices}</text>
              <text x={tx + 8} y={ty + 62} fontSize={7} fill={sc} style={{ userSelect: 'none' }}>{tooltip.status.toUpperCase()}</text>
            </g>
          )
        })()}

        {/* Main substation tooltip */}
        {hoveredMain && (
          <g pointerEvents="none">
            <rect x={MAIN_SUBSTATION.x + MAIN_SUBSTATION.w + 8} y={MAIN_SUBSTATION.y} width={134} height={56} rx={6} fill="rgba(7,14,26,0.96)" stroke="rgba(245,158,11,0.45)" strokeWidth={1}/>
            <text x={MAIN_SUBSTATION.x + MAIN_SUBSTATION.w + 14} y={MAIN_SUBSTATION.y + 14} fontSize={8} fontWeight={700} fill="#FCD34D" style={{ userSelect: 'none' }}>{MAIN_SUBSTATION.detail}</text>
            <text x={MAIN_SUBSTATION.x + MAIN_SUBSTATION.w + 14} y={MAIN_SUBSTATION.y + 28} fontSize={7.5} fill="rgba(255,255,255,0.45)" style={{ userSelect: 'none' }}>Voltage level</text>
            <text x={MAIN_SUBSTATION.x + MAIN_SUBSTATION.w + 126} y={MAIN_SUBSTATION.y + 28} fontSize={8} fontWeight={700} fill="rgba(255,255,255,0.9)" textAnchor="end" style={{ userSelect: 'none' }}>{MAIN_SUBSTATION.kvLevel}</text>
            <text x={MAIN_SUBSTATION.x + MAIN_SUBSTATION.w + 14} y={MAIN_SUBSTATION.y + 42} fontSize={7.5} fill="rgba(255,255,255,0.45)" style={{ userSelect: 'none' }}>Distribution</text>
            <text x={MAIN_SUBSTATION.x + MAIN_SUBSTATION.w + 126} y={MAIN_SUBSTATION.y + 42} fontSize={8} fontWeight={700} fill="rgba(255,255,255,0.9)" textAnchor="end" style={{ userSelect: 'none' }}>20 substations</text>
            <text x={MAIN_SUBSTATION.x + MAIN_SUBSTATION.w + 14} y={MAIN_SUBSTATION.y + 54} fontSize={7} fill="#10B981" style={{ userSelect: 'none' }}>● ENERGIZED</text>
          </g>
        )}

        {/* Legend */}
        <g>
          <rect x={6} y={CANVAS_H - 20} width={8} height={8} rx={1.5} fill="rgba(37,99,235,0.22)" stroke="rgba(37,99,235,0.4)" strokeWidth={0.8}/>
          <text x={18} y={CANVAS_H - 13} fontSize={7} fill="rgba(255,255,255,0.35)" style={{ userSelect: 'none' }}>Production Zone</text>
          <rect x={116} y={CANVAS_H - 20} width={8} height={8} rx={1.5} fill="rgba(245,158,11,0.22)" stroke="rgba(245,158,11,0.65)" strokeWidth={0.8}/>
          <text x={128} y={CANVAS_H - 13} fontSize={7} fill="rgba(255,255,255,0.35)" style={{ userSelect: 'none' }}>Sub-Station</text>
          <circle cx={207} cy={CANVAS_H - 16} r={3.5} fill="#10B981"/>
          <text x={215} y={CANVAS_H - 13} fontSize={7} fill="rgba(255,255,255,0.35)" style={{ userSelect: 'none' }}>Online</text>
          <circle cx={257} cy={CANVAS_H - 16} r={3.5} fill="#F59E0B"/>
          <text x={265} y={CANVAS_H - 13} fontSize={7} fill="rgba(255,255,255,0.35)" style={{ userSelect: 'none' }}>Warning</text>
        </g>
      </svg>
    </div>
  )
}

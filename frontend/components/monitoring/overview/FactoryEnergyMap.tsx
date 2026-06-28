import React, { useState } from 'react'
import { L } from './OverviewShared'
import { HOTSPOT_DOTS } from '@/components/monitoring/overviewMockData'
import { PulsingDot } from './PulsingDot'

export const FactoryEnergyMap = React.memo(function FactoryEnergyMap() {
  const [hoveredDot, setHoveredDot] = useState<string | null>(null)
  const [mapView, setMapView]       = useState<'3d' | 'flow'>('3d')
  const [timeRange, setTimeRange]   = useState('live')

  return (
    <div className="chart-card overview-visual-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 560 }}>
      {/* Panel header */}
      <div className="overview-visual-head">
        <div>
          <h3 style={{ fontFamily: L.headFont, fontSize: 16, fontWeight: 700, color: L.onSurface, margin: '0 0 2px' }}>Interactive Site Visualizer</h3>
          <p style={{ margin: 0, fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar }}>Hover over zones for fallback asset details · static digital twin view</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Time range */}
          <label className="overview-control" style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: L.r.lg, padding: '6px 12px', fontFamily: L.monoFont, fontSize: 11, color: L.onSurfaceVar, cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ border: 'none', background: 'transparent', font: 'inherit', color: 'inherit', cursor: 'pointer', outline: 'none' }}>
              <option value="live">Live</option>
              <option value="1h">Last 1h</option>
              <option value="6h">Last 6h</option>
              <option value="today">Today</option>
            </select>
          </label>
          {/* View toggle */}
          <div className="overview-toggle">
            {(['3d', 'flow'] as const).map(v => (
              <button key={v} type="button" onClick={() => setMapView(v)} className="overview-toggle-button" style={{
                background: mapView === v ? L.surface : 'transparent',
                color: mapView === v ? L.primary : L.onSurfaceVar,
                boxShadow: mapView === v ? '0 1px 3px rgba(9,30,66,0.12), 0 1px 0 rgba(255,255,255,0.9) inset' : 'none',
              }}>
                {v === '3d' ? '3D Mapping' : 'Flow Analysis'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image frame */}
      <div className="overview-image-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/factory-overview-screen.png"
          alt="Static factory site map with hotspot overlays for Sonergy Site Alpha"
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
          draggable={false}
        />

        {/* Pulsing dot anchors */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {HOTSPOT_DOTS.map(dot => (
            <PulsingDot
              key={dot.id}
              dot={dot}
              hovered={hoveredDot === dot.id}
              onEnter={() => setHoveredDot(dot.id)}
              onLeave={() => setHoveredDot(null)}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

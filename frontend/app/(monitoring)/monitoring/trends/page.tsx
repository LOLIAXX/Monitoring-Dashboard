'use client'

import { useEffect, useMemo, useState } from 'react'
import { C } from '@/components/monitoring/monitoringColors'
import { classifyMonitoringSites } from '@/components/monitoring/siteClassification'
import {
  MONITORING_FACTORY_SITES,
  MONITORING_SUBSTATIONS,
  TREND_TIME_RANGES,
  TREND_RESOLUTIONS,
  TREND_PARAMETERS,
  MOCK_TREND_SERIES,
  MOCK_COMPARISON_SERIES,
  MOCK_TARGET_PROFILES,
  MOCK_POWER_QUALITY,
  MOCK_PARAMETER_SUMMARY,
} from '@/components/monitoring/trendsMockData'
import { getToken } from '@/lib/auth'
import {
  fetchMonitoringLatest,
  fetchMonitoringSites,
  fetchMonitoringTargets,
  fetchMonitoringTrends,
  type MonitoringLatestItem,
  type MonitoringSite,
  type MonitoringTarget,
  type MonitoringTrendPoint,
} from '@/lib/monitoringApi'

type ScopeTab = 'factory' | 'substation' | 'mainSubstation'
type ApiState = 'idle' | 'loading' | 'ready' | 'fallback'
type SelectorItem = { key: string; name: string; siteId?: number }

// Maps a human parameter label to a key in MOCK_TREND_SERIES + its display unit.
const PARAM_MAP: Record<string, { key: string; unit: string }> = {
  'Active Power kW': { key: 'activePowerKw', unit: 'kW' },
  'Energy kWh':      { key: 'energyKwh',     unit: 'kWh' },
  'Voltage':         { key: 'voltageKv',     unit: 'kV' },
  'Current':         { key: 'currentA',      unit: 'A' },
  'Power Factor':    { key: 'powerFactor',   unit: '' },
  'Frequency':       { key: 'frequencyHz',   unit: 'Hz' },
  'Demand':          { key: 'demandKw',      unit: 'kW' },
}

const BACKEND_PARAM_MAP: Record<string, string> = {
  'Active Power kW': 'active_power_iii',
  'Energy kWh': 'active_energy',
  Voltage: 'voltage_phase_l1',
  Current: 'current_l1',
  'Power Factor': 'power_factor_iii',
  Frequency: 'frequency',
  Demand: 'active_power_iii',
}

const BACKEND_RESOLUTION_MAP: Record<string, string> = {
  '1s': 'raw',
  '5s': 'raw',
  '1m': '1m',
  '15m': '1m',
  '1h': '1h',
}

const TREND_LIMIT = 48

// Each scope tab carries its own accent so the right sidebar re-themes on click.
const TAB_THEME: Record<ScopeTab, { accent: string; tint: string; bar: string }> = {
  factory:        { accent: C.blue,    tint: C.blueLight, bar: 'linear-gradient(135deg,#2563EB,#1D4ED8)' },
  substation:     { accent: C.sky,     tint: C.skyDim,    bar: 'linear-gradient(135deg,#0EA5E9,#0284C7)' },
  mainSubstation: { accent: C.warning, tint: '#FFFBEB',   bar: 'linear-gradient(135deg,#F59E0B,#D97706)' },
}

function toneColor(tone: string): string {
  return tone === 'good' ? C.success : tone === 'warning' ? C.warning : C.danger
}

function formatLiveValue(item: MonitoringLatestItem | undefined, fallback: string): string {
  if (!item || !Number.isFinite(item.value)) return fallback
  const abs = Math.abs(item.value)
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2
  const value = item.value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals === 0 ? 0 : undefined,
  })
  return `${value}${item.unit ? ` ${item.unit}` : ''}`
}

function latestByName(items: MonitoringLatestItem[], names: string[]): MonitoringLatestItem | undefined {
  const lowered = names.map(name => name.toLowerCase())
  return items.find(item => {
    const parameter = item.parameter.toLowerCase()
    return lowered.some(name => parameter.includes(name))
  })
}

function formatTrendTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TrendsPage() {
  const [tab, setTab]               = useState<ScopeTab>('factory')
  const [factory, setFactory]       = useState<string>(MONITORING_FACTORY_SITES[0])
  const [substation, setSubstation] = useState<string>(MONITORING_SUBSTATIONS[0])
  const [mainSubstation, setMainSubstation] = useState<string>('JK')
  const [search, setSearch]         = useState('')
  const [sites, setSites]           = useState<MonitoringSite[]>([])
  const [targets, setTargets]       = useState<MonitoringTarget[]>([])
  const [latest, setLatest]         = useState<MonitoringLatestItem[]>([])
  const [trendPoints, setTrendPoints] = useState<MonitoringTrendPoint[]>([])
  const [directoryState, setDirectoryState] = useState<ApiState>('idle')
  const [trendState, setTrendState] = useState<ApiState>('idle')
  const [apiMessage, setApiMessage] = useState<string | null>(null)

  const [timeRange, setTimeRange]   = useState<string>(TREND_TIME_RANGES[3])  // "Today"
  const [resolution, setResolution] = useState<string>('1h')
  const [parameter, setParameter]   = useState<string>(TREND_PARAMETERS[0])   // "Active Power kW"

  const theme   = TAB_THEME[tab]
  const mockProfile = tab === 'factory' ? MOCK_TARGET_PROFILES.factory : MOCK_TARGET_PROFILES.substation
  const scopeName = tab === 'factory' ? factory : tab === 'substation' ? substation : mainSubstation
  const scopeLabel = tab === 'factory' ? 'Site' : tab === 'substation' ? 'Substation' : 'Main Substation'

  const classifiedSites = useMemo(
    () => classifyMonitoringSites(sites),
    [sites],
  )

  const mockSubstations = useMemo(
    () => MONITORING_SUBSTATIONS.filter(name => {
      const lowered = name.toLowerCase()
      return lowered.includes('post') && !lowered.includes('jk')
    }),
    [],
  )

  const mockMainSubstations = useMemo(
    () => MONITORING_SUBSTATIONS.filter(name => name.toLowerCase().includes('jk')),
    [],
  )

  const selectorItems = useMemo<SelectorItem[]>(() => {
    if (tab === 'factory') {
      return sites.length > 0
        ? classifiedSites.sites.map(site => ({ key: `site-${site.id}`, name: site.name, siteId: site.id }))
        : MONITORING_FACTORY_SITES.map((name, index) => ({ key: `mock-site-${index}`, name }))
    }
    if (tab === 'substation') {
      return sites.length > 0
        ? classifiedSites.substations.map(site => ({ key: `site-${site.id}`, name: site.name, siteId: site.id }))
        : mockSubstations.map((name, index) => ({ key: `mock-substation-${index}`, name }))
    }
    return sites.length > 0
      ? classifiedSites.mainSubstation.map(site => ({ key: `site-${site.id}`, name: site.name, siteId: site.id }))
      : mockMainSubstations.map((name, index) => ({ key: `mock-main-substation-${index}`, name }))
  }, [classifiedSites, mockMainSubstations, mockSubstations, sites.length, tab])

  const visibleSelectorItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? selectorItems.filter(item => item.name.toLowerCase().includes(q)) : selectorItems
  }, [selectorItems, search])

  const param = PARAM_MAP[parameter] ?? PARAM_MAP['Active Power kW']
  const selectedSite = useMemo(() => {
    const selectedName = tab === 'factory' ? factory : tab === 'substation' ? substation : mainSubstation
    return sites.find(site => site.name === selectedName) ?? null
  }, [factory, mainSubstation, sites, substation, tab])

  const selectedTarget = useMemo(() => {
    if (selectedSite) return targets.find(target => target.site_id === selectedSite.id) ?? null
    return null
  }, [selectedSite, targets])
  const hasRealDirectory = sites.length > 0
  const hasRealTrend = trendPoints.length > 0
  const trendUnit = trendPoints.find(point => point.unit)?.unit ?? param.unit
  const paramSummary = useMemo(() => {
    const mockSummary = MOCK_PARAMETER_SUMMARY[parameter as keyof typeof MOCK_PARAMETER_SUMMARY]
    if (!hasRealTrend || !mockSummary) return mockSummary
    const values = trendPoints.map(point => point.value).filter(Number.isFinite)
    if (values.length === 0) return mockSummary
    const current = values[values.length - 1]
    const total = values.reduce((sum, value) => sum + value, 0)
    const average = total / values.length
    const peak = Math.max(...values)
    const minimum = Math.min(...values)
    const suffix = trendUnit ? ` ${trendUnit}` : ''
    const fmt = (value: number) => `${Math.round(value).toLocaleString()}${suffix}`
    return {
      current: fmt(current),
      average: fmt(average),
      peak: fmt(peak),
      minimum: fmt(minimum),
    }
  }, [hasRealTrend, parameter, trendPoints, trendUnit])

  const livePower = latestByName(latest, ['active_power_iii', 'active_power'])
  const liveEnergy = latestByName(latest, ['active_energy'])
  const livePowerFactor = latestByName(latest, ['power_factor_iii', 'power_factor'])
  const profile = {
    ...mockProfile,
    currentDemand: formatLiveValue(livePower, mockProfile.currentDemand),
    todayEnergy: formatLiveValue(liveEnergy, mockProfile.todayEnergy),
    peakDemand: hasRealTrend
      ? `${Math.round(Math.max(...trendPoints.map(point => point.value))).toLocaleString()}${trendUnit ? ` ${trendUnit}` : ''}`
      : mockProfile.peakDemand,
    powerFactor: formatLiveValue(livePowerFactor, mockProfile.powerFactor),
    status: trendState === 'fallback' ? 'Fallback' : mockProfile.status,
    statusTone: trendState === 'fallback' ? 'warning' : mockProfile.statusTone,
  }

  useEffect(() => {
    let cancelled = false
    const token = getToken()
    if (!token) {
      setDirectoryState('fallback')
      setApiMessage('Sign in to load live monitoring targets. Showing mock trends.')
      return
    }

    setDirectoryState('loading')
    Promise.all([fetchMonitoringSites(token), fetchMonitoringTargets(token)])
      .then(([siteItems, targetItems]) => {
        if (cancelled) return
        const activeSites = siteItems.filter(site => site.is_active !== false && site.name)
        const activeTargets = targetItems.filter(target => target.is_active !== false && target.name)
        const classified = classifyMonitoringSites(activeSites)
        setSites(activeSites)
        setTargets(activeTargets)
        setDirectoryState(activeSites.length > 0 ? 'ready' : 'fallback')
        setApiMessage(activeSites.length > 0 ? null : 'Monitoring API returned no sites. Showing mock trends.')
        if (classified.sites.length > 0) {
          setFactory(current => classified.sites.some(site => site.name === current) ? current : classified.sites[0].name)
        }
        if (classified.substations.length > 0) {
          setSubstation(current => classified.substations.some(site => site.name === current) ? current : classified.substations[0].name)
        }
        if (classified.mainSubstation.length > 0) {
          setMainSubstation(current => classified.mainSubstation.some(site => site.name === current) ? current : classified.mainSubstation[0].name)
        }
      })
      .catch(() => {
        if (cancelled) return
        setSites([])
        setTargets([])
        setDirectoryState('fallback')
        setApiMessage('Monitoring API is unavailable. Showing mock trends.')
      })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const token = getToken()
    if (!token || !selectedTarget) {
      setLatest([])
      setTrendPoints([])
      setTrendState(selectedTarget ? 'fallback' : 'idle')
      return
    }

    setTrendState('loading')
    const backendResolution = BACKEND_RESOLUTION_MAP[resolution] ?? '1h'
    const backendParameter = BACKEND_PARAM_MAP[parameter] ?? 'active_power_iii'

    Promise.all([
      fetchMonitoringLatest(token, selectedTarget.id),
      fetchMonitoringTrends(token, {
        targetId: selectedTarget.id,
        parameter: backendParameter,
        resolution: backendResolution,
        limit: TREND_LIMIT,
      }),
    ])
      .then(([latestItems, points]) => {
        if (cancelled) return
        setLatest(latestItems)
        setTrendPoints(points)
        setTrendState(points.length > 0 ? 'ready' : 'fallback')
        if (points.length === 0) setApiMessage('No live trend points for this target and parameter. Showing mock trend shape.')
        else setApiMessage(null)
      })
      .catch(() => {
        if (cancelled) return
        setLatest([])
        setTrendPoints([])
        setTrendState('fallback')
        setApiMessage('Live trend data could not be loaded. Showing mock trend shape.')
      })

    return () => { cancelled = true }
  }, [parameter, resolution, selectedTarget])

  function selectName(name: string) {
    if (tab === 'factory') setFactory(name)
    else if (tab === 'substation') setSubstation(name)
    else setMainSubstation(name)
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minHeight: '100%' }}>

      {/* ============ CENTER: Monitoring & Trends content ============ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Title + controls */}
        <div className="surface-premium" style={{
          borderRadius: C.radius.lg, padding: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textDark }}>Monitoring &amp; Trends</h2>
              <div style={{ marginTop: 3, fontSize: 12.5, color: C.textMuted }}>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                  background: theme.accent, marginRight: 7, verticalAlign: 'middle',
                }}/>
                {scopeLabel} · <strong style={{ color: C.textBody }}>{scopeName}</strong>
                {selectedTarget && (
                  <span style={{ color: C.textFaint }}> · target #{selectedTarget.id}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Segmented options={TREND_TIME_RANGES} value={timeRange} onChange={setTimeRange} accent={theme.accent}/>
            </div>
          </div>

          {(directoryState === 'loading' || trendState === 'loading' || apiMessage) && (
            <div style={{
              marginTop: 12,
              border: `1px solid ${apiMessage ? `${C.warning}35` : C.cardBorder}`,
              background: apiMessage ? `${C.warning}10` : '#F8FAFC',
              color: apiMessage ? C.warning : C.textMuted,
              borderRadius: C.radius.md,
              padding: '8px 11px',
              fontSize: 12,
              fontWeight: 650,
            }}>
              {directoryState === 'loading' || trendState === 'loading'
                ? 'Loading live monitoring data...'
                : apiMessage}
            </div>
          )}

          {/* Parameter chips + resolution */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {TREND_PARAMETERS.map(p => {
                const active = p === parameter
                return (
                  <button key={p} onClick={() => setParameter(p)} className="pressable-premium" style={{
                    border: `1px solid ${active ? theme.accent : C.cardBorder}`,
                    background: active ? theme.tint : '#fff',
                    color: active ? theme.accent : C.textBody,
                    borderRadius: C.radius.pill, padding: '5px 12px',
                    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                    transition: 'background-color 140ms ease-out, color 140ms ease-out, border-color 140ms ease-out, transform 140ms ease-out',
                  }}>{p}</button>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>Resolution</span>
              <Segmented options={TREND_RESOLUTIONS} value={resolution} onChange={setResolution} accent={theme.accent}/>
            </div>
          </div>
        </div>

        {/* KPI summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
          <Kpi label="Current Demand" value={profile.currentDemand} detail="Live load" progress={82} accent={theme.accent}/>
          <Kpi label="Today Energy"   value={profile.todayEnergy}   detail="Daily use" progress={74} accent={theme.accent}/>
          <Kpi label="Peak Demand"    value={profile.peakDemand}    detail="Peak band" progress={88} accent={theme.accent}/>
          <Kpi label="Power Factor"   value={profile.powerFactor}   detail="Quality" progress={96} accent={theme.accent}/>
          <Kpi label="Active Alerts"  value={profile.alertCount}    detail="Exceptions" progress={34} accent={toneColor(profile.statusTone)}/>
          <Kpi label="Status"         value={profile.status}        detail="Operating state" progress={98} accent={toneColor(profile.statusTone)}/>
        </div>

        {/* Main trend chart */}
        <div className="chart-card" style={{
          borderRadius: C.radius.lg, padding: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark }}>
              {parameter} <span style={{ color: C.textFaint, fontWeight: 500 }}>· {timeRange} · {resolution}</span>
            </h3>
            {paramSummary && (
              <span className="status-chip-premium" style={{ color: theme.accent, borderColor: `${theme.accent}2e`, background: `${theme.accent}12` }}>
                {hasRealTrend ? 'Live' : 'Mock'} <strong style={{ color: C.textDark }}>{paramSummary.current}</strong>
              </span>
            )}
          </div>
          {selectedTarget === null && hasRealDirectory && (
            <div style={{
              border: `1px solid ${C.cardBorder}`,
              borderRadius: C.radius.md,
              padding: '10px 12px',
              marginBottom: 10,
              color: C.textMuted,
              fontSize: 12.5,
              fontWeight: 600,
            }}>
              No telemetry target mapped for this site yet.
            </div>
          )}
          <div className="chart-plot" style={{ borderRadius: C.radius.lg, padding: '8px 8px 0' }}>
            <TrendChart seriesKey={param.key} unit={trendUnit} accent={theme.accent} points={trendPoints}/>
          </div>
        </div>

        {/* Comparison + Power quality */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          <div className="chart-card" style={{
            borderRadius: C.radius.lg, padding: 18,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: C.textDark }}>Top Consumers (kW)</h3>
            <ComparisonBars/>
          </div>

          <div className="surface-premium" style={{
            borderRadius: C.radius.lg, padding: 18,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: C.textDark }}>Power Quality</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_POWER_QUALITY.map(q => {
                const color = toneColor(q.tone)
                return (
                <div key={q.label} className="data-row-premium" style={{ padding: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, color: C.textBody, fontWeight: 600 }}>{q.label}</span>
                    <span className="status-chip-premium" style={{ color, borderColor: `${color}30`, background: `${color}12` }}>{q.value}</span>
                  </div>
                  <div className="bullet-track" style={{ height: 8 }}>
                    <div className="bullet-fill" style={{ width: `${q.score}%`, background: color }}/>
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Parameter summary */}
        {paramSummary && (
          <div className="surface-premium" style={{
            borderRadius: C.radius.lg, padding: 18,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: C.textDark }}>{parameter} Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
              <SummaryStat label="Current" value={paramSummary.current}/>
              <SummaryStat label="Average" value={paramSummary.average}/>
              <SummaryStat label="Peak"    value={paramSummary.peak}/>
              <SummaryStat label="Minimum" value={paramSummary.minimum}/>
            </div>
          </div>
        )}
      </div>

      {/* ============ RIGHT: Selector sidebar (page-local) ============ */}
      <aside className="surface-premium" style={{
        width: 290, flexShrink: 0, position: 'sticky', top: 0,
        borderRadius: C.radius.lg, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 112px)',
      }}>
        {/* Accent bar re-themes per active tab */}
        <div style={{ height: 4, background: theme.bar, flexShrink: 0 }}/>

        {/* Title boxes for visible site groups */}
        <div style={{ display: 'flex', gap: 8, padding: 12, flexShrink: 0 }}>
          {(['factory', 'substation', 'mainSubstation'] as ScopeTab[]).map(t => {
            const active = t === tab
            const th = TAB_THEME[t]
            const label = t === 'factory' ? 'Sites' : t === 'substation' ? 'Substations' : 'Main Substation'
            return (
              <button key={t} onClick={() => { setTab(t); setSearch('') }} className="pressable-premium" style={{
                flex: 1, cursor: 'pointer', borderRadius: C.radius.md,
                border: `1.5px solid ${active ? th.accent : C.cardBorder}`,
                background: active ? th.tint : '#fff',
                color: active ? th.accent : C.textMuted,
                padding: '10px 7px', fontSize: 11.5, fontWeight: 700, lineHeight: 1.15,
                transition: 'background-color 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out, transform 150ms ease-out',
              }}>
                {label}
                <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, opacity: 0.75 }}>
                  {(t === 'factory'
                    ? (sites.length > 0 ? classifiedSites.sites.length : MONITORING_FACTORY_SITES.length)
                    : t === 'substation'
                      ? (sites.length > 0 ? classifiedSites.substations.length : mockSubstations.length)
                      : (sites.length > 0 ? classifiedSites.mainSubstation.length : mockMainSubstations.length))}
                </div>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ padding: '0 12px 10px', flexShrink: 0 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab === 'factory' ? 'sites' : tab === 'substation' ? 'substations' : 'main substations'}...`}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '8px 11px',
              border: `1px solid ${C.cardBorder}`, borderRadius: C.radius.sm,
              fontSize: 12.5, color: C.textDark, outline: 'none',
            }}
          />
        </div>

        {/* Names list for the active title */}
        <div className="dark-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 8px 10px' }}>
          {visibleSelectorItems.length === 0 ? (
            <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 12, color: C.textFaint }}>
              No matches
            </div>
          ) : visibleSelectorItems.map(item => {
            const active = item.name === scopeName
            return (
              <button key={item.key} onClick={() => selectName(item.name)} className="pressable-premium selector-row-premium" data-active={active} style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                cursor: 'pointer', borderRadius: C.radius.sm,
                border: `1px solid ${active ? theme.accent : 'transparent'}`,
                background: active ? theme.tint : 'transparent',
                color: active ? theme.accent : C.textBody,
                padding: '8px 10px 8px 13px', marginBottom: 3, fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                transition: 'background-color 130ms ease-out, color 130ms ease-out, border-color 130ms ease-out, transform 130ms ease-out',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: active ? theme.accent : C.textFaint,
                }}/>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                {active && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: theme.accent }}>Selected</span>
                )}
              </button>
            )
          })}
        </div>
      </aside>
    </div>
  )
}

/* ---------- small presentational helpers ---------- */

function Segmented({ options, value, onChange, accent }: {
  options: readonly string[]; value: string; onChange: (v: string) => void; accent: string
}) {
  return (
    <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: C.radius.md, padding: 3, gap: 2 }}>
      {options.map(o => {
        const active = o === value
        return (
          <button key={o} onClick={() => onChange(o)} className="pressable-premium" style={{
            border: 'none', cursor: 'pointer', borderRadius: C.radius.sm,
            background: active ? '#fff' : 'transparent',
            color: active ? accent : C.textMuted,
            boxShadow: active ? C.cardShadow : 'none',
            padding: '5px 10px', fontSize: 11.5, fontWeight: 600,
            transition: 'background-color 130ms ease-out, color 130ms ease-out, box-shadow 130ms ease-out, transform 130ms ease-out',
          }}>{o}</button>
        )
      })}
    </div>
  )
}

function Kpi({ label, value, detail, progress, accent }: { label: string; value: string; detail: string; progress: number; accent: string }) {
  return (
    <div className="kpi-premium" style={{
      borderRadius: C.radius.md, padding: '14px 15px',
      borderColor: `${accent}2e`,
    }}>
      <div className="metric-caption" style={{ color: C.textFaint }}>
        <span className="metric-caption-dot" style={{ background: accent, boxShadow: `0 0 0 4px ${accent}14` }} />
        <span style={{ fontSize: 10.5 }}>{label}</span>
      </div>
      <div className="metric-value" style={{ marginTop: 7, fontSize: 21, color: C.textDark }}>{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8, marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 700 }}>{detail}</span>
        <span style={{ fontSize: 10, color: accent, fontWeight: 800 }}>{progress}%</span>
      </div>
      <div className="bullet-track" style={{ height: 6 }}>
        <div className="bullet-fill" style={{ width: `${progress}%`, background: accent }}/>
        <span className="bullet-target" style={{ left: '76%' }} />
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-tile-premium" style={{ borderRadius: C.radius.md, padding: '11px 13px' }}>
      <div className="metric-caption" style={{ color: C.textFaint, fontSize: 10.5 }}>{label}</div>
      <div className="metric-value" style={{ marginTop: 5, fontSize: 17, color: C.textDark }}>{value}</div>
      <div className="bullet-track" style={{ marginTop: 8, height: 5 }}>
        <div className="bullet-fill" style={{ width: label === 'Peak' ? '92%' : label === 'Minimum' ? '42%' : label === 'Average' ? '68%' : '76%', background: C.blue }}/>
      </div>
    </div>
  )
}

function ComparisonBars() {
  const max = Math.max(...MOCK_COMPARISON_SERIES.map(d => d.value))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {MOCK_COMPARISON_SERIES.map(d => (
        <div key={d.label} className="data-row-premium" style={{ padding: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, color: C.textBody, fontWeight: 600 }}>{d.label}</span>
            <span className="status-chip-premium" style={{ color: d.color, borderColor: `${d.color}30`, background: `${d.color}12` }}>{d.value.toLocaleString()} kW</span>
          </div>
          <div className="bullet-track" style={{ height: 9 }}>
            <div className="bullet-fill" style={{ width: `${(d.value / max) * 100}%`, background: d.color }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendChart({
  seriesKey,
  unit,
  accent,
  points,
}: {
  seriesKey: string
  unit: string
  accent: string
  points: MonitoringTrendPoint[]
}) {
  const W = 1000, H = 280, padL = 56, padR = 16, padT = 16, padB = 34
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const rows = points.length > 0
    ? points.map(point => ({ time: formatTrendTime(point.timestamp), value: point.value }))
    : (MOCK_TREND_SERIES as unknown as Array<Record<string, number | string>>).map(row => ({
        time: String(row.time),
        value: Number(row[seriesKey]),
      }))
  const values = rows.map(row => row.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const n = values.length

  const x = (i: number) => padL + (n === 1 ? 0 : (i * plotW) / (n - 1))
  const y = (v: number) => padT + (1 - (v - min) / range) * plotH

  const linePts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const areaPts = `${padL},${padT + plotH} ${linePts} ${x(n - 1)},${padT + plotH}`
  const latestValue = values[n - 1]
  const latestX = x(n - 1)
  const latestY = y(latestValue)

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => min + t * range)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img"
         style={{ display: 'block' }}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={accent} stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* gridlines + y labels */}
      {yTicks.map((v, i) => {
        const yy = y(v)
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke={C.chartGrid} strokeWidth={1}/>
            <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize={11} fill={C.textFaint}>
              {Math.round(v).toLocaleString()}
            </text>
          </g>
        )
      })}

      {/* x labels */}
      {rows.map((r, i) => (
        i % 2 === 0 ? (
          <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize={11} fill={C.textFaint}>
            {String(r.time)}
          </text>
        ) : null
      ))}

      <polygon points={areaPts} fill="url(#trendFill)"/>
      <polyline points={linePts} fill="none" stroke={accent} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#fff" stroke={accent} strokeWidth={2}/>
      ))}
      <g>
        <circle cx={latestX} cy={latestY} r={5} fill="#fff" stroke={accent} strokeWidth={2.5}/>
        <text className="chart-callout" x={latestX - 10} y={latestY - 10} textAnchor="end" fontSize={11} fontWeight={800} fill={accent}>
          {Math.round(latestValue).toLocaleString()}{unit ? ` ${unit}` : ''}
        </text>
      </g>

      {unit && (
        <text x={padL - 8} y={padT - 4} textAnchor="end" fontSize={10} fill={C.textFaint}>{unit}</text>
      )}
    </svg>
  )
}

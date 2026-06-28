import { apiFetch } from './api'

// ── Response types (mirror backend schemas/monitoring.py Phase A+B) ──────────

export interface FactoryOverviewSummary {
  data_available: boolean
  factory_active_power_kw: number
  factory_power_source: string | null
  total_energy_kwh: number
  daily_energy_kwh: number
  daily_energy_source: string | null
  peak_demand_kw: number
  as_of: string | null
}

export interface DashboardTrendPoint {
  bucket: string
  value: number
}

export interface DashboardTrendResponse {
  data_available: boolean
  resolution: string
  points: DashboardTrendPoint[]
}

export interface SiteEnergyShareItem {
  site_id: number
  site_name: string
  energy_kwh: number
  pct: number
}

export interface SiteEnergyShareListResponse {
  data_available: boolean
  items: SiteEnergyShareItem[]
}

export interface SitePowerItem {
  site_id: number
  site_name: string
  value_kw: number
}

export interface SitePowerListResponse {
  data_available: boolean
  items: SitePowerItem[]
}

export interface DataFreshnessItem {
  site_id: number
  site_name: string
  last_ts: string | null
  age_seconds: number | null
  stale: boolean
}

export interface DataFreshnessResponse {
  data_available: boolean
  items: DataFreshnessItem[]
}

// ── Internal helper ─────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const entries: [string, string][] = Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => [k, String(v)])
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : ''
}

// ── Fetchers ─────────────────────────────────────────────────────────────────

export async function fetchOverviewSummary(
  token: string | null,
  params?: { start_ts?: string; end_ts?: string },
): Promise<FactoryOverviewSummary> {
  return apiFetch<FactoryOverviewSummary>(
    `/monitoring/dashboard/overview/summary${buildQuery(params ?? {})}`,
    {},
    token,
  )
}

export async function fetchOverviewPowerTrend(
  token: string | null,
  params?: { bucket_interval?: string; start_ts?: string; end_ts?: string },
): Promise<DashboardTrendResponse> {
  return apiFetch<DashboardTrendResponse>(
    `/monitoring/dashboard/overview/power-trend${buildQuery(params ?? {})}`,
    {},
    token,
  )
}

export async function fetchOverviewEnergyTrend(
  token: string | null,
  params?: { bucket_interval?: string; start_ts?: string; end_ts?: string },
): Promise<DashboardTrendResponse> {
  return apiFetch<DashboardTrendResponse>(
    `/monitoring/dashboard/overview/energy-trend${buildQuery(params ?? {})}`,
    {},
    token,
  )
}

export async function fetchOverviewEnergyShares(
  token: string | null,
  params?: { limit?: number; start_ts?: string; end_ts?: string },
): Promise<SiteEnergyShareListResponse> {
  return apiFetch<SiteEnergyShareListResponse>(
    `/monitoring/dashboard/overview/energy-shares${buildQuery(params ?? {})}`,
    {},
    token,
  )
}

export async function fetchOverviewTopConsumers(
  token: string | null,
  params?: { limit?: number; start_ts?: string; end_ts?: string },
): Promise<SiteEnergyShareListResponse> {
  return apiFetch<SiteEnergyShareListResponse>(
    `/monitoring/dashboard/overview/top-consumers${buildQuery(params ?? {})}`,
    {},
    token,
  )
}

export async function fetchOverviewSitePowerComparison(
  token: string | null,
  params?: { limit?: number; start_ts?: string; end_ts?: string },
): Promise<SitePowerListResponse> {
  return apiFetch<SitePowerListResponse>(
    `/monitoring/dashboard/overview/site-power-comparison${buildQuery(params ?? {})}`,
    {},
    token,
  )
}

export async function fetchOverviewDataFreshness(
  token: string | null,
): Promise<DataFreshnessResponse> {
  return apiFetch<DataFreshnessResponse>(
    '/monitoring/dashboard/overview/data-freshness',
    {},
    token,
  )
}

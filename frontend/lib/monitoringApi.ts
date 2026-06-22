import { apiFetch } from './api'

export interface MonitoringSite {
  id: number
  company_id?: number | null
  name: string
  description?: string | null
  location?: string | null
  is_active: boolean
}

export interface MonitoringTarget {
  id: number
  site_id: number
  name: string
  description?: string | null
  target_type?: string | null
  serial_number?: string | null
  is_active: boolean
}

export interface MonitoringLatestItem {
  target_id: number
  target_name: string
  parameter: string
  value: number
  unit?: string | null
  timestamp: string
  quality?: string | null
}

export interface MonitoringTrendPoint {
  timestamp: string
  value: number
  unit?: string | null
  parameter?: string | null
  quality?: string | null
}

function hasItems<T>(value: unknown): value is { items: T[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { items?: unknown }).items)
  )
}

function hasPoints(value: unknown): value is { points: MonitoringTrendPoint[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { points?: unknown }).points)
  )
}

export async function fetchMonitoringSites(token: string | null): Promise<MonitoringSite[]> {
  const response = await apiFetch<unknown>('/monitoring/sites', {}, token)
  return hasItems<MonitoringSite>(response) ? response.items : []
}

export async function fetchMonitoringTargets(token: string | null): Promise<MonitoringTarget[]> {
  const response = await apiFetch<unknown>('/monitoring/targets', {}, token)
  return hasItems<MonitoringTarget>(response) ? response.items : []
}

export async function fetchMonitoringLatest(
  token: string | null,
  targetId: number,
): Promise<MonitoringLatestItem[]> {
  const response = await apiFetch<unknown>(`/monitoring/latest?target_id=${targetId}`, {}, token)
  return hasItems<MonitoringLatestItem>(response) ? response.items : []
}

export async function fetchMonitoringTrends(
  token: string | null,
  params: {
    targetId: number
    parameter: string
    resolution: string
    limit: number
  },
): Promise<MonitoringTrendPoint[]> {
  const query = new URLSearchParams({
    target_id: String(params.targetId),
    parameter: params.parameter,
    resolution: params.resolution,
    limit: String(params.limit),
  })
  const response = await apiFetch<unknown>(`/monitoring/trends?${query.toString()}`, {}, token)
  return hasPoints(response) ? response.points : []
}

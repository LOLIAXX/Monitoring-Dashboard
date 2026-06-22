// Static mock data for the Factory Overview page.
// Plain TS — no 'use client'. Safe to import from client or server components.

export const GRID_DEMAND_BARS = [
  { h: 40 }, { h: 55 }, { h: 70 }, { h: 60 }, { h: 85 }, { h: 95 },
] as const

export const RENEWABLE_GAUGE = {
  percentage: 64,
  circumference: 251.3,
  solar: 420,
  wind: 376,
} as const

export const SYSTEM_ALERTS = [
  {
    type: 'error' as const,
    label: 'Peak Load Warning',
    sub: 'Shed A · 94% capacity',
    color: '#ba1a1a',
    bg: 'rgba(186,26,26,0.08)',
    border: '#ba1a1a',
  },
  {
    type: 'success' as const,
    label: 'Optimization Ready',
    sub: 'AI · 3 actions avail.',
    color: '#004e32',
    bg: 'rgba(0,78,50,0.08)',
    border: '#004e32',
  },
] as const

export const KPI_GRID_SUB   = { peak: '1,312', avg: '1,187' } as const
export const KPI_RENEW_SUB  = { co2: '4.2 tCO₂e', cost: '$1,240' } as const
export const KPI_ALERTS_SUB = { active: 2, uptime: '98.4%' } as const

export const HOTSPOT_STATUS_COLORS = {
  normal: '#0EA5E9',
  warning: '#F59E0B',
  critical: '#EF4444',
  producer: '#10B981',
  offline: '#64748B',
} as const

// Percentage-based hotspot anchors for the factory overview image.
export const HOTSPOT_DOTS = [
  { id: 'west-shed-01', assetName: 'West Production Shed 01', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 44, left: 8.8, currentPowerKw: 62, todayEnergyKwh: 1180, voltage: '400 V', current: '96 A', powerFactor: '0.95', loadPct: 64, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'west-shed-02', assetName: 'West Production Shed 02', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 41, left: 15.2, currentPowerKw: 74, todayEnergyKwh: 1345, voltage: '400 V', current: '112 A', powerFactor: '0.94', loadPct: 71, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'west-utilities', assetName: 'West Utility Annex', assetType: 'Utility area', status: 'warning', statusLabel: 'Warning', top: 35, left: 19.2, currentPowerKw: 28, todayEnergyKwh: 522, voltage: '400 V', current: '44 A', powerFactor: '0.88', loadPct: 79, statusColor: HOTSPOT_STATUS_COLORS.warning },
  { id: 'admin-tower-north', assetName: 'North Admin Tower', assetType: 'Office', status: 'normal', statusLabel: 'Normal', top: 25, left: 26.4, currentPowerKw: 18, todayEnergyKwh: 326, voltage: '230 V', current: '28 A', powerFactor: '0.97', loadPct: 42, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'engineering-office', assetName: 'Engineering Office', assetType: 'Office', status: 'normal', statusLabel: 'Normal', top: 39, left: 23.4, currentPowerKw: 21, todayEnergyKwh: 390, voltage: '230 V', current: '31 A', powerFactor: '0.96', loadPct: 46, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'packaging-hall-west', assetName: 'West Packaging Hall', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 62, left: 17.4, currentPowerKw: 86, todayEnergyKwh: 1572, voltage: '400 V', current: '132 A', powerFactor: '0.93', loadPct: 76, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'south-production-01', assetName: 'South Production Shed 01', assetType: 'Production shed', status: 'critical', statusLabel: 'Critical', top: 69, left: 8.8, currentPowerKw: 112, todayEnergyKwh: 1960, voltage: '400 V', current: '178 A', powerFactor: '0.84', loadPct: 94, statusColor: HOTSPOT_STATUS_COLORS.critical },
  { id: 'south-admin-block', assetName: 'South Admin Block', assetType: 'Office', status: 'normal', statusLabel: 'Normal', top: 69, left: 24.1, currentPowerKw: 16, todayEnergyKwh: 288, voltage: '230 V', current: '25 A', powerFactor: '0.98', loadPct: 38, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'south-logistics', assetName: 'South Logistics Hall', assetType: 'Utility area', status: 'normal', statusLabel: 'Normal', top: 79, left: 20.6, currentPowerKw: 54, todayEnergyKwh: 940, voltage: '400 V', current: '82 A', powerFactor: '0.92', loadPct: 58, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'south-warehouse', assetName: 'Finished Goods Warehouse', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 74, left: 31.7, currentPowerKw: 46, todayEnergyKwh: 805, voltage: '400 V', current: '70 A', powerFactor: '0.94', loadPct: 51, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'central-cold-store', assetName: 'Central Cold Store', assetType: 'Utility area', status: 'warning', statusLabel: 'Warning', top: 53, left: 27.2, currentPowerKw: 69, todayEnergyKwh: 1268, voltage: '400 V', current: '104 A', powerFactor: '0.89', loadPct: 83, statusColor: HOTSPOT_STATUS_COLORS.warning },
  { id: 'central-assembly', assetName: 'Central Assembly Hall', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 65, left: 39.8, currentPowerKw: 77, todayEnergyKwh: 1410, voltage: '400 V', current: '118 A', powerFactor: '0.95', loadPct: 69, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'north-process-01', assetName: 'North Process Hall 01', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 21, left: 37.5, currentPowerKw: 93, todayEnergyKwh: 1645, voltage: '400 V', current: '142 A', powerFactor: '0.94', loadPct: 74, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'north-warehouse-01', assetName: 'North Warehouse 01', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 17, left: 43.5, currentPowerKw: 48, todayEnergyKwh: 870, voltage: '400 V', current: '73 A', powerFactor: '0.96', loadPct: 49, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'north-packing-02', assetName: 'North Packing Hall 02', assetType: 'Production shed', status: 'offline', statusLabel: 'Offline', top: 30, left: 38.1, currentPowerKw: 0, todayEnergyKwh: 212, voltage: '0 V', current: '0 A', powerFactor: '0.00', loadPct: 0, statusColor: HOTSPOT_STATUS_COLORS.offline },
  { id: 'main-substation', assetName: '63kV Main Substation', assetType: 'Main substation', status: 'warning', statusLabel: 'Warning', top: 45, left: 49.0, currentPowerKw: 1245, todayEnergyKwh: 22480, voltage: '63 kV', current: '18 A', powerFactor: '0.91', loadPct: 82, statusColor: HOTSPOT_STATUS_COLORS.warning },
  { id: 'east-process-01', assetName: 'East Process Hall 01', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 24, left: 57.0, currentPowerKw: 88, todayEnergyKwh: 1518, voltage: '400 V', current: '134 A', powerFactor: '0.94', loadPct: 72, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'east-process-02', assetName: 'East Process Hall 02', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 29, left: 59.0, currentPowerKw: 81, todayEnergyKwh: 1432, voltage: '400 V', current: '126 A', powerFactor: '0.95', loadPct: 68, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'east-process-03', assetName: 'East Process Hall 03', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 21, left: 66.0, currentPowerKw: 71, todayEnergyKwh: 1295, voltage: '400 V', current: '109 A', powerFactor: '0.96', loadPct: 61, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'east-admin-tower', assetName: 'East Admin Tower', assetType: 'Office', status: 'normal', statusLabel: 'Normal', top: 22, left: 74.0, currentPowerKw: 19, todayEnergyKwh: 350, voltage: '230 V', current: '30 A', powerFactor: '0.97', loadPct: 41, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'east-cold-store', assetName: 'East Cold Store', assetType: 'Utility area', status: 'warning', statusLabel: 'Warning', top: 35, left: 69.0, currentPowerKw: 63, todayEnergyKwh: 1125, voltage: '400 V', current: '97 A', powerFactor: '0.88', loadPct: 81, statusColor: HOTSPOT_STATUS_COLORS.warning },
  { id: 'east-warehouse-02', assetName: 'East Warehouse 02', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 41, left: 75.5, currentPowerKw: 55, todayEnergyKwh: 965, voltage: '400 V', current: '84 A', powerFactor: '0.94', loadPct: 57, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'far-east-shed-01', assetName: 'Far East Production Shed 01', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 31, left: 82.0, currentPowerKw: 64, todayEnergyKwh: 1178, voltage: '400 V', current: '98 A', powerFactor: '0.95', loadPct: 63, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'far-east-shed-02', assetName: 'Far East Production Shed 02', assetType: 'Production shed', status: 'normal', statusLabel: 'Normal', top: 36, left: 83.0, currentPowerKw: 58, todayEnergyKwh: 1048, voltage: '400 V', current: '89 A', powerFactor: '0.96', loadPct: 59, statusColor: HOTSPOT_STATUS_COLORS.normal },
  { id: 'pv-field', assetName: 'PV Plant Array', assetType: 'PV plant', status: 'producer', statusLabel: 'Producer', top: 57, left: 82.0, currentPowerKw: 420, todayEnergyKwh: 5890, voltage: '800 Vdc', current: '525 A', powerFactor: '1.00', loadPct: 64, statusColor: HOTSPOT_STATUS_COLORS.producer },
  { id: 'pv-inverters', assetName: 'PV Inverter Yard', assetType: 'Utility area', status: 'producer', statusLabel: 'Producer', top: 62, left: 71.5, currentPowerKw: 392, todayEnergyKwh: 5480, voltage: '400 Vac', current: '566 A', powerFactor: '0.99', loadPct: 61, statusColor: HOTSPOT_STATUS_COLORS.producer },
  { id: 'generator-01', assetName: 'Generator Set 01', assetType: 'Generator', status: 'producer', statusLabel: 'Producer', top: 71, left: 58.5, currentPowerKw: 310, todayEnergyKwh: 2410, voltage: '400 V', current: '447 A', powerFactor: '0.90', loadPct: 72, statusColor: HOTSPOT_STATUS_COLORS.producer },
  { id: 'generator-02', assetName: 'Generator Set 02', assetType: 'Generator', status: 'producer', statusLabel: 'Producer', top: 66, left: 67.0, currentPowerKw: 286, todayEnergyKwh: 2198, voltage: '400 V', current: '413 A', powerFactor: '0.89', loadPct: 68, statusColor: HOTSPOT_STATUS_COLORS.producer },
  { id: 'generator-03', assetName: 'Generator Set 03', assetType: 'Generator', status: 'offline', statusLabel: 'Offline', top: 60, left: 73.0, currentPowerKw: 0, todayEnergyKwh: 720, voltage: '0 V', current: '0 A', powerFactor: '0.00', loadPct: 0, statusColor: HOTSPOT_STATUS_COLORS.offline },
] as const

export const HOTSPOT_AREAS = [
  {
    id: 'shed-a',
    label: 'Industrial Shed A',
    top: 15, left: 25, w: 18, h: 15,
    kw: 45, status: 'Active' as const,
    efficiency: '94.2%', barPct: 65,
    statusColor: '#004e32',
  },
  {
    id: 'office-1',
    label: 'Admin Office 1',
    top: 30, left: 55, w: 12, h: 20,
    kw: 12, status: 'Active' as const,
    efficiency: '91.0%', barPct: 18,
    statusColor: '#004e32',
  },
  {
    id: 'storage-b',
    label: 'Storage Facility B',
    top: 65, left: 50, w: 20, h: 20,
    kw: 8, status: 'Standby' as const,
    efficiency: '—', barPct: 12,
    statusColor: '#d97706',
  },
  {
    id: 'loading-dock',
    label: 'Loading Dock',
    top: 55, left: 75, w: 15, h: 15,
    kw: 4, status: 'Idle' as const,
    efficiency: '—', barPct: 6,
    statusColor: '#434654',
  },
] as const

export const MANAGER_SUMMARY_METRICS = [
  {
    label: 'Energy today',
    value: '38.6',
    unit: 'MWh',
    note: '+6.4% vs 7-day avg',
    tone: 'warning',
  },
  {
    label: 'Cost impact',
    value: '$4,820',
    unit: 'today',
    note: '$610 above target',
    tone: 'critical',
  },
  {
    label: 'Peak demand',
    value: '1,312',
    unit: 'kW',
    note: '14:10 local time',
    tone: 'warning',
  },
  {
    label: 'Production efficiency',
    value: '0.82',
    unit: 'kWh/kg',
    note: '3 areas improving',
    tone: 'normal',
  },
] as const

export const MANAGER_FACTORY_CONSUMPTION = [
  { site: 'Site Alpha', factory: 'Main Dairy Line', energyMwh: 11.8, cost: '$1,475', peakKw: 412, production: '14.2 t', ratio: '0.83', trend: '+4.8%', tone: 'warning' },
  { site: 'Site Alpha', factory: 'Cold Chain', energyMwh: 8.4, cost: '$1,120', peakKw: 318, production: '24h hold', ratio: '0.91', trend: '+9.2%', tone: 'critical' },
  { site: 'Site Alpha', factory: 'Packaging', energyMwh: 6.9, cost: '$845', peakKw: 236, production: '52k units', ratio: '0.74', trend: '-2.1%', tone: 'normal' },
  { site: 'Site Beta', factory: 'Dry Goods', energyMwh: 5.7, cost: '$690', peakKw: 184, production: '31k units', ratio: '0.68', trend: '-5.6%', tone: 'normal' },
  { site: 'Site Gamma', factory: 'Utilities', energyMwh: 5.8, cost: '$690', peakKw: 162, production: 'Shared', ratio: '0.79', trend: '+1.4%', tone: 'normal' },
] as const

export const MANAGER_CONSUMPTION_SHARE = [
  { area: 'Main Dairy Line', pct: 31, mwh: 11.8, color: '#0EA5E9' },
  { area: 'Cold Chain', pct: 22, mwh: 8.4, color: '#EF4444' },
  { area: 'Packaging', pct: 18, mwh: 6.9, color: '#10B981' },
  { area: 'Dry Goods', pct: 15, mwh: 5.7, color: '#2563EB' },
  { area: 'Utilities', pct: 14, mwh: 5.8, color: '#F59E0B' },
] as const

export const MANAGER_MONTHLY_TREND = [
  { month: 'Jan', energy: 68, cost: 62, production: 71 },
  { month: 'Feb', energy: 72, cost: 66, production: 74 },
  { month: 'Mar', energy: 76, cost: 73, production: 79 },
  { month: 'Apr', energy: 71, cost: 70, production: 82 },
  { month: 'May', energy: 84, cost: 88, production: 81 },
  { month: 'Jun', energy: 79, cost: 83, production: 86 },
] as const

export const MANAGER_EFFICIENCY_RANKING = [
  { area: 'Packaging', score: 94, delta: '+3.1%', tone: 'normal' },
  { area: 'Dry Goods', score: 91, delta: '+1.8%', tone: 'normal' },
  { area: 'Main Dairy Line', score: 84, delta: '-0.6%', tone: 'warning' },
  { area: 'Utilities', score: 79, delta: '+0.4%', tone: 'warning' },
  { area: 'Cold Chain', score: 68, delta: '-4.2%', tone: 'critical' },
] as const

export const MANAGER_RISK_SUMMARY = [
  { label: 'High cost variance', count: 2, detail: 'Cold Chain, Dairy Line', tone: 'critical' },
  { label: 'Peak demand risk', count: 3, detail: 'Next 90 minutes', tone: 'warning' },
  { label: 'Offline producer assets', count: 1, detail: 'Generator Set 03', tone: 'offline' },
] as const

export const MANAGER_ABNORMAL_USAGE = [
  { area: 'Cold Chain compressors', value: '+18.4%', detail: 'Night load did not drop after 01:00', tone: 'critical' },
  { area: 'West Utility Annex', value: '+11.2%', detail: 'Power factor below expected band', tone: 'warning' },
  { area: 'PV inverter yard', value: '-7.8%', detail: 'Generation below irradiance estimate', tone: 'warning' },
] as const

export const MANAGER_AREA_PERFORMANCE = {
  best: [
    { area: 'Packaging', metric: '0.74 kWh / 1k units', note: 'Best conversion rate today' },
    { area: 'Dry Goods', metric: '$0.022 / unit', note: 'Lowest unit energy cost' },
  ],
  worst: [
    { area: 'Cold Chain', metric: '+$410 variance', note: 'Highest abnormal baseline load' },
    { area: 'Main Dairy Line', metric: '412 kW peak', note: 'Largest peak-demand contributor' },
  ],
} as const

export const REFERENCE_TIMESTAMP = '2024-05-24 14:32:01'

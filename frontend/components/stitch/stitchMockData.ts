// ── Overview ────────────────────────────────────────────────────────────────
export const OVERVIEW_KPIS = [
  { label: 'Total Power Usage',  value: '1,240', unit: 'kW',   delta: '+2.4%',     sub: 'vs last hour'   },
  { label: 'Today Consumption',  value: '14.2',  unit: 'MWh',  delta: '+1.1%',     sub: 'running total'  },
  { label: 'Peak Demand',        value: '1,450', unit: 'kW',   delta: '10:30 AM',  sub: "today's peak"   },
  { label: 'Estimated Cost',     value: '$1,845',unit: '',      delta: 'today',     sub: 'at current rate'},
  { label: 'Active Alerts',      value: '2',     unit: '',      delta: '1 critical',sub: '1 warning'      },
  { label: 'Online Devices',     value: '124',   unit: '/128',  delta: '96.9%',     sub: 'availability'   },
]

export const OVERVIEW_SITES = [
  { name: 'Factory Site A',              status: 'Online',  power: '1,240 kW', devices: '128/128', alerts: 2 },
  { name: 'Domain Site B',               status: 'Online',  power: '980 kW',   devices: '96/96',   alerts: 0 },
  { name: 'Precision Manufacturing C',   status: 'Online',  power: '755 kW',   devices: '64/64',   alerts: 1 },
  { name: 'Warehouse Site D',            status: 'Warning', power: '430 kW',   devices: '41/48',   alerts: 3 },
]

export const OVERVIEW_TOP_CONSUMERS = [
  { name: 'Spinning Line 1',     kw: 312, pct: 0.25 },
  { name: 'Spinning Line 2',     kw: 286, pct: 0.23 },
  { name: 'Weaving & Finishing', kw: 248, pct: 0.20 },
  { name: 'Dyeing & Treatment',  kw: 211, pct: 0.17 },
  { name: 'Assembly & QC',       kw: 124, pct: 0.10 },
]

export const OVERVIEW_ALERTS = [
  { level: 'critical', msg: 'Phase Imbalance at Substation 04',  time: '10:42 AM' },
  { level: 'warning',  msg: 'Weaving zone demand spike (+18%)',   time: '09:41 AM' },
  { level: 'info',     msg: 'Daily energy report generated',      time: '08:00 AM' },
]

// ── Substation ───────────────────────────────────────────────────────────────
export const SUB_KPIS = [
  { label: 'Total Active Power', value: '3.94',  unit: 'MW'  },
  { label: 'Apparent Power',     value: '4.12',  unit: 'MVA' },
  { label: 'Avg Power Factor',   value: '0.956', unit: ''    },
  { label: 'Frequency',          value: '50.01', unit: 'Hz'  },
]

export const SUB_PHASES = [
  { phase: 'Phase A', voltage: '11.02 kV', current: '118 A', power: '1.30 MW', pf: '0.97', status: 'normal'  },
  { phase: 'Phase B', voltage: '10.98 kV', current: '122 A', power: '1.34 MW', pf: '0.96', status: 'normal'  },
  { phase: 'Phase C', voltage: '10.94 kV', current: '119 A', power: '1.30 MW', pf: '0.95', status: 'warning' },
]

export const SUB_FEEDERS = [
  { id: 'F-01', name: 'Spinning Hall',      load: '850 kW', pct: 0.68, status: 'normal' },
  { id: 'F-02', name: 'Weaving Block',      load: '620 kW', pct: 0.50, status: 'normal' },
  { id: 'F-03', name: 'Dyeing & Finishing', load: '980 kW', pct: 0.78, status: 'high'   },
  { id: 'F-04', name: 'Assembly & QC',      load: '310 kW', pct: 0.25, status: 'normal' },
  { id: 'F-05', name: 'Admin & HVAC',       load: '180 kW', pct: 0.14, status: 'normal' },
]

export const SUB_EVENTS = [
  { time: '10:42 AM',  type: 'fault',    msg: 'Phase C voltage imbalance detected (−0.7%)' },
  { time: '09:15 AM',  type: 'info',     msg: 'Load transfer F-03 → F-06 (maintenance mode)' },
  { time: '08:00 AM',  type: 'info',     msg: 'Substation daily health check passed' },
  { time: 'Yesterday', type: 'resolved', msg: 'Overcurrent relay F-02 reset successfully' },
]

// ── Substation Sonergy ────────────────────────────────────────────────────────
export const SONO_KPIS = [
  { label: 'Total Active Power', value: '8.00',  unit: 'MW' },
  { label: 'Grid Voltage',       value: '63.04', unit: 'kV' },
  { label: 'Avg Power Factor',   value: '0.977', unit: ''   },
  { label: 'THD',                value: '1.8',   unit: '%'  },
]

export const SONO_PHASES = [
  { phase: 'Phase A', voltage: '63.14 kV', current: '42 A', power: '2.65 MW', pf: '0.98', status: 'normal' },
  { phase: 'Phase B', voltage: '63.08 kV', current: '44 A', power: '2.77 MW', pf: '0.98', status: 'normal' },
  { phase: 'Phase C', voltage: '62.91 kV', current: '41 A', power: '2.58 MW', pf: '0.97', status: 'normal' },
]

export const SONO_TRANSFORMERS = [
  { id: 'TR-01', ratio: '63kV/11kV',  capacity: '20 MVA', load: '78%', status: 'normal' },
  { id: 'TR-02', ratio: '63kV/11kV',  capacity: '20 MVA', load: '42%', status: 'normal' },
  { id: 'TR-03', ratio: '11kV/0.4kV', capacity: '2 MVA',  load: '91%', status: 'high'   },
]

// ── Alerts ───────────────────────────────────────────────────────────────────
export const ALERTS_DATA = [
  { id: 'ALT-001', severity: 'critical', type: 'Phase Deviation', location: 'Substation 04',        msg: 'Phase C voltage imbalance (−0.7% from nominal)', time: '10:42 AM',  status: 'Active',   mttr: null   },
  { id: 'ALT-002', severity: 'warning',  type: 'Demand Spike',    location: 'Weaving Block F-03',   msg: 'Load exceeded 78% capacity threshold',           time: '09:41 AM',  status: 'Active',   mttr: null   },
  { id: 'ALT-003', severity: 'warning',  type: 'Comms Timeout',   location: 'Site D — Device #47',  msg: 'Device offline >15 min',                         time: '08:41 AM',  status: 'Active',   mttr: null   },
  { id: 'ALT-004', severity: 'info',     type: 'Maintenance',     location: 'Feeder F-02',           msg: 'Scheduled maintenance mode activated',           time: '09:15 AM',  status: 'Resolved', mttr: '0.8h' },
  { id: 'ALT-005', severity: 'info',     type: 'Report Ready',    location: 'System',                msg: 'Daily energy performance report available',      time: '08:00 AM',  status: 'Resolved', mttr: null   },
  { id: 'ALT-006', severity: 'critical', type: 'Overcurrent',     location: 'Substation 02 F-07',   msg: 'Relay trip; auto-reset attempted',               time: 'Yesterday', status: 'Resolved', mttr: '1.2h' },
]

// ── Reports ──────────────────────────────────────────────────────────────────
export const REPORTS_DAILY = [
  { id: 'RPT-D-2046', title: 'Daily Energy Summary — 2026-06-07', generated: '08:00 AM today',    size: '142 KB' },
  { id: 'RPT-D-2045', title: 'Daily Energy Summary — 2026-06-06', generated: '08:00 AM yesterday', size: '138 KB' },
  { id: 'RPT-D-2044', title: 'Daily Energy Summary — 2026-06-05', generated: '08:00 AM',           size: '151 KB' },
]
export const REPORTS_WEEKLY = [
  { id: 'RPT-W-0294', title: 'Weekly Performance — W23 2026', generated: 'Jun 2, 2026',  size: '820 KB' },
  { id: 'RPT-W-0293', title: 'Weekly Performance — W22 2026', generated: 'May 26, 2026', size: '805 KB' },
]
export const REPORTS_MONTHLY = [
  { id: 'RPT-M-0067', title: 'Monthly Report — May 2026', generated: 'Jun 1, 2026', size: '2.4 MB' },
  { id: 'RPT-M-0066', title: 'Monthly Report — Apr 2026', generated: 'May 1, 2026', size: '2.2 MB' },
  { id: 'RPT-M-0065', title: 'Monthly Report — Mar 2026', generated: 'Apr 1, 2026', size: '2.3 MB' },
]

// ── Analytics ────────────────────────────────────────────────────────────────
export const ANALYTICS_TRENDS = [
  { label: 'Factory Site A', values: [1240, 1180, 1310, 1420, 1290, 1350, 1240], color: '#2563EB' },
  { label: 'Domain Site B',  values: [980,  940,  1010, 1080, 970,  1020, 980],  color: '#10B981' },
  { label: 'Site C',         values: [755,  720,  780,  830,  760,  795,  755],  color: '#F59E0B' },
]

// ── Sites Config ─────────────────────────────────────────────────────────────
export const SITES_CONFIG = [
  { code: 'FSA', name: 'Factory Site A',        city: 'Tehran',  factories: 3, zones: 12, substations: 8, devices: 128, status: 'Active'      },
  { code: 'DSB', name: 'Domain Site B',         city: 'Isfahan', factories: 2, zones: 8,  substations: 5, devices: 96,  status: 'Active'      },
  { code: 'PMC', name: 'Precision Mfg Site C',  city: 'Shiraz',  factories: 2, zones: 6,  substations: 4, devices: 64,  status: 'Active'      },
  { code: 'WSD', name: 'Warehouse Site D',      city: 'Tabriz',  factories: 1, zones: 4,  substations: 3, devices: 48,  status: 'Maintenance' },
]

export const FACTORIES_CONFIG = [
  { site: 'FSA', id: 'FAC-01', name: 'Spinning & Weaving Plant', floors: 2, area: '12,400 m²', zones: 4, devices: 48 },
  { site: 'FSA', id: 'FAC-02', name: 'Dyeing & Finishing Block', floors: 1, area: '8,200 m²',  zones: 5, devices: 52 },
  { site: 'FSA', id: 'FAC-03', name: 'Assembly & QC Hall',       floors: 1, area: '5,600 m²',  zones: 3, devices: 28 },
  { site: 'DSB', id: 'FAC-04', name: 'Production Line B1',       floors: 2, area: '9,100 m²',  zones: 4, devices: 46 },
  { site: 'DSB', id: 'FAC-05', name: 'Storage & Distribution',   floors: 1, area: '6,800 m²',  zones: 4, devices: 50 },
]

// ── Users ────────────────────────────────────────────────────────────────────
export const USERS_DATA = [
  { id: 1, name: 'Kamyar Rezaie',   email: 'kamy_rezaie@yahoo.com', role: 'Super Admin',  site: 'All Sites', lastActive: '10:44 AM today', status: 'Active'   },
  { id: 2, name: 'Ali Mohammadi',   email: 'ali.m@sonergy.ir',       role: 'Site Manager', site: 'FSA',       lastActive: '09:30 AM today', status: 'Active'   },
  { id: 3, name: 'Sara Karimi',     email: 's.karimi@sonergy.ir',    role: 'Analyst',      site: 'FSA, DSB',  lastActive: '08:15 AM today', status: 'Active'   },
  { id: 4, name: 'Hassan Hosseini', email: 'h.hosseini@sonergy.ir',  role: 'Operator',     site: 'DSB',       lastActive: 'Yesterday',      status: 'Active'   },
  { id: 5, name: 'Maryam Tehrani',  email: 'm.tehrani@sonergy.ir',   role: 'Site Manager', site: 'PMC',       lastActive: '2 days ago',     status: 'Active'   },
  { id: 6, name: 'Reza Ahmadi',     email: 'r.ahmadi@sonergy.ir',    role: 'Operator',     site: 'WSD',       lastActive: '1 week ago',     status: 'Inactive' },
]

export const ROLES_DATA = [
  { name: 'Super Admin',  users: 1, desc: 'Full system access across all sites and configurations' },
  { name: 'Site Manager', users: 2, desc: 'Manage assigned sites, view all data, edit configuration' },
  { name: 'Analyst',      users: 1, desc: 'Read-only access to reports, analytics, and dashboards' },
  { name: 'Operator',     users: 2, desc: 'Monitor live data and acknowledge alerts for assigned site' },
]

// ── Devices ──────────────────────────────────────────────────────────────────
export const DEVICES_DATA = [
  { id: 'DEV-0001', type: 'Smart Meter', location: 'FSA / Spinning Hall / Z1',  model: 'Schneider PM8000', fw: '2.4.1', status: 'Online',  seen: '10:45 AM'   },
  { id: 'DEV-0002', type: 'RTU',         location: 'FSA / Substation 04',        model: 'ABB RTU560',       fw: '5.1.0', status: 'Online',  seen: '10:45 AM'   },
  { id: 'DEV-0003', type: 'Relay',       location: 'FSA / Feeder F-03',          model: 'SEL-351',          fw: 'R108',  status: 'Online',  seen: '10:44 AM'   },
  { id: 'DEV-0004', type: 'Smart Meter', location: 'FSA / Dyeing Block / Z2',    model: 'Schneider PM8000', fw: '2.4.1', status: 'Online',  seen: '10:43 AM'   },
  { id: 'DEV-0005', type: 'Gateway',     location: 'DSB / Substation 02',        model: 'Moxa MGate 5217',  fw: '4.0',   status: 'Online',  seen: '10:45 AM'   },
  { id: 'DEV-0006', type: 'RTU',         location: 'WSD / Main Distribution',    model: 'ABB RTU560',       fw: '5.0.9', status: 'Offline', seen: '08:26 AM'   },
  { id: 'DEV-0007', type: 'Smart Meter', location: 'WSD / Zone-4',               model: 'Landis+Gyr E650',  fw: '1.9.2', status: 'Offline', seen: '3 days ago' },
  { id: 'DEV-0008', type: 'Relay',       location: 'PMC / Substation 06',        model: 'SEL-311C',         fw: 'R117',  status: 'Online',  seen: '10:44 AM'   },
  { id: 'DEV-0009', type: 'Gateway',     location: 'FSA / Control Room',         model: 'Moxa MGate 5217',  fw: '4.1',   status: 'Pending', seen: 'Never'      },
]

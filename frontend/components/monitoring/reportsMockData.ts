import { C } from './monitoringColors'

export const REPORT_SUMMARY_CARDS = [
  { label: 'Reports Generated', value: '128', detail: 'This month', tone: 'blue' },
  { label: 'Scheduled Reports', value: '18', detail: 'Active schedules', tone: 'cyan' },
  { label: 'Pending Reviews', value: '7', detail: 'Awaiting manager sign-off', tone: 'amber' },
  { label: 'KPI Alerts', value: '4', detail: 'Needs attention', tone: 'rose' },
  { label: 'Energy Saving Opportunities', value: '12', detail: 'Open actions', tone: 'emerald' },
  { label: 'Last Export', value: '08:30', detail: 'Daily summary PDF', tone: 'slate' },
] as const

export const ANALYSIS_OVERVIEW_CARDS = [
  { label: 'Total energy consumption trend', value: '-4.8%', detail: 'Lower than last comparable period', status: 'Improving', tone: 'good', progress: 74 },
  { label: 'Peak demand risk', value: 'Medium', detail: 'Two sites near contracted threshold', status: 'Watch', tone: 'warning', progress: 62 },
  { label: 'Cost variance', value: '+3.1%', detail: 'Tariff impact concentrated in peak hours', status: 'Review', tone: 'warning', progress: 58 },
  { label: 'Power quality status', value: 'Stable', detail: 'Voltage and frequency within operating band', status: 'Healthy', tone: 'good', progress: 88 },
  { label: 'Efficiency opportunity', value: '9.6 MWh', detail: 'Estimated avoidable overnight load', status: 'Actionable', tone: 'info', progress: 69 },
  { label: 'CO2 reduction estimate', value: '18.4 t', detail: 'Avoided emissions from renewables and efficiency', status: 'On track', tone: 'good', progress: 82 },
] as const

export const RECENT_REPORTS = [
  { name: 'Daily Energy Summary', type: 'Operational', scope: 'Site Alpha', period: 'Today', owner: 'Ops Manager', status: 'Ready', tone: 'good', generated: '08:30' },
  { name: 'Monthly Cost Analysis', type: 'Finance', scope: 'All sites', period: 'May 2026', owner: 'Energy Lead', status: 'Review', tone: 'warning', generated: 'Jun 01' },
  { name: 'Peak Demand Review', type: 'Demand', scope: 'UHT + Boiler', period: 'Last 7 days', owner: 'Plant Manager', status: 'Ready', tone: 'good', generated: 'Yesterday' },
  { name: 'Power Quality Report', type: 'Quality', scope: 'Substations', period: 'This week', owner: 'Electrical Team', status: 'Scheduled', tone: 'info', generated: 'Tonight' },
  { name: 'Site Comparison Analysis', type: 'Comparison', scope: '5 areas', period: 'Quarter', owner: 'Analytics', status: 'Draft', tone: 'slate', generated: 'May 29' },
  { name: 'ISO 50001 Energy Review', type: 'Compliance', scope: 'Corporate', period: 'YTD', owner: 'Compliance', status: 'Review', tone: 'warning', generated: 'May 27' },
] as const

export const ANALYSIS_MODULES = [
  { title: 'Consumption Analysis', description: 'Break down load patterns by site, area, and operating period.', metric: '38.6 MWh today', status: 'Normal', tone: 'good', progress: 72 },
  { title: 'Cost Analysis', description: 'Review tariff exposure, peak-hour costs, and monthly variance.', metric: '$42.8k MTD', status: 'Watch', tone: 'warning', progress: 58 },
  { title: 'Peak Demand Analysis', description: 'Track demand peaks against contracted thresholds and limits.', metric: '1,312 kW peak', status: 'Review', tone: 'warning', progress: 81 },
  { title: 'Power Quality Analysis', description: 'Monitor voltage, frequency, harmonics, and factor stability.', metric: '0.96 PF', status: 'Healthy', tone: 'good', progress: 92 },
  { title: 'Site Comparison', description: 'Compare sites and factories by energy, cost, and intensity.', metric: '5 focus areas', status: 'Ready', tone: 'info', progress: 66 },
  { title: 'Efficiency Opportunities', description: 'Prioritize savings actions with the clearest operating impact.', metric: '12 actions', status: 'Actionable', tone: 'good', progress: 78 },
] as const

export const KPI_REPORT_CARDS = [
  { name: 'Energy Intensity', value: '0.82 kWh/unit', target: '0.78', variance: '+5.1%', tone: 'warning', progress: 76 },
  { name: 'Cost per Unit', value: '$0.118', target: '$0.110', variance: '+7.3%', tone: 'warning', progress: 69 },
  { name: 'Peak Demand', value: '1,312 kW', target: '1,250 kW', variance: '+5.0%', tone: 'warning', progress: 82 },
  { name: 'Power Factor', value: '0.96', target: '0.95', variance: '+1.1%', tone: 'good', progress: 96 },
  { name: 'Renewable Share', value: '18.7%', target: '20%', variance: '-1.3 pp', tone: 'info', progress: 84 },
  { name: 'CO2 Avoided', value: '18.4 t', target: '16.0 t', variance: '+15%', tone: 'good', progress: 91 },
] as const

export const KPI_REPORT_TABLE = [
  { name: 'Energy Intensity', current: '0.82 kWh/unit', target: '0.78', variance: '+5.1%', trend: 'Down 2.4%', status: 'Watch', tone: 'warning' },
  { name: 'Cost per Unit', current: '$0.118', target: '$0.110', variance: '+7.3%', trend: 'Up 1.2%', status: 'Review', tone: 'warning' },
  { name: 'Peak Demand', current: '1,312 kW', target: '1,250 kW', variance: '+62 kW', trend: 'Flat', status: 'Watch', tone: 'warning' },
  { name: 'Power Factor', current: '0.96', target: '0.95', variance: '+0.01', trend: 'Stable', status: 'Healthy', tone: 'good' },
  { name: 'Renewable Share', current: '18.7%', target: '20%', variance: '-1.3 pp', trend: 'Up 3.6%', status: 'On track', tone: 'info' },
  { name: 'CO2 Avoided', current: '18.4 t', target: '16.0 t', variance: '+2.4 t', trend: 'Up 8.9%', status: 'Healthy', tone: 'good' },
] as const

export const REPORT_ACTIONS = [
  { title: 'Build Custom Report', description: 'Choose scope, metrics, sections, and delivery format.', label: 'Open Builder', href: '/monitoring/reports/builder', tone: 'blue' },
  { title: 'Schedule Report', description: 'Create automated daily, weekly, or monthly report delivery.', label: 'Configure', href: '#', tone: 'cyan' },
  { title: 'KPI Workspace', description: 'Review KPI targets, variance, and manager action status.', label: 'Open KPIs', href: '/monitoring/reports/kpis', tone: 'emerald' },
  { title: 'Export PDF', description: 'Prepare a PDF export from the current dashboard view.', label: 'Prepare PDF', href: '#', tone: 'slate' },
  { title: 'Export Excel', description: 'Prepare spreadsheet-ready report tables and KPI data.', label: 'Prepare Excel', href: '#', tone: 'slate' },
  { title: 'Compare Sites', description: 'Open a side-by-side operational comparison for selected sites.', label: 'Compare', href: '#', tone: 'amber' },
] as const

export const REPORT_TEMPLATES = [
  { title: 'Daily Energy Summary', description: 'Daily operational consumption, peaks, exceptions, and actions.', frequency: 'Daily', sections: 7 },
  { title: 'Monthly Cost Analysis', description: 'Cost variance, tariff exposure, and monthly budget tracking.', frequency: 'Monthly', sections: 9 },
  { title: 'Peak Demand Report', description: 'Demand peaks, threshold risk, and contracted capacity review.', frequency: 'Weekly', sections: 6 },
  { title: 'Power Quality Report', description: 'Voltage, frequency, power factor, and quality exceptions.', frequency: 'Weekly', sections: 8 },
  { title: 'Site Comparison Report', description: 'Area-by-area consumption, cost, and efficiency comparison.', frequency: 'Monthly', sections: 10 },
  { title: 'ISO 50001 Energy Review', description: 'Compliance-ready review of performance and improvement plans.', frequency: 'Quarterly', sections: 12 },
] as const

export function reportTone(tone: string) {
  if (tone === 'good' || tone === 'emerald') return { color: C.emeraldText, bg: C.emeraldBg, bar: C.emerald }
  if (tone === 'warning' || tone === 'amber') return { color: C.amberText, bg: C.amberBg, bar: C.amber }
  if (tone === 'critical' || tone === 'rose') return { color: C.roseText, bg: C.roseBg, bar: C.rose }
  if (tone === 'info' || tone === 'cyan') return { color: C.skyText, bg: C.skyDim, bar: C.sky }
  if (tone === 'blue') return { color: C.blueText, bg: C.blueLight, bar: C.blue }
  return { color: C.textMuted, bg: C.surfaceTint, bar: C.textFaint }
}

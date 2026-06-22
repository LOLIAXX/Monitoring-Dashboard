import type { MonitoringSite } from '@/lib/monitoringApi'

export function isJkSite(site: Pick<MonitoringSite, 'name'>): boolean {
  return site.name.toLowerCase().includes('jk')
}

export function isSubstationSite(site: Pick<MonitoringSite, 'name'>): boolean {
  return site.name.toLowerCase().includes('post')
}

export function isSubMainSite(site: Pick<MonitoringSite, 'name'>): boolean {
  const name = site.name.toLowerCase()
  return name.includes('sub_main') || name.includes('sub main')
}

export function classifyMonitoringSites(sites: MonitoringSite[]) {
  const visibleSites: MonitoringSite[] = []
  const substations: MonitoringSite[] = []
  const mainSubstation: MonitoringSite[] = []

  for (const site of sites) {
    const isJK = isJkSite(site)
    const isSubstation = isSubstationSite(site)
    const isSubMain = isSubMainSite(site)

    if (!isSubstation && !isJK && !isSubMain) visibleSites.push(site)
    if (isSubstation && !isJK) substations.push(site)
    if (isJK) mainSubstation.push(site)
  }

  return { sites: visibleSites, substations, mainSubstation }
}

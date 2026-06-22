import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { IconReports } from '@/components/monitoring/monitoringIcons'
import {
  ANALYSIS_MODULES,
  ANALYSIS_OVERVIEW_CARDS,
  KPI_REPORT_CARDS,
  KPI_REPORT_TABLE,
  RECENT_REPORTS,
  REPORT_ACTIONS,
  REPORT_SUMMARY_CARDS,
  REPORT_TEMPLATES,
  reportTone,
} from '@/components/monitoring/reportsMockData'

type ToneVars = CSSProperties & {
  '--tone': string
  '--tone-bg': string
  '--tone-text': string
}

function toneVars(tone: string): ToneVars {
  const t = reportTone(tone)
  return {
    '--tone': t.bar,
    '--tone-bg': t.bg,
    '--tone-text': t.color,
  }
}

function MiniBars({ tone, progress }: { tone: string; progress: number }) {
  const bars = [44, 58, 52, 72, 64, progress]

  return (
    <div className="reports-mini-bars" style={toneVars(tone)} aria-hidden="true">
      {bars.map((height, index) => (
        <span key={`${height}-${index}`} style={{ height: `${height}%` }} data-active={index === bars.length - 1} />
      ))}
    </div>
  )
}

function StatusChip({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="reports-status-chip" style={toneVars(tone)}>
      {label}
    </span>
  )
}

function ActionLink({ href, children, tone = 'blue' }: { href: string; children: ReactNode; tone?: string }) {
  if (href === '#') {
    return (
      <button type="button" className="reports-action-btn" style={toneVars(tone)}>
        {children}
      </button>
    )
  }

  return (
    <Link href={href} className="reports-action-btn" style={toneVars(tone)}>
      {children}
    </Link>
  )
}

export default function ReportsPage() {
  return (
    <div className="reports-page">
      <header className="surface-premium reports-hero">
        <div className="reports-hero-inner">
          <div className="reports-hero-copy">
            <div className="reports-hero-icon">
              <IconReports size={22} color="#fff" />
            </div>
            <div>
              <p className="reports-kicker">Monitoring workspace</p>
              <h2 className="reports-hero-title">Analysis and Reports</h2>
              <p className="reports-hero-subtitle">
                Review energy performance, track KPIs, analyze consumption, and prepare operational reports.
              </p>
            </div>
          </div>
          <div className="reports-hero-actions">
            <ActionLink href="/monitoring/reports/builder" tone="blue">Build Custom Report</ActionLink>
            <ActionLink href="/monitoring/reports/kpis" tone="emerald">KPI Workspace</ActionLink>
          </div>
        </div>
      </header>

      <section className="reports-summary-grid">
        {REPORT_SUMMARY_CARDS.map(card => (
          <div key={card.label} className="kpi-premium reports-summary-card" style={toneVars(card.tone)}>
            <div className="reports-card-topline">
              <span className="reports-tone-dot" />
              <span>{card.label}</span>
            </div>
            <div className="reports-summary-value tnum">{card.value}</div>
            <p className="reports-muted">{card.detail}</p>
          </div>
        ))}
      </section>

      <section className="chart-card reports-section">
        <SectionHead
          title="Executive Analysis Overview"
          subtitle="Manager-ready signals from the latest reporting cycle."
          right={<StatusChip tone="good" label="Operational readout" />}
        />
        <div className="reports-overview-grid">
          {ANALYSIS_OVERVIEW_CARDS.map(item => (
            <article key={item.label} className="reports-signal-card" style={toneVars(item.tone)}>
              <div className="reports-card-header">
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
                <StatusChip tone={item.tone} label={item.status} />
              </div>
              <div className="reports-signal-metric">
                <span className="tnum">{item.value}</span>
                <span>signal</span>
              </div>
              <ProgressBar tone={item.tone} progress={item.progress} target={82} />
            </article>
          ))}
        </div>
      </section>

      <section className="surface-premium reports-section">
        <SectionHead title="Recent Reports" subtitle="Generated, scheduled, and review-ready operational reports." />
        <TableScroll>
          <table className="reports-table reports-table-wide">
            <thead>
              <tr>
                {['Report name', 'Type', 'Scope', 'Period', 'Owner', 'Status', 'Last generated', 'Action'].map(head => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_REPORTS.map(report => (
                <tr key={report.name}>
                  <td>
                    <strong>{report.name}</strong>
                  </td>
                  <td>{report.type}</td>
                  <td>{report.scope}</td>
                  <td>{report.period}</td>
                  <td>{report.owner}</td>
                  <td><StatusChip tone={report.tone} label={report.status} /></td>
                  <td className="tnum">{report.generated}</td>
                  <td>
                    <ActionLink href="#" tone={report.tone}>Open</ActionLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section className="chart-card reports-section">
        <SectionHead title="Analysis Cards" subtitle="Focused analysis areas for manager review and operating decisions." />
        <div className="reports-card-grid">
          {ANALYSIS_MODULES.map(module => (
            <article key={module.title} className="reports-module-card" style={toneVars(module.tone)}>
              <div className="reports-card-header">
                <div>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
                <StatusChip tone={module.tone} label={module.status} />
              </div>
              <div className="reports-module-footer">
                <div>
                  <div className="reports-module-metric tnum">{module.metric}</div>
                  <ActionLink href="#" tone={module.tone}>View Analysis</ActionLink>
                </div>
                <MiniBars tone={module.tone} progress={module.progress} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-premium reports-section">
        <SectionHead title="KPI Performance" subtitle="Targets, variance, and trend context without leaving the reports workspace." />
        <div className="reports-kpi-grid">
          {KPI_REPORT_CARDS.map(kpi => (
            <article key={kpi.name} className="reports-kpi-card" style={toneVars(kpi.tone)}>
              <div className="reports-card-topline">
                <span className="reports-tone-dot" />
                <span>{kpi.name}</span>
              </div>
              <div className="reports-kpi-value tnum">{kpi.value}</div>
              <div className="reports-kpi-meta">
                <span>Target {kpi.target}</span>
                <strong>{kpi.variance}</strong>
              </div>
              <ProgressBar tone={kpi.tone} progress={kpi.progress} target={84} />
            </article>
          ))}
        </div>
        <TableScroll>
          <table className="reports-table reports-table-kpi">
            <thead>
              <tr>
                {['KPI name', 'Current value', 'Target', 'Variance', 'Trend', 'Status'].map(head => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KPI_REPORT_TABLE.map(kpi => (
                <tr key={kpi.name}>
                  <td><strong>{kpi.name}</strong></td>
                  <td className="tnum">{kpi.current}</td>
                  <td className="tnum">{kpi.target}</td>
                  <td className="tnum">{kpi.variance}</td>
                  <td>{kpi.trend}</td>
                  <td><StatusChip tone={kpi.tone} label={kpi.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section className="chart-card reports-section">
        <SectionHead title="Tools & Actions" subtitle="Report generation, KPI review, exports, and comparison entry points." />
        <div className="reports-action-grid">
          {REPORT_ACTIONS.map(action => (
            <article key={action.title} className="reports-tool-card" style={toneVars(action.tone)}>
              <div>
                <div className="reports-tool-mark" />
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <ActionLink href={action.href} tone={action.tone}>{action.label}</ActionLink>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-premium reports-section">
        <SectionHead title="Report Templates" subtitle="Reusable report structures for recurring operational and compliance review." />
        <div className="reports-template-grid">
          {REPORT_TEMPLATES.map(template => (
            <article key={template.title} className="reports-template-card">
              <div>
                <h3>{template.title}</h3>
                <p>{template.description}</p>
              </div>
              <div className="micro-stat-grid">
                <div className="micro-stat">
                  <p className="micro-stat-label">Frequency</p>
                  <p className="micro-stat-value">{template.frequency}</p>
                </div>
                <div className="micro-stat">
                  <p className="micro-stat-label">Sections</p>
                  <p className="micro-stat-value">{template.sections}</p>
                </div>
              </div>
              <ActionLink href="#" tone="blue">Use Template</ActionLink>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHead({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="reports-section-head">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {right}
    </div>
  )
}

function TableScroll({ children }: { children: ReactNode }) {
  return <div className="reports-table-scroll">{children}</div>
}

function ProgressBar({ tone, progress, target }: { tone: string; progress: number; target: number }) {
  return (
    <div className="reports-progress" style={toneVars(tone)}>
      <span style={{ width: `${progress}%` }} />
      <i style={{ left: `${target}%` }} />
    </div>
  )
}

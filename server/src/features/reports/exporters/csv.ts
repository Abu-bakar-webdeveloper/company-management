import type { IReport } from '../report.model.js'

function escapeCsv(value: string | number | null | undefined): string {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function buildReportCsv(report: IReport): Buffer {
  const lines: string[] = [
    'BizFlow Report',
    `Title,${escapeCsv(report.name)}`,
    `Module,${escapeCsv(report.module)}`,
    `Period,${escapeCsv(report.periodLabel)}`,
    `Status,${escapeCsv(report.status)}`,
    '',
    'Stats',
    `Total Records,${escapeCsv(report.stats.totalRecords)}`,
    `${escapeCsv(report.stats.secondaryLabel)},${escapeCsv(report.stats.secondaryValue)}`,
    `${escapeCsv(report.stats.avgLabel)},${escapeCsv(report.stats.avgValue)}`,
    '',
    'Records',
    'Date,Category,Employee,Metric,Status,Detail',
    ...report.records.map((record) =>
      [
        escapeCsv(record.date),
        escapeCsv(record.category),
        escapeCsv(record.employeeName),
        escapeCsv(record.metric),
        escapeCsv(record.status),
        escapeCsv(record.detail),
      ].join(','),
    ),
  ]

  return Buffer.from(lines.join('\n'), 'utf-8')
}

export function buildPlatformCsv(params: {
  title: string
  metrics: { label: string; value: string }[]
  companies: {
    company: string
    plan: string
    adminUsers: number
    adminLimit: number
    revenue: string
    status: string
    details: string
  }[]
}): Buffer {
  const lines: string[] = [
    'BizFlow Platform Report',
    `Title,${escapeCsv(params.title)}`,
    '',
    'Metrics',
    'Label,Value',
    ...params.metrics.map((m) => `${escapeCsv(m.label)},${escapeCsv(m.value)}`),
    '',
    'Companies',
    'Company,Plan,Admins,Admin Limit,Revenue,Status,Details',
    ...params.companies.map((c) =>
      [
        escapeCsv(c.company),
        escapeCsv(c.plan),
        escapeCsv(c.adminUsers),
        escapeCsv(c.adminLimit),
        escapeCsv(c.revenue),
        escapeCsv(c.status),
        escapeCsv(c.details),
      ].join(','),
    ),
  ]
  return Buffer.from(lines.join('\n'), 'utf-8')
}

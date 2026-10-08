import ExcelJS from 'exceljs'
import type { IReport } from '../report.model.js'

export async function buildReportExcel(report: IReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BizFlow'
  workbook.created = new Date()

  const summary = workbook.addWorksheet('Summary')
  summary.addRow(['BizFlow Report'])
  summary.addRow(['Title', report.name])
  summary.addRow(['Module', report.module])
  summary.addRow(['Period', report.periodLabel])
  summary.addRow(['Status', report.status])
  summary.addRow([])
  summary.addRow(['Metric', 'Value'])
  summary.addRow(['Total Records', report.stats.totalRecords])
  summary.addRow([report.stats.secondaryLabel, report.stats.secondaryValue])
  summary.addRow([report.stats.avgLabel, report.stats.avgValue])
  summary.getColumn(1).width = 24
  summary.getColumn(2).width = 28

  const records = workbook.addWorksheet('Records')
  records.addRow(['Date', 'Category', 'Employee', 'Metric', 'Status', 'Detail'])
  for (const row of report.records) {
    records.addRow([
      row.date,
      row.category,
      row.employeeName,
      row.metric,
      row.status,
      row.detail,
    ])
  }
  records.columns.forEach((col) => {
    col.width = 18
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function buildPlatformExcel(params: {
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
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BizFlow'

  const summary = workbook.addWorksheet('Summary')
  summary.addRow(['BizFlow Platform Report'])
  summary.addRow(['Title', params.title])
  summary.addRow([])
  summary.addRow(['Metric', 'Value'])
  for (const metric of params.metrics) {
    summary.addRow([metric.label, metric.value])
  }
  summary.getColumn(1).width = 32
  summary.getColumn(2).width = 24

  const companies = workbook.addWorksheet('Companies')
  companies.addRow(['Company', 'Plan', 'Admins', 'Admin Limit', 'Revenue', 'Status', 'Details'])
  for (const row of params.companies) {
    companies.addRow([
      row.company,
      row.plan,
      row.adminUsers,
      row.adminLimit,
      row.revenue,
      row.status,
      row.details,
    ])
  }
  companies.columns.forEach((col) => {
    col.width = 18
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

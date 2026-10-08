import PDFDocument from 'pdfkit'
import type { IReport } from '../report.model.js'

function streamToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

export async function buildReportPdf(report: IReport): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const done = streamToBuffer(doc)

  doc.fontSize(18).text('BizFlow Report', { underline: true })
  doc.moveDown(0.5)
  doc.fontSize(12).text(report.name)
  doc.fontSize(10).fillColor('#64748B').text(`Module: ${report.module}`)
  doc.text(`Period: ${report.periodLabel}`)
  doc.text(`Status: ${report.status}`)
  doc.fillColor('#000000')
  doc.moveDown()

  doc.fontSize(12).text('Summary', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(10)
  doc.text(`Total Records: ${report.stats.totalRecords}`)
  doc.text(`${report.stats.secondaryLabel}: ${report.stats.secondaryValue ?? '—'}`)
  doc.text(`${report.stats.avgLabel}: ${report.stats.avgValue ?? '—'}`)
  doc.moveDown()

  doc.fontSize(12).text('Records', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(9)

  const maxRows = Math.min(report.records.length, 40)
  for (let i = 0; i < maxRows; i += 1) {
    const row = report.records[i]
    const line = `${row.date} | ${row.category} | ${row.employeeName} | ${row.metric ?? '—'} | ${row.status} | ${row.detail}`
    doc.text(line, { width: 500 })
  }

  if (report.records.length > maxRows) {
    doc.moveDown(0.5)
    doc.text(`…and ${report.records.length - maxRows} more rows`)
  }

  doc.end()
  return done
}

export async function buildPlatformPdf(params: {
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
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const done = streamToBuffer(doc)

  doc.fontSize(18).text('BizFlow Platform Report', { underline: true })
  doc.moveDown(0.5)
  doc.fontSize(12).text(params.title)
  doc.moveDown()

  doc.fontSize(12).text('Metrics', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(10)
  for (const metric of params.metrics) {
    doc.text(`${metric.label}: ${metric.value}`)
  }
  doc.moveDown()

  doc.fontSize(12).text('Companies', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(9)
  const maxRows = Math.min(params.companies.length, 40)
  for (let i = 0; i < maxRows; i += 1) {
    const row = params.companies[i]
    doc.text(
      `${row.company} | ${row.plan} | ${row.adminUsers}/${row.adminLimit} | ${row.revenue} | ${row.status}`,
      { width: 500 },
    )
  }

  doc.end()
  return done
}

import PDFDocument from 'pdfkit'

export type SalarySlipPdfInput = {
  companyName: string
  companyAddress: string
  companyWebsite: string
  currency: string
  payPeriodMonth: string
  payPeriodYear: string
  employeeName: string
  employeeCode: string
  department: string
  designation: string
  employeeEmail: string
  employeeNic: string
  employeeContact: string
  bankName: string
  bankAccountNo: string
  dateOfJoining: string
  earnings: {
    basic: number
    hra: number
    utilityAllowance: number
    conveyanceAllowance: number
    reimburse: number
    overTime: number
    bonus: number
    loanIssued: number
    leaveEncashment?: number
  }
  deductions: {
    leave: number
    loan: number
    providentFund: number
    advance: number
    incomeTax: number
    other: number
  }
  lineItems?: { name: string; kind: 'earning' | 'deduction'; amount: number }[]
  employerProvidentFund?: number
  totalEarnings: number
  totalDeductions: number
  disbursement: number
}

function streamToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

function fmt(n: number): string {
  if (!n) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const PRIMARY = '#3f6fb0'
const DARK = '#14224d'
const PAGE_WIDTH = 595.28
const MARGIN = 36
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

export async function buildSalarySlipPdf(data: SalarySlipPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: MARGIN,
    info: {
      Title: `Salary Slip ${data.payPeriodMonth} ${data.payPeriodYear}`,
      Author: data.companyName,
    },
  })
  const done = streamToBuffer(doc)

  let y = MARGIN

  // Title bar
  doc.rect(MARGIN, y, CONTENT_WIDTH, 28).fill(PRIMARY)
  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(`Salary Slip m/o ${data.payPeriodMonth} - ${data.payPeriodYear}`, MARGIN, y + 8, {
      width: CONTENT_WIDTH,
      align: 'center',
    })
  y += 28

  // Company bar
  doc.rect(MARGIN, y, CONTENT_WIDTH, 52).fill(DARK)
  doc
    .fillColor('#ffffff')
    .font('Helvetica-BoldOblique')
    .fontSize(16)
    .text(data.companyName, MARGIN + 14, y + 10, { width: CONTENT_WIDTH - 28 })
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#dbe4f0')
    .text(`${data.companyAddress}  ·  ${data.companyWebsite}`, MARGIN + 14, y + 32, {
      width: CONTENT_WIDTH - 28,
    })
  y += 52

  const drawSectionHeader = (label: string) => {
    doc.rect(MARGIN, y, CONTENT_WIDTH, 20).fill(PRIMARY)
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(label, MARGIN, y + 5, { width: CONTENT_WIDTH, align: 'center' })
    y += 20
  }

  drawSectionHeader('Employee Details')

  const infoRows: [string, string, string, string][] = [
    ['Employee Name', data.employeeName, 'Department', data.department],
    ['Employee ID', data.employeeCode, 'Designation', data.designation],
    ['E-mail ID', data.employeeEmail, 'Employee NIC', data.employeeNic],
    ['Contact No', data.employeeContact, 'Bank Details', data.bankName],
    ['Date of Joining', data.dateOfJoining, 'Bank A/C No', data.bankAccountNo],
  ]

  doc.fillColor('#1a1a1a').fontSize(9)
  for (const [l1, v1, l2, v2] of infoRows) {
    doc.font('Helvetica').fillColor('#333333').text(`${l1} :`, MARGIN + 12, y + 4, { width: 90 })
    doc.font('Helvetica-Bold').fillColor('#1a1a1a').text(v1, MARGIN + 102, y + 4, { width: 150 })
    doc.font('Helvetica').fillColor('#333333').text(`${l2} :`, MARGIN + 270, y + 4, { width: 90 })
    doc.font('Helvetica-Bold').fillColor('#1a1a1a').text(v2, MARGIN + 360, y + 4, { width: 160 })
    y += 16
  }
  y += 6

  drawSectionHeader('Earnings Details')

  // Column headers
  doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill('#dfe7f2')
  doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(9)
  const col1 = MARGIN + 12
  const col2 = MARGIN + 180
  const col3 = MARGIN + 270
  const col4 = MARGIN + CONTENT_WIDTH - 24
  doc.text('Earnings', col1, y + 5)
  doc.text('Amount', col2 - 40, y + 5, { width: 60, align: 'right' })
  doc.text('Deductions', col3, y + 5)
  doc.text('Amount', col4 - 50, y + 5, { width: 50, align: 'right' })
  y += 18

  const earningRows: [string, number][] =
    data.lineItems && data.lineItems.length > 0
      ? data.lineItems
          .filter((l) => l.kind === 'earning')
          .map((l) => [l.name, l.amount])
      : [
          ['Basic', data.earnings.basic],
          ['HRA', data.earnings.hra],
          ['Utility Allowance', data.earnings.utilityAllowance],
          ['Conveyance Allowance', data.earnings.conveyanceAllowance],
          ['Reimburse', data.earnings.reimburse],
          ['Over Time', data.earnings.overTime],
          ['Bonus', data.earnings.bonus],
          ['Loan Issued', data.earnings.loanIssued],
          ['Leave Encashment', data.earnings.leaveEncashment ?? 0],
        ]

  const deductionRows: [string, number][] =
    data.lineItems && data.lineItems.length > 0
      ? data.lineItems
          .filter((l) => l.kind === 'deduction')
          .map((l) => [l.name, l.amount])
      : [
          ['Leave', data.deductions.leave],
          ['Loan', data.deductions.loan],
          ['Provident Fund', data.deductions.providentFund],
          ['Advance', data.deductions.advance],
          ['Income Tax', data.deductions.incomeTax],
          ['Other Deductions', data.deductions.other],
        ]

  if (data.employerProvidentFund && data.employerProvidentFund > 0) {
    deductionRows.push(['Employer PF (info)', data.employerProvidentFund])
  }

  const rowCount = Math.max(earningRows.length, deductionRows.length)
  doc.font('Helvetica').fontSize(9)

  for (let i = 0; i < rowCount; i += 1) {
    const e = earningRows[i]
    const d = deductionRows[i]
    if (e) {
      doc.fillColor('#1a1a1a').text(e[0], col1, y + 3)
      doc.text(fmt(e[1]), col2 - 40, y + 3, { width: 60, align: 'right' })
    }
    if (d) {
      doc.text(d[0], col3, y + 3)
      doc.text(fmt(d[1]), col4 - 50, y + 3, { width: 50, align: 'right' })
    }
    doc
      .strokeColor('#cfd8e3')
      .lineWidth(0.5)
      .moveTo(MARGIN + 8, y + 15)
      .lineTo(MARGIN + CONTENT_WIDTH - 8, y + 15)
      .stroke()
    y += 16
  }

  // Totals
  doc.rect(MARGIN, y, CONTENT_WIDTH, 20).fill('#eef1f5')
  doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(9)
  doc.text('Total Earnings', col1, y + 5)
  doc.text(fmt(data.totalEarnings), col2 - 40, y + 5, { width: 60, align: 'right' })
  doc.text('Total Deductions', col3, y + 5)
  doc.text(fmt(data.totalDeductions), col4 - 50, y + 5, { width: 50, align: 'right' })
  y += 20

  // Disbursement
  doc.rect(MARGIN, y, CONTENT_WIDTH, 28).fill(PRIMARY)
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11)
  doc.text('Disbursement', MARGIN + 14, y + 8)
  doc
    .font('Helvetica-BoldOblique')
    .fontSize(14)
    .text(`${data.currency} ${fmt(data.disbursement)}`, MARGIN, y + 6, {
      width: CONTENT_WIDTH - 14,
      align: 'right',
    })
  y += 36

  // Footer
  doc.rect(MARGIN, y, CONTENT_WIDTH, 28).fill(DARK)
  doc
    .fillColor('#ffffff')
    .font('Helvetica')
    .fontSize(8)
    .text(
      'Provident Fund is subject to Company Policy.\nThis is computer generated slip & does not require any signature.',
      MARGIN,
      y + 6,
      { width: CONTENT_WIDTH, align: 'center' },
    )

  doc.end()
  return done
}

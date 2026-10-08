import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import type { PfSettings } from './company-payroll-settings.model.js'
import {
  ProvidentFundAccount,
  ProvidentFundLedger,
  type IProvidentFundLedger,
} from './provident-fund.model.js'
import type { ISalary } from './salary.model.js'

export function computePfAmounts(
  pf: PfSettings,
  basic: number,
  grossEarnings: number,
): { employeeAmount: number; employerAmount: number } {
  if (!pf.enabled) {
    return { employeeAmount: 0, employerAmount: 0 }
  }
  const base = pf.base === 'gross' ? grossEarnings : basic
  const employeeAmount = Math.round((base * pf.employeePercent) / 100)
  const employerAmount = Math.round((base * pf.employerPercent) / 100)
  return { employeeAmount, employerAmount }
}

async function getOrCreateAccount(companyId: string, employeeId: string) {
  let account = await ProvidentFundAccount.findOne({ companyId, employeeId })
  if (!account) {
    account = await ProvidentFundAccount.create({
      companyId,
      employeeId,
      balance: 0,
    })
  }
  return account
}

export async function postPfContributionFromSalary(doc: ISalary): Promise<void> {
  const employeeAmount = doc.deductions.providentFund ?? 0
  const employerAmount = doc.employerProvidentFund ?? 0
  if (employeeAmount <= 0 && employerAmount <= 0) return

  const existing = await ProvidentFundLedger.findOne({
    companyId: doc.companyId,
    employeeId: doc.employeeId,
    year: doc.payPeriodYear,
    month: doc.payPeriodMonth,
    type: 'contribution',
  })
  if (existing) return

  const total = employeeAmount + employerAmount
  const account = await getOrCreateAccount(
    doc.companyId.toString(),
    doc.employeeId.toString(),
  )
  account.balance += total
  await account.save()

  await ProvidentFundLedger.create({
    companyId: doc.companyId,
    employeeId: doc.employeeId,
    salaryId: doc._id,
    year: doc.payPeriodYear,
    month: doc.payPeriodMonth,
    employeeAmount,
    employerAmount,
    type: 'contribution',
    note: `Payroll contribution for ${doc.payPeriodMonth}/${doc.payPeriodYear}`,
  })
}

export async function reversePfContributionFromSalary(doc: ISalary): Promise<void> {
  const contribution = await ProvidentFundLedger.findOne({
    companyId: doc.companyId,
    employeeId: doc.employeeId,
    year: doc.payPeriodYear,
    month: doc.payPeriodMonth,
    type: 'contribution',
  })
  if (!contribution) return

  const total = contribution.employeeAmount + contribution.employerAmount
  const account = await getOrCreateAccount(
    doc.companyId.toString(),
    doc.employeeId.toString(),
  )
  account.balance = Math.max(0, account.balance - total)
  await account.save()

  await ProvidentFundLedger.create({
    companyId: doc.companyId,
    employeeId: doc.employeeId,
    salaryId: doc._id,
    year: doc.payPeriodYear,
    month: doc.payPeriodMonth,
    employeeAmount: contribution.employeeAmount,
    employerAmount: contribution.employerAmount,
    type: 'reversal',
    note: `Reversal for unpaid salary ${doc.payPeriodMonth}/${doc.payPeriodYear}`,
  })

  await contribution.deleteOne()
}

export async function getEmployeePfBalance(
  companyId: string,
  employeeId: string,
): Promise<{ balance: number; entries: IProvidentFundLedger[] }> {
  if (!Types.ObjectId.isValid(employeeId)) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }

  const account = await ProvidentFundAccount.findOne({ companyId, employeeId })
  const entries = await ProvidentFundLedger.find({ companyId, employeeId })
    .sort({ year: -1, month: -1, createdAt: -1 })
    .limit(24)

  return {
    balance: account?.balance ?? 0,
    entries,
  }
}

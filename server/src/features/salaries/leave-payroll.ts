import { Types } from 'mongoose'
import {
  allocateExcessDaysForMonth,
  daysOverlapInMonthUtc,
  monthBoundsUtc,
} from '../leave/leave-dates.js'
import { LeaveRequest } from '../leave/leave-request.model.js'
import { LeaveType } from '../leave/leave-type.model.js'

/**
 * Deductible leave days for an employee in a pay period:
 * - all overlapping days of unpaid leave types
 * - excess days marked unpaid_deduct (allocated across months so shares sum to excess)
 */
export async function getDeductibleLeaveDays(params: {
  companyId: string
  employeeId: string
  month: number
  year: number
}): Promise<number> {
  const { companyId, employeeId, month, year } = params
  const { startMs, endMs } = monthBoundsUtc(year, month)
  const periodStart = new Date(startMs)
  const periodEnd = new Date(endMs + 24 * 60 * 60 * 1000 - 1)

  const requests = await LeaveRequest.find({
    companyId: new Types.ObjectId(companyId),
    employeeId: new Types.ObjectId(employeeId),
    status: 'approved',
    startDate: { $lte: periodEnd },
    endDate: { $gte: periodStart },
  })

  if (requests.length === 0) return 0

  const typeIds = [...new Set(requests.map((r) => r.leaveTypeId.toString()))]
  const types = await LeaveType.find({ _id: { $in: typeIds } })
  const typeMap = new Map(types.map((t) => [t._id.toString(), t]))

  let days = 0
  for (const req of requests) {
    const leaveType = typeMap.get(req.leaveTypeId.toString())
    const overlap = daysOverlapInMonthUtc(req.startDate, req.endDate, year, month)
    if (overlap <= 0) continue

    if (leaveType && !leaveType.paidLeave) {
      days += overlap
      continue
    }

    if (req.excessDisposition === 'unpaid_deduct' && (req.excessDays ?? 0) > 0) {
      days += allocateExcessDaysForMonth(
        req.startDate,
        req.endDate,
        req.excessDays ?? 0,
        year,
        month,
      )
    }
  }

  return Math.round(days * 100) / 100
}

export function dailyRateFromBasic(basic: number, divisor: number): number {
  if (basic <= 0 || divisor <= 0) return 0
  return Math.round((basic / divisor) * 100) / 100
}

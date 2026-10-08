import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { AuthUser, UserRole } from '../auth/auth.types.js'
import { User } from '../auth/user.model.js'
import { getZonedParts } from '../attendance/attendance-calc.js'
import {
  ensureAttendanceSettings,
  getMonthlyAttendancePercent,
} from '../attendance/attendance.service.js'
import { Task } from '../tasks/task.model.js'

export type TeamActor = {
  id: string
  companyId: string
  role: UserRole
}

function assertCompanyContext(acting: TeamActor): void {
  if (!acting.companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }
}

export async function listDirectReports(
  acting: TeamActor,
): Promise<{ members: AuthUser[]; attendanceById: Record<string, number> }> {
  assertCompanyContext(acting)

  const users = await User.find({
    companyId: acting.companyId,
    managerId: new Types.ObjectId(acting.id),
  }).sort({ fullName: 1 })

  const members = await Promise.all(users.map((user) => enrichAuthUser(user)))
  const settings = await ensureAttendanceSettings(acting.companyId)
  const zoned = getZonedParts(new Date(), settings.timezone)
  const year = zoned.year
  const month = zoned.month
  const attendanceById: Record<string, number> = {}
  await Promise.all(
    members.map(async (member) => {
      attendanceById[member.id] = await getMonthlyAttendancePercent(
        acting.companyId,
        member.id,
        year,
        month,
      )
    }),
  )

  return { members, attendanceById }
}

export async function getDirectReportById(
  memberId: string,
  acting: TeamActor,
): Promise<AuthUser> {
  assertCompanyContext(acting)

  if (!Types.ObjectId.isValid(memberId)) {
    throw new AppError('Team member not found', 404, 'TEAM_MEMBER_NOT_FOUND')
  }

  const user = await User.findById(memberId)
  if (!user) {
    throw new AppError('Team member not found', 404, 'TEAM_MEMBER_NOT_FOUND')
  }

  if (user.companyId?.toString() !== acting.companyId) {
    throw new AppError('Team member not found', 404, 'TEAM_MEMBER_NOT_FOUND')
  }

  if (user.managerId?.toString() !== acting.id) {
    throw new AppError('Team member not found', 404, 'TEAM_MEMBER_NOT_FOUND')
  }

  return enrichAuthUser(user, { includeReporteesCount: true })
}

export type TeamWorkloadMember = {
  userId: string
  fullName: string
  openTasks: number
  completedTasks: number
  totalTasks: number
}

/** Current open/completed task counts per direct report (no historical series). */
export async function getTeamWorkload(
  acting: TeamActor,
): Promise<{ members: TeamWorkloadMember[] }> {
  assertCompanyContext(acting)

  const reports = await User.find({
    companyId: acting.companyId,
    managerId: new Types.ObjectId(acting.id),
  })
    .select('_id fullName')
    .sort({ fullName: 1 })

  if (reports.length === 0) {
    return { members: [] }
  }

  const reportIds = reports.map((user) => user._id)

  const counts = await Task.aggregate<{
    _id: Types.ObjectId
    openTasks: number
    completedTasks: number
    totalTasks: number
  }>([
    {
      $match: {
        companyId: new Types.ObjectId(acting.companyId),
        assigneeId: { $in: reportIds },
      },
    },
    {
      $group: {
        _id: '$assigneeId',
        openTasks: {
          $sum: { $cond: [{ $ne: ['$status', 'done'] }, 1, 0] },
        },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
        },
        totalTasks: { $sum: 1 },
      },
    },
  ])

  const countByUserId = new Map(
    counts.map((row) => [row._id.toString(), row]),
  )

  const members: TeamWorkloadMember[] = reports.map((user) => {
    const row = countByUserId.get(user._id.toString())
    return {
      userId: user._id.toString(),
      fullName: user.fullName,
      openTasks: row?.openTasks ?? 0,
      completedTasks: row?.completedTasks ?? 0,
      totalTasks: row?.totalTasks ?? 0,
    }
  })

  return { members }
}

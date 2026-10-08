import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import {
  buildLeaveActor,
  createLeaveRequest,
  createLeaveType,
  deleteLeaveType,
  getEmployeeLeaveSummary,
  getLeaveRequestById,
  getLeaveRequestStats,
  getLeaveTypeById,
  listLeaveRequests,
  listLeaveTypes,
  runLeaveEncashment,
  updateLeaveRequestStatus,
  updateLeaveType,
} from './leave.service.js'
import type {
  CreateLeaveRequestInput,
  CreateLeaveTypeInput,
  LeaveEncashmentInput,
  ListLeaveRequestsQuery,
  UpdateLeaveRequestStatusInput,
  UpdateLeaveTypeInput,
} from './leave.validation.js'

async function getLeaveActor(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  return buildLeaveActor(
    req.user!.id,
    companyId,
    authUser.role as UserRole,
    (authUser.permissions ?? []) as Permission[],
  )
}

export async function listLeaveTypesHandler(req: Request, res: Response): Promise<void> {
  const types = await listLeaveTypes(await getLeaveActor(req))
  sendSuccess(res, { types })
}

export async function getLeaveTypeHandler(req: Request, res: Response): Promise<void> {
  const type = await getLeaveTypeById(req.params.id as string, await getLeaveActor(req))
  sendSuccess(res, { type })
}

export async function createLeaveTypeHandler(req: Request, res: Response): Promise<void> {
  const type = await createLeaveType(req.body as CreateLeaveTypeInput, await getLeaveActor(req))
  sendSuccess(res, { type }, { statusCode: 201, message: 'Leave type created successfully' })
}

export async function updateLeaveTypeHandler(req: Request, res: Response): Promise<void> {
  const type = await updateLeaveType(
    req.params.id as string,
    req.body as UpdateLeaveTypeInput,
    await getLeaveActor(req),
  )
  sendSuccess(res, { type }, { message: 'Leave type updated successfully' })
}

export async function deleteLeaveTypeHandler(req: Request, res: Response): Promise<void> {
  await deleteLeaveType(req.params.id as string, await getLeaveActor(req))
  sendSuccess(res, { deleted: true }, { message: 'Leave type deleted successfully' })
}

export async function listLeaveRequestsHandler(req: Request, res: Response): Promise<void> {
  const result = await listLeaveRequests(
    req.validatedQuery as ListLeaveRequestsQuery,
    await getLeaveActor(req),
  )
  sendSuccess(res, result)
}

export async function getLeaveRequestStatsHandler(req: Request, res: Response): Promise<void> {
  const scope = req.query.scope as 'mine' | 'team' | 'company' | undefined
  const stats = await getLeaveRequestStats(await getLeaveActor(req), scope)
  sendSuccess(res, { stats })
}

export async function getLeaveRequestHandler(req: Request, res: Response): Promise<void> {
  const request = await getLeaveRequestById(req.params.id as string, await getLeaveActor(req))
  sendSuccess(res, { request })
}

export async function createLeaveRequestHandler(req: Request, res: Response): Promise<void> {
  const request = await createLeaveRequest(
    req.body as CreateLeaveRequestInput,
    await getLeaveActor(req),
  )
  sendSuccess(res, { request }, { statusCode: 201, message: 'Leave request submitted successfully' })
}

export async function updateLeaveRequestStatusHandler(req: Request, res: Response): Promise<void> {
  const request = await updateLeaveRequestStatus(
    req.params.id as string,
    req.body as UpdateLeaveRequestStatusInput,
    await getLeaveActor(req),
  )
  sendSuccess(res, { request }, { message: 'Leave request updated successfully' })
}

export async function getEmployeeLeaveSummaryHandler(req: Request, res: Response): Promise<void> {
  const summary = await getEmployeeLeaveSummary(
    req.params.userId as string,
    await getLeaveActor(req),
  )
  sendSuccess(res, { summary })
}

export async function runLeaveEncashmentHandler(req: Request, res: Response): Promise<void> {
  const result = await runLeaveEncashment(
    req.body as LeaveEncashmentInput,
    await getLeaveActor(req),
  )
  sendSuccess(res, result, {
    statusCode: 201,
    message:
      result.created > 0
        ? `Created ${result.created} encashment record(s)`
        : 'No new encashment records created',
  })
}

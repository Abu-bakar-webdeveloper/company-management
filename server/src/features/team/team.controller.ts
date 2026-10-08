import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { getDirectReportById, getTeamWorkload, listDirectReports } from './team.service.js'

function getTeamActor(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  return {
    id: req.user!.id,
    companyId,
    role: req.user!.role as UserRole,
  }
}

export async function listTeamMembers(req: Request, res: Response): Promise<void> {
  const result = await listDirectReports(getTeamActor(req))
  sendSuccess(res, result)
}

export async function getTeamMember(req: Request, res: Response): Promise<void> {
  const member = await getDirectReportById(req.params.id as string, getTeamActor(req))
  sendSuccess(res, { member })
}

export async function getTeamWorkloadHandler(req: Request, res: Response): Promise<void> {
  const result = await getTeamWorkload(getTeamActor(req))
  sendSuccess(res, result)
}

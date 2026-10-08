import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import {
  createCompanyRole,
  deleteCompanyRole,
  getCompanyRoleById,
  listCompanyRoles,
  updateCompanyRole,
} from './companyRole.service.js'
import type { CreateCompanyRoleInput, UpdateCompanyRoleInput } from './companyRole.validation.js'

function getActingCompanyAdmin(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  return { companyId }
}

export async function listRolesHandler(req: Request, res: Response): Promise<void> {
  const roles = await listCompanyRoles(getActingCompanyAdmin(req))
  sendSuccess(res, { roles })
}

export async function getRoleHandler(req: Request, res: Response): Promise<void> {
  const role = await getCompanyRoleById(req.params.id as string, getActingCompanyAdmin(req))
  sendSuccess(res, { role })
}

export async function createRoleHandler(req: Request, res: Response): Promise<void> {
  const role = await createCompanyRole(req.body as CreateCompanyRoleInput, getActingCompanyAdmin(req))
  sendSuccess(res, { role }, { statusCode: 201, message: 'Role created successfully' })
}

export async function updateRoleHandler(req: Request, res: Response): Promise<void> {
  const role = await updateCompanyRole(
    req.params.id as string,
    req.body as UpdateCompanyRoleInput,
    getActingCompanyAdmin(req),
  )
  sendSuccess(res, { role }, { message: 'Role updated successfully' })
}

export async function deleteRoleHandler(req: Request, res: Response): Promise<void> {
  await deleteCompanyRole(req.params.id as string, getActingCompanyAdmin(req))
  sendSuccess(res, { message: 'Role deleted successfully' })
}

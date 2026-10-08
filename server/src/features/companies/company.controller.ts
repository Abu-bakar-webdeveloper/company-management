import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import {
  createCompany,
  deleteCompany,
  getCompanyById,
  getCompanyGrowth,
  getCompanyStats,
  getMyCompanyPreferences,
  listCompanies,
  resendCompanyAdminInvite,
  resetCompanyAccess,
  updateCompany,
  updateMyCompanyPreferences,
} from './company.service.js'
import type {
  CreateCompanyInput,
  CompanyGrowthQuery,
  ListCompaniesQuery,
  UpdateCompanyInput,
  UpdateMyCompanyPreferencesInput,
} from './company.validation.js'

function requireUserCompanyId(req: Request): string {
  const companyId = req.user?.companyId
  if (!companyId) {
    throw new AppError('No company associated with this account', 400, 'NO_COMPANY')
  }
  return companyId
}

export async function getMyCompanyPreferencesHandler(req: Request, res: Response): Promise<void> {
  const company = await getMyCompanyPreferences(requireUserCompanyId(req))
  sendSuccess(res, { company })
}

export async function updateMyCompanyPreferencesHandler(req: Request, res: Response): Promise<void> {
  const company = await updateMyCompanyPreferences(
    requireUserCompanyId(req),
    req.body as UpdateMyCompanyPreferencesInput,
  )
  sendSuccess(res, { company }, { message: 'Company settings updated successfully' })
}

export async function createCompanyHandler(req: Request, res: Response): Promise<void> {
  const result = await createCompany(req.body as CreateCompanyInput, {
    id: req.user!.id,
  })
  sendSuccess(res, result, { statusCode: 201, message: 'Company created successfully' })
}

export async function listCompaniesHandler(req: Request, res: Response): Promise<void> {
  const result = await listCompanies(req.validatedQuery as ListCompaniesQuery)
  sendSuccess(res, result)
}

export async function getCompanyStatsHandler(_req: Request, res: Response): Promise<void> {
  const stats = await getCompanyStats()
  sendSuccess(res, { stats })
}

export async function getCompanyGrowthHandler(req: Request, res: Response): Promise<void> {
  const { months } = req.validatedQuery as CompanyGrowthQuery
  const growth = await getCompanyGrowth(months)
  sendSuccess(res, { growth })
}

export async function getCompanyHandler(req: Request, res: Response): Promise<void> {
  const company = await getCompanyById(req.params.id as string)
  sendSuccess(res, { company })
}

export async function resendInviteHandler(req: Request, res: Response): Promise<void> {
  const result = await resendCompanyAdminInvite(req.params.id as string)
  sendSuccess(res, result, { message: 'Invitation email sent' })
}

export async function updateCompanyHandler(req: Request, res: Response): Promise<void> {
  const company = await updateCompany(req.params.id as string, req.body as UpdateCompanyInput)
  sendSuccess(res, { company }, { message: 'Company updated successfully' })
}

export async function deleteCompanyHandler(req: Request, res: Response): Promise<void> {
  await deleteCompany(req.params.id as string)
  sendSuccess(res, null, { message: 'Company deleted successfully' })
}

export async function resetCompanyAccessHandler(req: Request, res: Response): Promise<void> {
  await resetCompanyAccess(req.params.id as string)
  sendSuccess(res, null, { message: 'Company access reset successfully' })
}

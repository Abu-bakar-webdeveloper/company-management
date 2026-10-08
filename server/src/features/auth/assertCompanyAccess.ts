import { AppError } from '../../utils/AppError.js'
import { Company } from '../companies/company.model.js'

/**
 * Blocks access when the user's company is suspended (inactive).
 * Superadmins (no companyId) are skipped.
 */
export async function assertCompanyNotSuspended(
  companyId: string | null | undefined,
): Promise<void> {
  if (!companyId) return

  const company = await Company.findById(companyId).select('status')
  if (!company) {
    throw new AppError(
      'Your company account is no longer available.',
      403,
      'COMPANY_NOT_FOUND',
    )
  }

  if (company.status === 'inactive') {
    throw new AppError(
      'This company has been suspended. Contact your platform administrator.',
      403,
      'COMPANY_SUSPENDED',
    )
  }
}

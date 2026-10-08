import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import { Company } from '../features/companies/company.model.js'
import {
  isCompanyHubEnabled,
  type CompanyHub,
} from '../features/companies/company-hubs.js'

export function requireCompanyHub(...hubs: CompanyHub[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const companyId = req.user?.companyId
    if (!companyId) {
      next()
      return
    }

    const company = await Company.findById(companyId).select('enabledHubs')
    const enabled = hubs.some((hub) => isCompanyHubEnabled(company?.enabledHubs, hub))
    if (!enabled) {
      next(
        new AppError(
          'This product area is not enabled for your company',
          403,
          'HUB_DISABLED',
        ),
      )
      return
    }

    next()
  }
}

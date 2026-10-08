import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import {
  cancelLoan,
  createAssignment,
  createCompensationEvent,
  createLoan,
  deleteAssignment,
  getEmployeeCompensation,
  listAssignments,
  listIncrementDueEmployees,
  listLoans,
  updateAssignment,
} from './compensation.service.js'
import {
  createPayrollComponent,
  deletePayrollComponent,
  getPayrollSettings,
  updatePayrollComponent,
  updatePayrollSettings,
} from './payroll-settings.service.js'
import {
  buildSalaryActor,
  bulkUpdateSalaryStatus,
  createSalary,
  deleteSalary,
  downloadSalarySlip,
  generateMonthPayroll,
  getEmployeeDefaults,
  getEmployeePfAccount,
  getSalaryById,
  getSalaryStats,
  listSalaries,
  regeneratePendingForEmployee,
  updateSalary,
  updateSalaryStatus,
} from './salary.service.js'
import type {
  BulkSalaryStatusInput,
  CreateAssignmentInput,
  CreateCompensationEventInput,
  CreateLoanInput,
  CreatePayrollComponentInput,
  CreateSalaryInput,
  GenerateMonthInput,
  ListSalariesQuery,
  SalaryStatsQuery,
  UpdateAssignmentInput,
  UpdatePayrollComponentInput,
  UpdatePayrollSettingsInput,
  UpdateSalaryInput,
  UpdateSalaryStatusInput,
} from './salary.validation.js'

async function getSalaryActor(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  return buildSalaryActor(
    req.user!.id,
    companyId,
    authUser.role as UserRole,
    authUser.fullName,
    (authUser.permissions ?? []) as Permission[],
  )
}

function sendFile(
  res: Response,
  file: { buffer: Buffer; filename: string; contentType: string },
): void {
  res.setHeader('Content-Type', file.contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`)
  res.setHeader('Content-Length', String(file.buffer.length))
  res.status(200).send(file.buffer)
}

export async function listSalariesHandler(req: Request, res: Response): Promise<void> {
  const result = await listSalaries(
    req.validatedQuery as ListSalariesQuery,
    await getSalaryActor(req),
  )
  sendSuccess(res, result)
}

export async function listMySalariesHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const query = {
    ...(req.validatedQuery as ListSalariesQuery),
    employeeId: actor.id,
  }
  const result = await listSalaries(query, actor)
  sendSuccess(res, result)
}

export async function getMyPfHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const pf = await getEmployeePfAccount(actor.id, actor)
  sendSuccess(res, { pf })
}

export async function getSalaryStatsHandler(req: Request, res: Response): Promise<void> {
  const query = (req.validatedQuery ?? {}) as SalaryStatsQuery
  const result = await getSalaryStats(await getSalaryActor(req), query)
  sendSuccess(res, result)
}

export async function getSalaryHandler(req: Request, res: Response): Promise<void> {
  const salary = await getSalaryById(req.params.id as string, await getSalaryActor(req))
  sendSuccess(res, { salary })
}

export async function createSalaryHandler(req: Request, res: Response): Promise<void> {
  const salary = await createSalary(req.body as CreateSalaryInput, await getSalaryActor(req))
  sendSuccess(res, { salary }, { statusCode: 201, message: 'Salary record created successfully' })
}

export async function generateMonthHandler(req: Request, res: Response): Promise<void> {
  const result = await generateMonthPayroll(
    req.body as GenerateMonthInput,
    await getSalaryActor(req),
  )
  sendSuccess(res, result, {
    statusCode: 201,
    message:
      result.created > 0
        ? `Generated ${result.created} payroll record(s)`
        : 'Payroll already up to date for this month',
  })
}

export async function updateSalaryHandler(req: Request, res: Response): Promise<void> {
  const salary = await updateSalary(
    req.params.id as string,
    req.body as UpdateSalaryInput,
    await getSalaryActor(req),
  )
  sendSuccess(res, { salary }, { message: 'Salary record updated successfully' })
}

export async function updateSalaryStatusHandler(req: Request, res: Response): Promise<void> {
  const salary = await updateSalaryStatus(
    req.params.id as string,
    req.body as UpdateSalaryStatusInput,
    await getSalaryActor(req),
  )
  sendSuccess(res, { salary }, { message: 'Salary status updated successfully' })
}

export async function bulkSalaryStatusHandler(req: Request, res: Response): Promise<void> {
  const result = await bulkUpdateSalaryStatus(
    req.body as BulkSalaryStatusInput,
    await getSalaryActor(req),
  )
  sendSuccess(res, result, { message: 'Salary statuses updated successfully' })
}

export async function deleteSalaryHandler(req: Request, res: Response): Promise<void> {
  await deleteSalary(req.params.id as string, await getSalaryActor(req))
  sendSuccess(res, { deleted: true }, { message: 'Salary record deleted successfully' })
}

export async function getEmployeeDefaultsHandler(req: Request, res: Response): Promise<void> {
  const defaults = await getEmployeeDefaults(
    req.params.employeeId as string,
    await getSalaryActor(req),
  )
  sendSuccess(res, { defaults })
}

export async function getEmployeePfHandler(req: Request, res: Response): Promise<void> {
  const pf = await getEmployeePfAccount(
    req.params.employeeId as string,
    await getSalaryActor(req),
  )
  sendSuccess(res, { pf })
}

export async function downloadSalarySlipHandler(req: Request, res: Response): Promise<void> {
  const file = await downloadSalarySlip(req.params.id as string, await getSalaryActor(req))
  sendFile(res, file)
}

export async function getPayrollSettingsHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const settings = await getPayrollSettings(actor.companyId)
  sendSuccess(res, { settings })
}

export async function updatePayrollSettingsHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const settings = await updatePayrollSettings(
    actor.companyId,
    req.body as UpdatePayrollSettingsInput,
  )
  sendSuccess(res, { settings }, { message: 'Payroll settings updated' })
}

export async function createPayrollComponentHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const component = await createPayrollComponent(
    actor.companyId,
    req.body as CreatePayrollComponentInput,
  )
  sendSuccess(res, { component }, { statusCode: 201, message: 'Component created' })
}

export async function updatePayrollComponentHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const component = await updatePayrollComponent(
    actor.companyId,
    req.params.id as string,
    req.body as UpdatePayrollComponentInput,
  )
  sendSuccess(res, { component }, { message: 'Component updated' })
}

export async function deletePayrollComponentHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  await deletePayrollComponent(actor.companyId, req.params.id as string)
  sendSuccess(res, { deleted: true }, { message: 'Component deleted' })
}

export async function getEmployeeCompensationHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const actor = await getSalaryActor(req)
  const compensation = await getEmployeeCompensation(
    actor.companyId,
    req.params.employeeId as string,
  )
  sendSuccess(res, { compensation })
}

export async function createCompensationEventHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const actor = await getSalaryActor(req)
  const input = req.body as CreateCompensationEventInput
  const result = await createCompensationEvent(
    actor.companyId,
    req.params.employeeId as string,
    {
      ...input,
      allowances: input.allowances as
        | import('./compensation-event.model.js').CompensationAllowances
        | undefined,
    },
    actor.id,
  )
  let regenerated = 0
  if (result.shouldRegenerateFrom) {
    regenerated = await regeneratePendingForEmployee(
      actor.companyId,
      req.params.employeeId as string,
      result.shouldRegenerateFrom.month,
      result.shouldRegenerateFrom.year,
    )
  }
  sendSuccess(
    res,
    { event: result.event, regenerated },
    { statusCode: 201, message: 'Compensation updated' },
  )
}

export async function listAssignmentsHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const assignments = await listAssignments(
    actor.companyId,
    req.params.employeeId as string,
  )
  sendSuccess(res, { assignments })
}

export async function createAssignmentHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const assignment = await createAssignment(
    actor.companyId,
    req.params.employeeId as string,
    req.body as CreateAssignmentInput,
  )
  sendSuccess(res, { assignment }, { statusCode: 201, message: 'Assignment created' })
}

export async function updateAssignmentHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const assignment = await updateAssignment(
    actor.companyId,
    req.params.assignmentId as string,
    req.body as UpdateAssignmentInput,
  )
  sendSuccess(res, { assignment }, { message: 'Assignment updated' })
}

export async function deleteAssignmentHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  await deleteAssignment(actor.companyId, req.params.assignmentId as string)
  sendSuccess(res, { deleted: true }, { message: 'Assignment deleted' })
}

export async function listLoansHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const loans = await listLoans(actor.companyId, req.params.employeeId as string)
  sendSuccess(res, { loans })
}

export async function createLoanHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const loan = await createLoan(
    actor.companyId,
    req.params.employeeId as string,
    req.body as CreateLoanInput,
  )
  sendSuccess(res, { loan }, { statusCode: 201, message: 'Loan created' })
}

export async function cancelLoanHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const loan = await cancelLoan(actor.companyId, req.params.loanId as string)
  sendSuccess(res, { loan }, { message: 'Loan cancelled' })
}

export async function listIncrementDueHandler(req: Request, res: Response): Promise<void> {
  const actor = await getSalaryActor(req)
  const due = await listIncrementDueEmployees(actor.companyId)
  sendSuccess(res, { due })
}

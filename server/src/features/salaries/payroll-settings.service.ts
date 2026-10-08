import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import {
  CompanyPayrollSettings,
  type ExcessLeaveMode,
  type ICompanyPayrollSettings,
  type IncrementPolicy,
  type LeavePayrollPolicy,
  type PfBase,
  type PfSettings,
} from './company-payroll-settings.model.js'
import {
  PayrollComponent,
  type IPayrollComponent,
  type PayrollCalcType,
  type PayrollComponentKind,
} from './payroll-component.model.js'
import { DEFAULT_PAYROLL_COMPONENTS } from './payroll-defaults.js'

export type PayrollComponentDto = {
  id: string
  code: string
  name: string
  kind: PayrollComponentKind
  calcType: PayrollCalcType
  defaultValue: number
  isSystem: boolean
  active: boolean
  sortOrder: number
}

export type CompanyPayrollSettingsDto = {
  companyId: string
  pf: PfSettings
  leavePolicy: LeavePayrollPolicy
  incrementPolicy: IncrementPolicy
  components: PayrollComponentDto[]
}

function toComponentDto(doc: IPayrollComponent): PayrollComponentDto {
  return {
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    kind: doc.kind,
    calcType: doc.calcType,
    defaultValue: doc.defaultValue,
    isSystem: doc.isSystem,
    active: doc.active,
    sortOrder: doc.sortOrder,
  }
}

export async function ensurePayrollCatalog(companyId: string): Promise<IPayrollComponent[]> {
  const existing = await PayrollComponent.find({ companyId }).sort({ sortOrder: 1 })
  if (existing.length > 0) return existing

  await PayrollComponent.insertMany(
    DEFAULT_PAYROLL_COMPONENTS.map((c) => ({
      companyId: new Types.ObjectId(companyId),
      ...c,
      active: true,
    })),
  )

  return PayrollComponent.find({ companyId }).sort({ sortOrder: 1 })
}

export async function ensurePayrollSettings(
  companyId: string,
): Promise<ICompanyPayrollSettings> {
  await ensurePayrollCatalog(companyId)

  let settings = await CompanyPayrollSettings.findOne({ companyId })
  if (!settings) {
    settings = await CompanyPayrollSettings.create({
      companyId,
      pf: {
        enabled: false,
        employeePercent: 0,
        employerPercent: 0,
        base: 'basic',
      },
      leavePolicy: {
        excessLeaveMode: 'reject',
        leaveDeductionDivisor: 30,
        encashmentEnabled: false,
        encashmentDivisor: 30,
      },
      incrementPolicy: {
        probationMonths: 6,
        permanentMonths: 12,
        eligibleFrom: 'confirmation_or_last_increment',
      },
    })
  }
  // Backfill incrementPolicy for older documents
  if (!settings.incrementPolicy || !settings.incrementPolicy.probationMonths) {
    settings.incrementPolicy = {
      probationMonths: 6,
      permanentMonths: 12,
      eligibleFrom: 'confirmation_or_last_increment',
    }
    settings.markModified('incrementPolicy')
    await settings.save()
  }
  return settings
}

export async function getPayrollSettings(companyId: string): Promise<CompanyPayrollSettingsDto> {
  const settings = await ensurePayrollSettings(companyId)
  const components = await ensurePayrollCatalog(companyId)
  return {
    companyId,
    pf: {
      enabled: settings.pf.enabled,
      employeePercent: settings.pf.employeePercent,
      employerPercent: settings.pf.employerPercent,
      base: settings.pf.base,
    },
    leavePolicy: {
      excessLeaveMode: settings.leavePolicy.excessLeaveMode,
      leaveDeductionDivisor: settings.leavePolicy.leaveDeductionDivisor,
      encashmentEnabled: settings.leavePolicy.encashmentEnabled,
      encashmentDivisor: settings.leavePolicy.encashmentDivisor,
    },
    incrementPolicy: {
      probationMonths: settings.incrementPolicy.probationMonths,
      permanentMonths: settings.incrementPolicy.permanentMonths,
      eligibleFrom: settings.incrementPolicy.eligibleFrom,
    },
    components: components.map(toComponentDto),
  }
}

export type UpdatePayrollSettingsInput = {
  pf?: Partial<PfSettings>
  leavePolicy?: Partial<LeavePayrollPolicy>
  incrementPolicy?: Partial<IncrementPolicy>
}

export async function updatePayrollSettings(
  companyId: string,
  input: UpdatePayrollSettingsInput,
): Promise<CompanyPayrollSettingsDto> {
  const settings = await ensurePayrollSettings(companyId)

  if (input.pf) {
    if (input.pf.enabled !== undefined) settings.pf.enabled = input.pf.enabled
    if (input.pf.employeePercent !== undefined) {
      settings.pf.employeePercent = input.pf.employeePercent
    }
    if (input.pf.employerPercent !== undefined) {
      settings.pf.employerPercent = input.pf.employerPercent
    }
    if (input.pf.base !== undefined) settings.pf.base = input.pf.base as PfBase
    settings.markModified('pf')
  }

  if (input.leavePolicy) {
    if (input.leavePolicy.excessLeaveMode !== undefined) {
      settings.leavePolicy.excessLeaveMode = input.leavePolicy
        .excessLeaveMode as ExcessLeaveMode
    }
    if (input.leavePolicy.leaveDeductionDivisor !== undefined) {
      settings.leavePolicy.leaveDeductionDivisor = input.leavePolicy.leaveDeductionDivisor
    }
    if (input.leavePolicy.encashmentEnabled !== undefined) {
      settings.leavePolicy.encashmentEnabled = input.leavePolicy.encashmentEnabled
    }
    if (input.leavePolicy.encashmentDivisor !== undefined) {
      settings.leavePolicy.encashmentDivisor = input.leavePolicy.encashmentDivisor
    }
    settings.markModified('leavePolicy')
  }

  if (input.incrementPolicy) {
    if (input.incrementPolicy.probationMonths !== undefined) {
      settings.incrementPolicy.probationMonths = input.incrementPolicy.probationMonths
    }
    if (input.incrementPolicy.permanentMonths !== undefined) {
      settings.incrementPolicy.permanentMonths = input.incrementPolicy.permanentMonths
    }
    if (input.incrementPolicy.eligibleFrom !== undefined) {
      settings.incrementPolicy.eligibleFrom = input.incrementPolicy.eligibleFrom
    }
    settings.markModified('incrementPolicy')
  }

  await settings.save()
  return getPayrollSettings(companyId)
}

export type UpsertComponentInput = {
  code?: string
  name: string
  kind: PayrollComponentKind
  calcType?: PayrollCalcType
  defaultValue?: number
  active?: boolean
  sortOrder?: number
}

export async function createPayrollComponent(
  companyId: string,
  input: UpsertComponentInput,
): Promise<PayrollComponentDto> {
  await ensurePayrollCatalog(companyId)
  const code = (input.code ?? input.name)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  if (!code) {
    throw new AppError('Component code is required', 400, 'INVALID_CODE')
  }

  const existing = await PayrollComponent.findOne({ companyId, code })
  if (existing) {
    throw new AppError('A component with this code already exists', 409, 'COMPONENT_EXISTS')
  }

  const maxSort = await PayrollComponent.findOne({ companyId })
    .sort({ sortOrder: -1 })
    .select('sortOrder')

  const doc = await PayrollComponent.create({
    companyId,
    code,
    name: input.name.trim(),
    kind: input.kind,
    calcType: input.calcType ?? 'fixed',
    defaultValue: input.defaultValue ?? 0,
    isSystem: false,
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? (maxSort?.sortOrder ?? 0) + 10,
  })

  return toComponentDto(doc)
}

export async function updatePayrollComponent(
  companyId: string,
  componentId: string,
  input: Partial<UpsertComponentInput>,
): Promise<PayrollComponentDto> {
  if (!Types.ObjectId.isValid(componentId)) {
    throw new AppError('Component not found', 404, 'COMPONENT_NOT_FOUND')
  }

  const doc = await PayrollComponent.findOne({ _id: componentId, companyId })
  if (!doc) {
    throw new AppError('Component not found', 404, 'COMPONENT_NOT_FOUND')
  }

  if (input.name !== undefined) doc.name = input.name.trim()
  if (input.calcType !== undefined && !doc.isSystem) doc.calcType = input.calcType
  if (input.defaultValue !== undefined) doc.defaultValue = input.defaultValue
  if (input.active !== undefined) {
    // Basic is always required for payroll; PF on/off is company PF settings
    if (doc.code === 'BASIC' && input.active === false) {
      throw new AppError('Basic salary cannot be turned off', 400, 'SYSTEM_COMPONENT')
    }
    if (doc.code === 'PF') {
      throw new AppError(
        'Provident Fund is controlled in PF settings (enable/disable + percentages)',
        400,
        'USE_PF_SETTINGS',
      )
    }
    doc.active = input.active
  }
  if (input.sortOrder !== undefined) doc.sortOrder = input.sortOrder
  if (input.kind !== undefined && !doc.isSystem) doc.kind = input.kind

  await doc.save()
  return toComponentDto(doc)
}

export async function deletePayrollComponent(
  companyId: string,
  componentId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(componentId)) {
    throw new AppError('Component not found', 404, 'COMPONENT_NOT_FOUND')
  }

  const doc = await PayrollComponent.findOne({ _id: componentId, companyId })
  if (!doc) {
    throw new AppError('Component not found', 404, 'COMPONENT_NOT_FOUND')
  }
  if (doc.isSystem) {
    throw new AppError('System components cannot be deleted', 400, 'SYSTEM_COMPONENT')
  }

  await doc.deleteOne()
}

export async function getActiveComponents(companyId: string): Promise<IPayrollComponent[]> {
  await ensurePayrollCatalog(companyId)
  return PayrollComponent.find({ companyId, active: true }).sort({ sortOrder: 1 })
}

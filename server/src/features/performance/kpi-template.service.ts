import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import {
  DEFAULT_EMPLOYEE_KPI_CATEGORIES,
  DEFAULT_MANAGER_KPI_CATEGORIES,
} from './kpi-default-template.js'
import { KpiTemplate, type IKpiTemplate, type KpiTemplateRole } from './kpi-template.model.js'
import type { KpiTemplateDto } from './performance.types.js'
import type { CreateKpiTemplateInput, UpdateKpiTemplateInput } from './performance.validation.js'

function toTemplateDto(doc: IKpiTemplate): KpiTemplateDto {
  return {
    id: doc._id.toString(),
    companyId: doc.companyId.toString(),
    role: doc.role,
    name: doc.name,
    isActive: doc.isActive,
    version: doc.version,
    categories: doc.categories.map((c) => ({
      name: c.name,
      weightPct: c.weightPct,
      maxMarks: c.maxMarks,
      subKpis: c.subKpis.map((s) => ({
        id: s.id,
        label: s.label,
        maxMarks: s.maxMarks,
      })),
    })),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

function assertKpiSetup(role: UserRole, permissions: Permission[]): void {
  if (!hasPermission(role, 'performance:kpi-setup', permissions)) {
    throw new AppError('KPI template setup permission required', 403, 'FORBIDDEN')
  }
}

export async function ensureDefaultKpiTemplates(companyId: string): Promise<void> {
  const companyObjectId = new Types.ObjectId(companyId)
  const roles: KpiTemplateRole[] = ['employee', 'manager']

  for (const role of roles) {
    const existing = await KpiTemplate.findOne({ companyId: companyObjectId, role }).select('_id')
    if (existing) continue

    await KpiTemplate.create({
      companyId: companyObjectId,
      role,
      name: role === 'employee' ? 'Default Employee KPI Scorecard' : 'Default Manager KPI Scorecard',
      isActive: true,
      version: 1,
      categories:
        role === 'employee' ? DEFAULT_EMPLOYEE_KPI_CATEGORIES : DEFAULT_MANAGER_KPI_CATEGORIES,
    })
  }
}

export async function getActiveKpiTemplate(
  companyId: string,
  role: KpiTemplateRole,
): Promise<IKpiTemplate> {
  await ensureDefaultKpiTemplates(companyId)
  const template = await KpiTemplate.findOne({
    companyId,
    role,
    isActive: true,
  }).sort({ version: -1 })

  if (!template) {
    throw new AppError(`No active KPI template for role ${role}`, 404, 'NOT_FOUND')
  }
  return template
}

export async function listKpiTemplates(
  companyId: string,
  role: UserRole,
  permissions: Permission[],
  filterRole?: KpiTemplateRole,
): Promise<KpiTemplateDto[]> {
  if (
    !hasPermission(role, 'performance:kpi-setup', permissions) &&
    !hasPermission(role, 'performance:write', permissions) &&
    !hasPermission(role, 'performance:read', permissions)
  ) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  await ensureDefaultKpiTemplates(companyId)
  const query: Record<string, unknown> = { companyId }
  if (filterRole) query.role = filterRole

  const docs = await KpiTemplate.find(query).sort({ role: 1, version: -1 })
  return docs.map(toTemplateDto)
}

export async function getKpiTemplateById(
  companyId: string,
  templateId: string,
): Promise<KpiTemplateDto> {
  const doc = await KpiTemplate.findOne({ _id: templateId, companyId })
  if (!doc) throw new AppError('KPI template not found', 404, 'NOT_FOUND')
  return toTemplateDto(doc)
}

export async function createKpiTemplate(
  companyId: string,
  role: UserRole,
  permissions: Permission[],
  input: CreateKpiTemplateInput,
): Promise<KpiTemplateDto> {
  assertKpiSetup(role, permissions)

  const latest = await KpiTemplate.findOne({ companyId, role: input.role }).sort({ version: -1 })
  const version = (latest?.version ?? 0) + 1

  if (input.isActive !== false) {
    await KpiTemplate.updateMany(
      { companyId, role: input.role, isActive: true },
      { $set: { isActive: false } },
    )
  }

  const doc = await KpiTemplate.create({
    companyId,
    role: input.role,
    name: input.name,
    isActive: input.isActive !== false,
    version,
    categories: input.categories,
  })

  return toTemplateDto(doc)
}

export async function updateKpiTemplate(
  companyId: string,
  role: UserRole,
  permissions: Permission[],
  templateId: string,
  input: UpdateKpiTemplateInput,
): Promise<KpiTemplateDto> {
  assertKpiSetup(role, permissions)

  const existing = await KpiTemplate.findOne({ _id: templateId, companyId })
  if (!existing) throw new AppError('KPI template not found', 404, 'NOT_FOUND')

  const structuralChange = input.categories != null
  if (structuralChange) {
    // Version bump: create new inactive-or-active revision; keep old as historical
    if (input.isActive !== false) {
      await KpiTemplate.updateMany(
        { companyId, role: existing.role, isActive: true },
        { $set: { isActive: false } },
      )
    }
    const latest = await KpiTemplate.findOne({ companyId, role: existing.role }).sort({
      version: -1,
    })
    const doc = await KpiTemplate.create({
      companyId,
      role: existing.role,
      name: input.name ?? existing.name,
      isActive: input.isActive !== false,
      version: (latest?.version ?? existing.version) + 1,
      categories: input.categories,
    })
    return toTemplateDto(doc)
  }

  if (input.name != null) existing.name = input.name
  if (input.isActive != null) {
    if (input.isActive) {
      await KpiTemplate.updateMany(
        { companyId, role: existing.role, isActive: true, _id: { $ne: existing._id } },
        { $set: { isActive: false } },
      )
    }
    existing.isActive = input.isActive
  }
  await existing.save()
  return toTemplateDto(existing)
}

export async function activateKpiTemplate(
  companyId: string,
  role: UserRole,
  permissions: Permission[],
  templateId: string,
): Promise<KpiTemplateDto> {
  assertKpiSetup(role, permissions)

  const existing = await KpiTemplate.findOne({ _id: templateId, companyId })
  if (!existing) throw new AppError('KPI template not found', 404, 'NOT_FOUND')

  await KpiTemplate.updateMany(
    { companyId, role: existing.role, isActive: true },
    { $set: { isActive: false } },
  )
  existing.isActive = true
  await existing.save()
  return toTemplateDto(existing)
}

export async function getActiveKpiTemplateDto(
  companyId: string,
  templateRole: KpiTemplateRole,
): Promise<KpiTemplateDto> {
  const doc = await getActiveKpiTemplate(companyId, templateRole)
  return toTemplateDto(doc)
}

import { Types } from 'mongoose'
import { env } from '../../config/env.js'
import { InviteToken } from '../auth/inviteToken.model.js'
import { RefreshToken } from '../auth/refreshToken.model.js'
import { User } from '../auth/user.model.js'
import { LeaveRequest } from '../leave/leave-request.model.js'
import { LeaveType } from '../leave/leave-type.model.js'
import { Milestone } from '../projects/milestone.model.js'
import { Project } from '../projects/project.model.js'
import { CompanyRole } from '../roles/companyRole.model.js'
import { BoardColumn } from '../tasks/board-column.model.js'
import { Task } from '../tasks/task.model.js'
import { AppError } from '../../utils/AppError.js'
import {
  buildPaginatedResult,
  buildSearchFilter,
  parsePagination,
} from '../../utils/pagination.js'
import { generatePlaceholderPassword } from '../../utils/password.js'
import { createInviteToken } from '../../services/invite.service.js'
import {
  buildInviteUrl,
  platformEmailBrand,
  sendInviteEmail,
} from '../../services/mail.service.js'
import { resolveActorFullName } from '../notifications/actor-name.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { Company, PLAN_USER_LIMITS, type ICompany } from './company.model.js'
import { resolveEnabledHubs, type CompanyHub } from './company-hubs.js'
import type { CreateCompanyInput, ListCompaniesQuery, UpdateCompanyInput, UpdateMyCompanyPreferencesInput } from './company.validation.js'

export type CompanyActor = {
  id: string
  fullName?: string
}

const PLAN_MONTHLY_PRICE: Record<string, number> = {
  basic: 29,
  pro: 99,
  enterprise: 299,
}

export type CompanyActionVariant = 'view' | 'edit' | 'reactivate' | 'suspend'

function resolveActionVariant(status: string): CompanyActionVariant {
  if (status === 'inactive') return 'reactivate'
  if (status === 'trial') return 'view'
  return 'edit'
}

export type CompanyRow = {
  id: string
  name: string
  plan: string
  users: number
  userLimit: number
  status: string
  rating: number
  actionVariant: CompanyActionVariant
}

function toCompanyRow(company: ICompany): CompanyRow {
  return {
    id: company._id.toString(),
    name: company.name,
    plan: company.subscriptionPlan,
    users: company.users ?? 0,
    userLimit: company.userLimit ?? 0,
    status: company.status,
    rating: company.rating ?? 0,
    actionVariant: resolveActionVariant(company.status),
  }
}

export type CompanySummary = {
  id: string
  name: string
  email: string
  phone: string
  subscriptionPlan: string
  status: string
  adminUserId: string
  createdAt: string
}

export type CompanyDetail = CompanySummary & {
  startingDate?: string
  users: number
  userLimit: number
  country: string
  city: string
  addressLine: string
  postalCode: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  dateFormat: string
  enabledHubs: CompanyHub[]
  admin: {
    id: string
    email: string
    fullName: string
    status: string
    avatar?: string
  }
}

function toCompanySummary(company: ICompany): CompanySummary {
  return {
    id: company._id.toString(),
    name: company.name,
    email: company.email,
    phone: company.phone,
    subscriptionPlan: company.subscriptionPlan,
    status: company.status,
    adminUserId: company.adminUserId?.toString() ?? '',
    createdAt: company.createdAt.toISOString(),
  }
}

function toCompanyDetail(
  company: ICompany,
  admin: { id: string; email: string; fullName: string; status: string; avatar?: string },
): CompanyDetail {
  return {
    ...toCompanySummary(company),
    startingDate: company.startingDate?.toISOString(),
    users: company.users ?? 0,
    userLimit: company.userLimit ?? 0,
    country: company.country,
    city: company.city,
    addressLine: company.addressLine,
    postalCode: company.postalCode,
    logoUrl: company.logoUrl,
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    timezone: company.timezone,
    currency: company.currency,
    dateFormat: company.dateFormat,
    enabledHubs: resolveEnabledHubs(company.enabledHubs),
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      status: admin.status,
      ...(admin.avatar ? { avatar: admin.avatar } : {}),
    },
  }
}

function toAdminDto(admin: {
  _id: Types.ObjectId
  email: string
  fullName: string
  status: string
  avatar?: string
}) {
  return {
    id: admin._id.toString(),
    email: admin.email,
    fullName: admin.fullName,
    status: admin.status,
    ...(admin.avatar ? { avatar: admin.avatar } : {}),
  }
}

export type CreateCompanyResult = {
  company: CompanyDetail
  devInviteToken?: string
}

export async function createCompany(
  payload: CreateCompanyInput,
  acting?: CompanyActor,
): Promise<CreateCompanyResult> {
  const adminEmail = payload.adminEmail.toLowerCase()

  const existingUser = await User.findOne({ email: adminEmail })
  if (existingUser) {
    throw new AppError('An account with this admin email already exists', 409, 'DUPLICATE_EMAIL')
  }

  let company: ICompany | null = null
  let adminUser = null

  try {
    company = await Company.create({
      name: payload.companyName,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      startingDate: payload.startingDate,
      subscriptionPlan: payload.subscriptionPlan,
      status: payload.startAs,
      ...(payload.users !== undefined ? { users: payload.users } : {}),
      ...(payload.userLimit !== undefined ? { userLimit: payload.userLimit } : {}),
      ...(payload.rating !== undefined ? { rating: payload.rating } : {}),
      country: payload.country,
      city: payload.city,
      addressLine: payload.addressLine,
      postalCode: payload.postalCode,
      logoUrl: payload.logoUrl,
      primaryColor: payload.primaryColor,
      secondaryColor: payload.secondaryColor,
      timezone: payload.timezone,
      currency: payload.currency,
      dateFormat: payload.dateFormat,
      enabledHubs: resolveEnabledHubs(payload.enabledHubs),
    })

    adminUser = await User.create({
      email: adminEmail,
      password: generatePlaceholderPassword(),
      fullName: payload.adminFullName,
      role: 'admin',
      status: 'pending',
      companyId: company._id,
    })

    company.adminUserId = adminUser._id
    await company.save()

    const rawToken = await createInviteToken(adminUser._id.toString(), 'invite')
    const inviteUrl = buildInviteUrl(rawToken)
    await sendInviteEmail({
      to: adminUser.email,
      inviteUrl,
      recipientName: adminUser.fullName,
      companyName: company.name,
      brand: platformEmailBrand(),
      purpose: 'company_admin',
      roleLabel: 'Company Administrator',
      invitedBy: acting?.fullName?.trim() || 'BizFlow',
      companyLocation: [company.city, company.country].filter(Boolean).join(', ') || undefined,
      subscriptionPlan: company.subscriptionPlan,
    })

    if (acting) {
      await dispatchDomainEventSafe({
        type: 'company.created',
        actor: {
          id: acting.id,
          fullName: acting.fullName ?? (await resolveActorFullName(acting.id)),
          companyId: null,
        },
        entityId: company._id.toString(),
        context: { entityLabel: company.name },
      })
    }

    return {
      company: toCompanyDetail(company, toAdminDto(adminUser)),
      ...(env.NODE_ENV === 'development' ? { devInviteToken: rawToken } : {}),
    }
  } catch (error) {
    if (adminUser) await User.deleteOne({ _id: adminUser._id })
    if (company) await Company.deleteOne({ _id: company._id })
    throw error
  }
}

export async function listCompanies(query: ListCompaniesQuery) {
  const { page, limit, skip } = parsePagination(query)
  const filter: Record<string, unknown> = {}

  if (query.status) filter.status = query.status
  if (typeof query.rating === 'number') filter.rating = { $gte: query.rating }

  const searchFilter = buildSearchFilter(query.search, ['name', 'email', 'subscriptionPlan'])
  if (searchFilter) Object.assign(filter, searchFilter)

  const [companies, total] = await Promise.all([
    Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Company.countDocuments(filter),
  ])

  const result = buildPaginatedResult(
    companies.map(toCompanyRow),
    total,
    page,
    limit,
  )

  return {
    companies: result.items,
    pagination: result.pagination,
  }
}

export type CompanyStats = {
  totalCompanies: number
  activeCompanies: number
  trialCompanies: number
  inactiveCompanies: number
  licensedUsers: number
  activeUsers: number
  platformRevenue: number
}

export async function getCompanyStats(asOf?: Date): Promise<CompanyStats> {
  const createdBefore = asOf ? { createdAt: { $lt: asOf } } : {}

  const [statusCounts, totals, planBreakdown] = await Promise.all([
    Company.aggregate<{ _id: string; count: number }>([
      ...(Object.keys(createdBefore).length ? [{ $match: createdBefore }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Company.aggregate<{ _id: null; licensedUsers: number; activeUsers: number; total: number }>([
      ...(Object.keys(createdBefore).length ? [{ $match: createdBefore }] : []),
      {
        $group: {
          _id: null,
          licensedUsers: { $sum: '$userLimit' },
          activeUsers: { $sum: '$users' },
          total: { $sum: 1 },
        },
      },
    ]),
    Company.aggregate<{ _id: string; count: number }>([
      { $match: { ...createdBefore, status: { $ne: 'inactive' } } },
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } },
    ]),
  ])

  const byStatus = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]))
  const totalsRow = totals[0]

  const platformRevenue = planBreakdown.reduce(
    (sum, row) => sum + (PLAN_MONTHLY_PRICE[row._id] ?? 0) * row.count,
    0,
  )

  return {
    totalCompanies: totalsRow?.total ?? 0,
    activeCompanies: byStatus.active ?? 0,
    trialCompanies: byStatus.trial ?? 0,
    inactiveCompanies: byStatus.inactive ?? 0,
    licensedUsers: totalsRow?.licensedUsers ?? 0,
    activeUsers: totalsRow?.activeUsers ?? 0,
    platformRevenue,
  }
}

export type CompanyGrowthPoint = {
  month: string
  newCompanies: number
  totalUsers: number
}

export async function getCompanyGrowth(months = 6, asOf = new Date()): Promise<CompanyGrowthPoint[]> {
  const origin = new Date(asOf.getFullYear(), asOf.getMonth(), 1)
  const series: CompanyGrowthPoint[] = []
  const includeYear = months > 6

  for (let i = months - 1; i >= 0; i -= 1) {
    const start = new Date(origin.getFullYear(), origin.getMonth() - i, 1)
    const end = new Date(origin.getFullYear(), origin.getMonth() - i + 1, 1)
    const short = start.toLocaleString('en-US', { month: 'short' })
    const label = includeYear
      ? `${short} '${String(start.getFullYear()).slice(-2)}`
      : short

    const [newCompanies, totalUsers] = await Promise.all([
      Company.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      // Cumulative platform users (company admins + people added), excluding superadmins
      User.countDocuments({
        createdAt: { $lt: end },
        role: { $ne: 'superadmin' },
      }),
    ])

    series.push({
      month: label,
      newCompanies,
      totalUsers,
    })
  }

  return series
}

export type CompanyPreferences = {
  id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  addressLine: string
  postalCode: string
  timezone: string
  currency: string
  dateFormat: string
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
}

function toCompanyPreferences(company: ICompany): CompanyPreferences {
  return {
    id: company._id.toString(),
    name: company.name,
    email: company.email,
    phone: company.phone,
    country: company.country,
    city: company.city,
    addressLine: company.addressLine,
    postalCode: company.postalCode,
    timezone: company.timezone,
    currency: company.currency,
    dateFormat: company.dateFormat,
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    logoUrl: company.logoUrl,
  }
}

export async function getMyCompanyPreferences(companyId: string): Promise<CompanyPreferences> {
  const company = await Company.findById(companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }
  return toCompanyPreferences(company)
}

export async function updateMyCompanyPreferences(
  companyId: string,
  payload: UpdateMyCompanyPreferencesInput,
): Promise<CompanyPreferences> {
  const company = await Company.findById(companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  if (payload.companyName !== undefined) company.name = payload.companyName
  if (payload.email !== undefined) company.email = payload.email.toLowerCase()
  if (payload.phone !== undefined) company.phone = payload.phone
  if (payload.country !== undefined) company.country = payload.country
  if (payload.city !== undefined) company.city = payload.city
  if (payload.addressLine !== undefined) company.addressLine = payload.addressLine
  if (payload.postalCode !== undefined) company.postalCode = payload.postalCode
  if (payload.logoUrl !== undefined) company.logoUrl = payload.logoUrl
  if (payload.primaryColor !== undefined) company.primaryColor = payload.primaryColor
  if (payload.secondaryColor !== undefined) company.secondaryColor = payload.secondaryColor
  if (payload.timezone !== undefined) company.timezone = payload.timezone
  if (payload.currency !== undefined) company.currency = payload.currency
  if (payload.dateFormat !== undefined) company.dateFormat = payload.dateFormat

  await company.save()
  return toCompanyPreferences(company)
}

export async function getCompanyById(companyId: string): Promise<CompanyDetail> {
  const company = await Company.findById(companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  const admin = await User.findById(company.adminUserId)
  if (!admin) {
    throw new AppError('Company admin not found', 404, 'USER_NOT_FOUND')
  }

  return toCompanyDetail(company, toAdminDto(admin))
}

export async function resendCompanyAdminInvite(companyId: string): Promise<{ devInviteToken?: string }> {
  const company = await Company.findById(companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  const admin = await User.findById(company.adminUserId)
  if (!admin) {
    throw new AppError('Company admin not found', 404, 'USER_NOT_FOUND')
  }

  if (admin.role !== 'admin' || admin.status !== 'pending') {
    throw new AppError('Admin invitation is not pending', 400, 'INVITE_NOT_PENDING')
  }

  const rawToken = await createInviteToken(admin._id.toString(), 'invite')
  const inviteUrl = buildInviteUrl(rawToken)
  await sendInviteEmail({
    to: admin.email,
    inviteUrl,
    recipientName: admin.fullName,
    companyName: company.name,
    brand: platformEmailBrand(),
    purpose: 'company_admin',
    roleLabel: 'Company Administrator',
    invitedBy: 'BizFlow',
    companyLocation: [company.city, company.country].filter(Boolean).join(', ') || undefined,
    subscriptionPlan: company.subscriptionPlan,
  })

  return env.NODE_ENV === 'development' ? { devInviteToken: rawToken } : {}
}

export async function updateCompany(
  companyId: string,
  payload: UpdateCompanyInput,
): Promise<CompanyDetail> {
  const company = await Company.findById(companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  const admin = await User.findById(company.adminUserId)
  if (!admin) {
    throw new AppError('Company admin not found', 404, 'USER_NOT_FOUND')
  }

  const previousStatus = company.status

  if (payload.companyName !== undefined) company.name = payload.companyName
  if (payload.email !== undefined) company.email = payload.email.toLowerCase()
  if (payload.phone !== undefined) company.phone = payload.phone
  if (payload.startingDate !== undefined) company.startingDate = payload.startingDate
  if (payload.subscriptionPlan !== undefined) {
    company.subscriptionPlan = payload.subscriptionPlan
    if (payload.userLimit === undefined) {
      company.userLimit = PLAN_USER_LIMITS[payload.subscriptionPlan]
    }
  }
  if (payload.status !== undefined) company.status = payload.status
  if (payload.users !== undefined) company.users = payload.users
  if (payload.userLimit !== undefined) company.userLimit = payload.userLimit
  if (payload.rating !== undefined) company.rating = payload.rating
  if (payload.country !== undefined) company.country = payload.country
  if (payload.city !== undefined) company.city = payload.city
  if (payload.addressLine !== undefined) company.addressLine = payload.addressLine
  if (payload.postalCode !== undefined) company.postalCode = payload.postalCode
  if (payload.logoUrl !== undefined) company.logoUrl = payload.logoUrl
  if (payload.primaryColor !== undefined) company.primaryColor = payload.primaryColor
  if (payload.secondaryColor !== undefined) company.secondaryColor = payload.secondaryColor
  if (payload.timezone !== undefined) company.timezone = payload.timezone
  if (payload.currency !== undefined) company.currency = payload.currency
  if (payload.dateFormat !== undefined) company.dateFormat = payload.dateFormat
  if (payload.enabledHubs !== undefined) {
    company.enabledHubs = resolveEnabledHubs(payload.enabledHubs)
  }

  if (payload.adminFullName !== undefined) {
    admin.fullName = payload.adminFullName
    await admin.save()
  }

  await company.save()

  if (company.status === 'inactive' && previousStatus !== 'inactive') {
    await revokeCompanyRefreshTokens(company._id)
  }

  return toCompanyDetail(company, toAdminDto(admin))
}

async function revokeCompanyRefreshTokens(companyObjectId: Types.ObjectId): Promise<void> {
  const users = await User.find({ companyId: companyObjectId }).select('_id')
  const userIds = users.map((user) => user._id)
  if (userIds.length === 0) return

  await RefreshToken.updateMany(
    { userId: { $in: userIds }, revokedAt: null },
    { revokedAt: new Date() },
  )
}

/** Permanently removes the company and all tenant data. */
export async function deleteCompany(companyId: string): Promise<void> {
  const company = await Company.findById(companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  const companyObjectId = new Types.ObjectId(companyId)
  const projects = await Project.find({ companyId: companyObjectId }).select('_id')
  const projectIds = projects.map((project) => project._id)

  await Task.deleteMany({ companyId: companyObjectId })
  await BoardColumn.deleteMany({ companyId: companyObjectId })
  if (projectIds.length > 0) {
    await Milestone.deleteMany({ projectId: { $in: projectIds } })
  }
  await Project.deleteMany({ companyId: companyObjectId })
  await LeaveRequest.deleteMany({ companyId: companyObjectId })
  await LeaveType.deleteMany({ companyId: companyObjectId })
  await CompanyRole.deleteMany({ companyId: companyObjectId })

  const users = await User.find({ companyId: companyObjectId }).select('_id')
  const userIds = users.map((user) => user._id)

  if (userIds.length > 0) {
    await RefreshToken.deleteMany({ userId: { $in: userIds } })
    await InviteToken.deleteMany({ userId: { $in: userIds } })
    await User.deleteMany({ _id: { $in: userIds } })
  }

  await company.deleteOne()
}

export async function resetCompanyAccess(companyId: string): Promise<void> {
  const company = await Company.findById(companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  await revokeCompanyRefreshTokens(company._id)
}

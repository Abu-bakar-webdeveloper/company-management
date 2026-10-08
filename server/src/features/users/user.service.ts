import { Types } from 'mongoose'
import { env } from '../../config/env.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import { Company } from '../companies/company.model.js'
import type { AuthUser, UserRole } from '../auth/auth.types.js'
import { RefreshToken } from '../auth/refreshToken.model.js'
import { User } from '../auth/user.model.js'
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
  companyEmailBrand,
  emailRoleLabel,
  sendInviteEmail,
} from '../../services/mail.service.js'
import { CompanyRole } from '../roles/companyRole.model.js'
import { assertCustomRoleAssignable } from '../roles/companyRole.service.js'
import { resolveActorFullName } from '../notifications/actor-name.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { assertValidManagerAssignment } from './manager.validation.js'
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './user.validation.js'

export type ActingAdmin = {
  id: string
  companyId: string
  role: UserRole
}

const CREATABLE_ROLES: Record<string, UserRole[]> = {
  admin: ['manager', 'hr', 'employee'],
  hr: ['employee'],
}

const MANAGEABLE_ROLES: Record<string, UserRole[]> = {
  admin: ['manager', 'hr', 'employee'],
  hr: ['employee'],
}

function getCreatableRoles(acting: ActingAdmin): UserRole[] {
  return CREATABLE_ROLES[acting.role] ?? []
}

function getManageableRoles(acting: ActingAdmin): UserRole[] {
  return MANAGEABLE_ROLES[acting.role] ?? []
}

function assertCompanyScope(userCompanyId: string | null | undefined, acting: ActingAdmin): void {
  if (!acting.companyId || userCompanyId !== acting.companyId) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
}

function assertManageable(targetRole: UserRole, acting: ActingAdmin): void {
  if (!getManageableRoles(acting).includes(targetRole)) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
}

function companyLocation(company: { city?: string; country?: string }): string | undefined {
  const parts = [company.city?.trim(), company.country?.trim()].filter(Boolean)
  return parts.length ? parts.join(', ') : undefined
}

async function resolveCustomRoleName(
  customRoleId?: Types.ObjectId | string | null,
): Promise<string | undefined> {
  if (!customRoleId) return undefined
  const role = await CompanyRole.findById(customRoleId).select('name')
  return role?.name?.trim() || undefined
}

async function nextEmployeeCode(companyId: string): Promise<string> {
  const users = await User.find({
    companyId,
    employeeCode: { $regex: /^EMP-\d+$/i },
  })
    .select('employeeCode')
    .lean()

  let max = 0
  for (const u of users) {
    const match = u.employeeCode?.match(/EMP-(\d+)/i)
    if (match) max = Math.max(max, Number.parseInt(match[1], 10))
  }
  return `EMP-${String(max + 1).padStart(3, '0')}`
}

export async function ensureEmployeeCode(
  user: InstanceType<typeof User>,
): Promise<string> {
  if (user.employeeCode) return user.employeeCode
  if (!user.companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const code = await nextEmployeeCode(user.companyId.toString())
  user.employeeCode = code
  await user.save()
  return code
}

export type CreateUserResult = {
  user: AuthUser
  devInviteToken?: string
}

export async function createUserByAdmin(
  payload: CreateUserInput,
  acting: ActingAdmin,
): Promise<CreateUserResult> {
  if (!getCreatableRoles(acting).includes(payload.role)) {
    throw new AppError('You are not allowed to create this role', 403, 'FORBIDDEN')
  }

  const existing = await User.findOne({ email: payload.email.toLowerCase() })
  if (existing) {
    throw new AppError('An account with this email already exists', 409, 'DUPLICATE_EMAIL')
  }

  const company = await Company.findById(acting.companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  if (payload.cnic) {
    const cnicTaken = await User.findOne({ companyId: acting.companyId, cnic: payload.cnic })
    if (cnicTaken) {
      throw new AppError('An account with this CNIC already exists', 409, 'DUPLICATE_CNIC')
    }
  }

  const fullName =
    payload.fullName ??
    [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim()

  let customRoleId: string | null = null
  let customRoleName: string | undefined
  if (payload.customRoleId) {
    if (acting.role !== 'admin') {
      throw new AppError('Only company admins can assign custom roles', 403, 'FORBIDDEN')
    }
    const assigned = await assertCustomRoleAssignable(
      payload.customRoleId,
      acting.companyId,
      payload.role,
    )
    customRoleId = payload.customRoleId
    customRoleName = assigned.name
  }

  let managerId: Types.ObjectId | null = null
  if (payload.managerId) {
    await assertValidManagerAssignment({
      managerId: payload.managerId,
      companyId: acting.companyId,
    })
    managerId = new Types.ObjectId(payload.managerId)
  }

  const employeeCode = await nextEmployeeCode(acting.companyId)

  const user = await User.create({
    email: payload.email.toLowerCase(),
    password: generatePlaceholderPassword(),
    fullName,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    cnic: payload.cnic,
    employeeCode,
    department: payload.department,
    jobTitle: payload.jobTitle,
    homeAddress: payload.homeAddress,
    joinDate: payload.joinDate,
    role: payload.role,
    customRoleId,
    managerId,
    status: 'pending',
    companyId: acting.companyId,
    ...(payload.avatar ? { avatar: payload.avatar } : {}),
    ...(payload.basicSalary != null ? { basicSalary: payload.basicSalary } : {}),
    ...(payload.hra != null ? { hra: payload.hra } : {}),
    ...(payload.utilityAllowance != null
      ? { utilityAllowance: payload.utilityAllowance }
      : {}),
    ...(payload.conveyanceAllowance != null
      ? { conveyanceAllowance: payload.conveyanceAllowance }
      : {}),
    ...(payload.providentFund != null ? { providentFund: payload.providentFund } : {}),
    ...(payload.bankName ? { bankName: payload.bankName } : {}),
    ...(payload.bankAccountNo ? { bankAccountNo: payload.bankAccountNo } : {}),
    ...(payload.employmentStage ? { employmentStage: payload.employmentStage } : {}),
    ...(payload.probationEndDate ? { probationEndDate: payload.probationEndDate } : {}),
    ...(payload.confirmationDate ? { confirmationDate: payload.confirmationDate } : {}),
  })

  let devInviteToken: string | undefined

  if (payload.sendInviteEmail) {
    const rawToken = await createInviteToken(user._id.toString(), 'invite')
    const inviteUrl = buildInviteUrl(rawToken)
    await sendInviteEmail({
      to: user.email,
      inviteUrl,
      recipientName: user.fullName,
      companyName: company.name,
      brand: companyEmailBrand(company),
      purpose: 'staff',
      roleLabel: emailRoleLabel(user.role, customRoleName),
      jobTitle: user.jobTitle,
      department: user.department,
      employeeCode: user.employeeCode,
      invitedBy: await resolveActorFullName(acting.id),
      companyLocation: companyLocation(company),
      joinDate: user.joinDate,
    })
    if (env.NODE_ENV === 'development') {
      devInviteToken = rawToken
    }
  }

  await dispatchDomainEventSafe({
    type: 'user.created',
    actor: {
      id: acting.id,
      fullName: await resolveActorFullName(acting.id),
      companyId: acting.companyId,
    },
    entityId: user._id.toString(),
    subjectUserId: user._id.toString(),
    context: { subjectName: user.fullName },
  })

  return {
    user: await enrichAuthUser(user, { includeReporteesCount: true }),
    ...(devInviteToken ? { devInviteToken } : {}),
  }
}

export async function listManagerOptions(acting: ActingAdmin): Promise<{ managers: AuthUser[] }> {
  if (!acting.companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const users = await User.find({
    companyId: acting.companyId,
    role: 'manager',
    status: 'active',
  })
    .select('-password')
    .sort({ fullName: 1 })

  const managers = await Promise.all(users.map((user) => enrichAuthUser(user)))

  return { managers }
}

export async function listUsers(query: ListUsersQuery, acting: ActingAdmin) {
  const { page, limit, skip } = parsePagination(query)
  const visibleRoles = getManageableRoles(acting)
  const filter: Record<string, unknown> = {
    companyId: acting.companyId,
    role: { $in: visibleRoles },
  }

  if (query.role) {
    filter.role = visibleRoles.includes(query.role) ? query.role : { $in: [] }
  }
  if (query.status) filter.status = query.status

  const searchFilter = buildSearchFilter(query.search, ['email', 'fullName', 'employeeCode'])
  if (searchFilter) Object.assign(filter, searchFilter)

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ])

  await Promise.all(
    users.map(async (user) => {
      if (!user.employeeCode) await ensureEmployeeCode(user)
    }),
  )

  const enrichedUsers = await Promise.all(users.map((user) => enrichAuthUser(user)))

  const result = buildPaginatedResult(enrichedUsers, total, page, limit)

  return {
    users: result.items,
    pagination: result.pagination,
  }
}

export async function getUserById(userId: string, acting: ActingAdmin): Promise<AuthUser> {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  assertCompanyScope(user.companyId?.toString() ?? null, acting)
  assertManageable(user.role, acting)

  await ensureEmployeeCode(user)

  return enrichAuthUser(user, { includeReporteesCount: true })
}

export async function updateUserByAdmin(
  userId: string,
  payload: UpdateUserInput,
  acting: ActingAdmin,
): Promise<AuthUser> {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  assertCompanyScope(user.companyId?.toString() ?? null, acting)
  assertManageable(user.role, acting)

  if (payload.role !== undefined && !getManageableRoles(acting).includes(payload.role)) {
    throw new AppError('You are not allowed to assign this role', 403, 'FORBIDDEN')
  }

  if (payload.customRoleId !== undefined) {
    if (acting.role !== 'admin') {
      throw new AppError('Only company admins can assign custom roles', 403, 'FORBIDDEN')
    }

    if (payload.customRoleId === null) {
      user.customRoleId = null
    } else {
      const nextRole = payload.role ?? user.role
      if (nextRole === 'admin' || nextRole === 'superadmin') {
        throw new AppError('Custom roles cannot be assigned to this user', 400, 'INVALID_ROLE')
      }
      await assertCustomRoleAssignable(
        payload.customRoleId,
        acting.companyId,
        nextRole as 'manager' | 'hr' | 'employee',
      )
      user.customRoleId = new Types.ObjectId(payload.customRoleId)
    }
  }

  if (payload.managerId !== undefined) {
    if (payload.managerId === null) {
      user.managerId = null
    } else {
      await assertValidManagerAssignment({
        managerId: payload.managerId,
        companyId: acting.companyId,
        userId: user._id.toString(),
      })
      user.managerId = new Types.ObjectId(payload.managerId)
    }
  }

  if (payload.fullName !== undefined) user.fullName = payload.fullName
  if (payload.firstName !== undefined) user.firstName = payload.firstName
  if (payload.lastName !== undefined) user.lastName = payload.lastName
  if (payload.phone !== undefined) user.phone = payload.phone
  if (payload.cnic !== undefined) user.cnic = payload.cnic
  if (payload.department !== undefined) user.department = payload.department
  if (payload.jobTitle !== undefined) user.jobTitle = payload.jobTitle
  if (payload.homeAddress !== undefined) user.homeAddress = payload.homeAddress
  if (payload.joinDate !== undefined) user.joinDate = payload.joinDate
  if (payload.avatar !== undefined) user.avatar = payload.avatar
  if (payload.role !== undefined) {
    user.role = payload.role
    if (payload.customRoleId === undefined) {
      user.customRoleId = null
    }
  }
  const previousStatus = user.status
  if (payload.status !== undefined) user.status = payload.status
  if (payload.basicSalary !== undefined) user.basicSalary = payload.basicSalary
  if (payload.hra !== undefined) user.hra = payload.hra
  if (payload.utilityAllowance !== undefined) user.utilityAllowance = payload.utilityAllowance
  if (payload.conveyanceAllowance !== undefined) {
    user.conveyanceAllowance = payload.conveyanceAllowance
  }
  if (payload.providentFund !== undefined) user.providentFund = payload.providentFund
  if (payload.bankName !== undefined) {
    user.bankName = payload.bankName === '' ? undefined : payload.bankName
  }
  if (payload.bankAccountNo !== undefined) {
    user.bankAccountNo = payload.bankAccountNo === '' ? undefined : payload.bankAccountNo
  }
  if (payload.employmentStage !== undefined) {
    user.employmentStage = payload.employmentStage
  }
  if (payload.probationEndDate !== undefined) {
    user.probationEndDate = payload.probationEndDate ?? undefined
  }
  if (payload.confirmationDate !== undefined) {
    user.confirmationDate = payload.confirmationDate ?? undefined
    if (payload.confirmationDate && !payload.employmentStage) {
      user.employmentStage = 'permanent'
    }
  }

  if (!user.employeeCode) {
    user.employeeCode = await nextEmployeeCode(acting.companyId)
  }

  try {
    await user.save()
  } catch (err) {
    const code = (err as { code?: number })?.code
    if (code === 11000) {
      throw new AppError('CNIC is already in use in this company', 409, 'CNIC_EXISTS')
    }
    throw err
  }

  if (
    payload.customRoleId !== undefined ||
    payload.role !== undefined ||
    payload.status === 'suspended'
  ) {
    await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() })
  }

  if (payload.status !== undefined && payload.status !== previousStatus) {
    await dispatchDomainEventSafe({
      type: 'user.status_changed',
      actor: {
        id: acting.id,
        fullName: await resolveActorFullName(acting.id),
        companyId: acting.companyId,
      },
      entityId: user._id.toString(),
      subjectUserId: user._id.toString(),
      context: {
        subjectName: user.fullName,
        statusLabel: user.status,
      },
    })
  }

  return enrichAuthUser(user, { includeReporteesCount: true })
}

export async function deleteUserByAdmin(
  userId: string,
  acting: ActingAdmin,
): Promise<void> {
  if (userId === acting.id) {
    throw new AppError('You cannot delete your own account', 400, 'CANNOT_DELETE_SELF')
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  assertCompanyScope(user.companyId?.toString() ?? null, acting)
  assertManageable(user.role, acting)

  await RefreshToken.deleteMany({ userId: user._id })
  await user.deleteOne()
}

export async function resendUserInvite(
  userId: string,
  acting: ActingAdmin,
): Promise<{ devInviteToken?: string }> {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  assertCompanyScope(user.companyId?.toString() ?? null, acting)
  assertManageable(user.role, acting)

  if (user.status !== 'pending') {
    throw new AppError('User invitation is not pending', 400, 'INVITE_NOT_PENDING')
  }

  const company = await Company.findById(acting.companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  const rawToken = await createInviteToken(user._id.toString(), 'invite')
  const inviteUrl = buildInviteUrl(rawToken)
  const customRoleName = await resolveCustomRoleName(user.customRoleId)
  await sendInviteEmail({
    to: user.email,
    inviteUrl,
    recipientName: user.fullName,
    companyName: company.name,
    brand: companyEmailBrand(company),
    purpose: 'staff',
    roleLabel: emailRoleLabel(user.role, customRoleName),
    jobTitle: user.jobTitle,
    department: user.department,
    employeeCode: user.employeeCode,
    invitedBy: await resolveActorFullName(acting.id),
    companyLocation: companyLocation(company),
    joinDate: user.joinDate,
  })

  return env.NODE_ENV === 'development' ? { devInviteToken: rawToken } : {}
}

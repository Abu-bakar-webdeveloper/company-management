import bcrypt from 'bcryptjs'
import mongoose, { type Document, Schema, type Types } from 'mongoose'
import type { AccountStatus, AuthUser, UserRole } from './auth.types.js'
import type { NotificationPreferences } from '../notifications/notification-preferences.js'

const SALT_ROUNDS = 12

export interface IUser extends Document {
  email: string
  password: string
  fullName: string
  firstName?: string
  lastName?: string
  phone?: string
  cnic?: string
  employeeCode?: string
  department?: string
  jobTitle?: string
  homeAddress?: string
  joinDate?: Date
  avatar?: string
  basicSalary?: number
  hra?: number
  utilityAllowance?: number
  conveyanceAllowance?: number
  providentFund?: number
  bankName?: string
  bankAccountNo?: string
  employmentStage?: 'probation' | 'permanent'
  probationEndDate?: Date
  confirmationDate?: Date
  lastIncrementAt?: Date
  role: UserRole
  status: AccountStatus
  companyId: Types.ObjectId | null
  customRoleId: Types.ObjectId | null
  managerId: Types.ObjectId | null
  notificationPreferences?: NotificationPreferences
  comparePassword(candidate: string): Promise<boolean>
  toAuthUser(): AuthUser
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    cnic: {
      type: String,
      trim: true,
    },
    employeeCode: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    homeAddress: {
      type: String,
      trim: true,
    },
    joinDate: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    basicSalary: {
      type: Number,
      min: 0,
    },
    hra: {
      type: Number,
      min: 0,
    },
    utilityAllowance: {
      type: Number,
      min: 0,
    },
    conveyanceAllowance: {
      type: Number,
      min: 0,
    },
    providentFund: {
      type: Number,
      min: 0,
    },
    bankName: {
      type: String,
      trim: true,
    },
    bankAccountNo: {
      type: String,
      trim: true,
    },
    employmentStage: {
      type: String,
      enum: ['probation', 'permanent'],
      default: 'probation',
    },
    probationEndDate: { type: Date },
    confirmationDate: { type: Date },
    lastIncrementAt: { type: Date },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'hr', 'employee'],
      default: 'employee',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending',
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    customRoleId: {
      type: Schema.Types.ObjectId,
      ref: 'CompanyRole',
      default: null,
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    notificationPreferences: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { timestamps: true },
)

userSchema.index(
  { companyId: 1, cnic: 1 },
  { unique: true, partialFilterExpression: { cnic: { $type: 'string' } } },
)

userSchema.index(
  { companyId: 1, employeeCode: 1 },
  { unique: true, partialFilterExpression: { employeeCode: { $type: 'string' } } },
)

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
})

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toAuthUser = function toAuthUser(): AuthUser {
  return {
    id: this._id.toString(),
    email: this.email,
    fullName: this.fullName,
    ...(this.firstName ? { firstName: this.firstName } : {}),
    ...(this.lastName ? { lastName: this.lastName } : {}),
    ...(this.phone ? { phone: this.phone } : {}),
    ...(this.cnic ? { cnic: this.cnic } : {}),
    ...(this.employeeCode ? { employeeCode: this.employeeCode } : {}),
    ...(this.department ? { department: this.department } : {}),
    ...(this.jobTitle ? { jobTitle: this.jobTitle } : {}),
    ...(this.homeAddress ? { homeAddress: this.homeAddress } : {}),
    ...(this.joinDate ? { joinDate: this.joinDate.toISOString() } : {}),
    ...(this.avatar ? { avatar: this.avatar } : {}),
    ...(this.basicSalary != null ? { basicSalary: this.basicSalary } : {}),
    ...(this.hra != null ? { hra: this.hra } : {}),
    ...(this.utilityAllowance != null ? { utilityAllowance: this.utilityAllowance } : {}),
    ...(this.conveyanceAllowance != null
      ? { conveyanceAllowance: this.conveyanceAllowance }
      : {}),
    ...(this.providentFund != null ? { providentFund: this.providentFund } : {}),
    ...(this.bankName ? { bankName: this.bankName } : {}),
    ...(this.bankAccountNo ? { bankAccountNo: this.bankAccountNo } : {}),
    ...(this.employmentStage ? { employmentStage: this.employmentStage } : {}),
    ...(this.probationEndDate
      ? { probationEndDate: this.probationEndDate.toISOString() }
      : {}),
    ...(this.confirmationDate
      ? { confirmationDate: this.confirmationDate.toISOString() }
      : {}),
    ...(this.lastIncrementAt
      ? { lastIncrementAt: this.lastIncrementAt.toISOString() }
      : {}),
    role: this.role,
    status: this.status,
    companyId: this.companyId ? this.companyId.toString() : null,
    customRoleId: this.customRoleId ? this.customRoleId.toString() : null,
    managerId: this.managerId ? this.managerId.toString() : null,
  }
}

export const User = mongoose.model<IUser>('User', userSchema)

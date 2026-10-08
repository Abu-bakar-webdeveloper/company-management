import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type PfBase = 'basic' | 'gross'
export type ExcessLeaveMode = 'reject' | 'deduct_from_salary' | 'admin_can_waive'

export type IncrementPolicy = {
  probationMonths: number
  permanentMonths: number
  eligibleFrom: 'join_date' | 'confirmation_or_last_increment'
}

export type PfSettings = {
  enabled: boolean
  employeePercent: number
  employerPercent: number
  base: PfBase
}

export type LeavePayrollPolicy = {
  excessLeaveMode: ExcessLeaveMode
  leaveDeductionDivisor: number
  encashmentEnabled: boolean
  encashmentDivisor: number
}

export interface ICompanyPayrollSettings extends Document {
  companyId: Types.ObjectId
  pf: PfSettings
  leavePolicy: LeavePayrollPolicy
  incrementPolicy: IncrementPolicy
  createdAt: Date
  updatedAt: Date
}

const pfSettingsSchema = new Schema<PfSettings>(
  {
    enabled: { type: Boolean, default: false },
    employeePercent: { type: Number, min: 0, max: 100, default: 0 },
    employerPercent: { type: Number, min: 0, max: 100, default: 0 },
    base: { type: String, enum: ['basic', 'gross'], default: 'basic' },
  },
  { _id: false },
)

const leavePolicySchema = new Schema<LeavePayrollPolicy>(
  {
    excessLeaveMode: {
      type: String,
      enum: ['reject', 'deduct_from_salary', 'admin_can_waive'],
      default: 'reject',
    },
    leaveDeductionDivisor: { type: Number, min: 1, default: 30 },
    encashmentEnabled: { type: Boolean, default: false },
    encashmentDivisor: { type: Number, min: 1, default: 30 },
  },
  { _id: false },
)

const incrementPolicySchema = new Schema<IncrementPolicy>(
  {
    probationMonths: { type: Number, min: 1, max: 36, default: 6 },
    permanentMonths: { type: Number, min: 1, max: 60, default: 12 },
    eligibleFrom: {
      type: String,
      enum: ['join_date', 'confirmation_or_last_increment'],
      default: 'confirmation_or_last_increment',
    },
  },
  { _id: false },
)

const companyPayrollSettingsSchema = new Schema<ICompanyPayrollSettings>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
      index: true,
    },
    pf: { type: pfSettingsSchema, default: () => ({}) },
    leavePolicy: { type: leavePolicySchema, default: () => ({}) },
    incrementPolicy: { type: incrementPolicySchema, default: () => ({}) },
  },
  { timestamps: true },
)

export const CompanyPayrollSettings = mongoose.model<ICompanyPayrollSettings>(
  'CompanyPayrollSettings',
  companyPayrollSettingsSchema,
)

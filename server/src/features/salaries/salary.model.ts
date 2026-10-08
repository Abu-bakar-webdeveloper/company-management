import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type SalaryStatus = 'paid' | 'pending' | 'on_hold'
export type SalaryActivityType = 'created' | 'reviewed' | 'approved' | 'updated' | 'status_changed'

export type SalaryEarnings = {
  basic: number
  hra: number
  utilityAllowance: number
  conveyanceAllowance: number
  reimburse: number
  overTime: number
  bonus: number
  loanIssued: number
  leaveEncashment: number
}

export type SalaryDeductions = {
  leave: number
  loan: number
  providentFund: number
  advance: number
  incomeTax: number
  other: number
}

export type SalaryActivity = {
  type: SalaryActivityType
  actorId?: Types.ObjectId
  actorName: string
  note?: string
  createdAt: Date
}

export type SalaryLineItem = {
  componentId?: Types.ObjectId
  code: string
  name: string
  kind: 'earning' | 'deduction'
  amount: number
}

export interface ISalary extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  employeeCode: string
  employeeName: string
  employeeEmail?: string
  employeePhone?: string
  employeeCnic?: string
  employeeAvatar?: string
  department: string
  designation: string
  bankName?: string
  bankAccountNo?: string
  dateOfJoining?: Date
  payPeriodMonth: number
  payPeriodYear: number
  status: SalaryStatus
  earnings: SalaryEarnings
  deductions: SalaryDeductions
  lineItems: SalaryLineItem[]
  employerProvidentFund: number
  totalEarnings: number
  totalDeductions: number
  net: number
  description: string
  activities: SalaryActivity[]
  approvedById?: Types.ObjectId
  approvedByName?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const earningsSchema = new Schema<SalaryEarnings>(
  {
    basic: { type: Number, required: true, min: 0, default: 0 },
    hra: { type: Number, required: true, min: 0, default: 0 },
    utilityAllowance: { type: Number, required: true, min: 0, default: 0 },
    conveyanceAllowance: { type: Number, required: true, min: 0, default: 0 },
    reimburse: { type: Number, required: true, min: 0, default: 0 },
    overTime: { type: Number, required: true, min: 0, default: 0 },
    bonus: { type: Number, required: true, min: 0, default: 0 },
    loanIssued: { type: Number, required: true, min: 0, default: 0 },
    leaveEncashment: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
)

const deductionsSchema = new Schema<SalaryDeductions>(
  {
    leave: { type: Number, required: true, min: 0, default: 0 },
    loan: { type: Number, required: true, min: 0, default: 0 },
    providentFund: { type: Number, required: true, min: 0, default: 0 },
    advance: { type: Number, required: true, min: 0, default: 0 },
    incomeTax: { type: Number, required: true, min: 0, default: 0 },
    other: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
)

const activitySchema = new Schema<SalaryActivity>(
  {
    type: {
      type: String,
      enum: ['created', 'reviewed', 'approved', 'updated', 'status_changed'],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const lineItemSchema = new Schema<SalaryLineItem>(
  {
    componentId: { type: Schema.Types.ObjectId, ref: 'PayrollComponent' },
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ['earning', 'deduction'], required: true },
    amount: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
)

const salarySchema = new Schema<ISalary>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeCode: { type: String, required: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    employeeEmail: { type: String, trim: true },
    employeePhone: { type: String, trim: true },
    employeeCnic: { type: String, trim: true },
    employeeAvatar: { type: String },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    bankName: { type: String, trim: true },
    bankAccountNo: { type: String, trim: true },
    dateOfJoining: { type: Date },
    payPeriodMonth: { type: Number, required: true, min: 1, max: 12 },
    payPeriodYear: { type: Number, required: true, min: 2000 },
    status: {
      type: String,
      enum: ['paid', 'pending', 'on_hold'],
      default: 'pending',
      index: true,
    },
    earnings: { type: earningsSchema, required: true },
    deductions: { type: deductionsSchema, required: true },
    lineItems: { type: [lineItemSchema], default: [] },
    employerProvidentFund: { type: Number, min: 0, default: 0 },
    totalEarnings: { type: Number, required: true, min: 0 },
    totalDeductions: { type: Number, required: true, min: 0 },
    net: { type: Number, required: true },
    description: { type: String, default: '', trim: true },
    activities: { type: [activitySchema], default: [] },
    approvedById: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedByName: { type: String, trim: true },
    approvedAt: { type: Date },
  },
  { timestamps: true },
)

salarySchema.index(
  { companyId: 1, employeeId: 1, payPeriodYear: 1, payPeriodMonth: 1 },
  { unique: true },
)
salarySchema.index({ companyId: 1, payPeriodYear: -1, payPeriodMonth: -1 })

export const Salary = mongoose.model<ISalary>('Salary', salarySchema)

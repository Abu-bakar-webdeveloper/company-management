import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type LoanStatus = 'active' | 'paid_off' | 'cancelled'
export type InstallmentStatus = 'pending' | 'applied' | 'skipped'

export type LoanInstallment = {
  month: number
  year: number
  amount: number
  status: InstallmentStatus
  salaryId?: Types.ObjectId
}

export interface IEmployeeLoan extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  principal: number
  issuedOn: Date
  installmentAmount: number
  startMonth: number
  startYear: number
  endMonth: number
  endYear: number
  remainingBalance: number
  status: LoanStatus
  issueInPayroll: boolean
  schedule: LoanInstallment[]
  note?: string
  createdAt: Date
  updatedAt: Date
}

const installmentSchema = new Schema<LoanInstallment>(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'applied', 'skipped'],
      default: 'pending',
    },
    salaryId: { type: Schema.Types.ObjectId, ref: 'Salary' },
  },
  { _id: false },
)

const employeeLoanSchema = new Schema<IEmployeeLoan>(
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
    principal: { type: Number, required: true, min: 0 },
    issuedOn: { type: Date, required: true },
    installmentAmount: { type: Number, required: true, min: 0 },
    startMonth: { type: Number, required: true, min: 1, max: 12 },
    startYear: { type: Number, required: true, min: 2000 },
    endMonth: { type: Number, required: true, min: 1, max: 12 },
    endYear: { type: Number, required: true, min: 2000 },
    remainingBalance: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'paid_off', 'cancelled'],
      default: 'active',
      index: true,
    },
    issueInPayroll: { type: Boolean, default: false },
    schedule: { type: [installmentSchema], default: [] },
    note: { type: String, trim: true },
  },
  { timestamps: true },
)

employeeLoanSchema.index({ companyId: 1, employeeId: 1, status: 1 })

export const EmployeeLoan = mongoose.model<IEmployeeLoan>('EmployeeLoan', employeeLoanSchema)

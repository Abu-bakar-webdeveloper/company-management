import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type AssignmentSource = 'manual' | 'loan'

export interface IPayrollAssignment extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  componentCode: string
  kind: 'earning' | 'deduction'
  amount: number
  startMonth: number
  startYear: number
  endMonth?: number | null
  endYear?: number | null
  note?: string
  active: boolean
  source: AssignmentSource
  createdAt: Date
  updatedAt: Date
}

const payrollAssignmentSchema = new Schema<IPayrollAssignment>(
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
    componentCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    kind: { type: String, enum: ['earning', 'deduction'], required: true },
    amount: { type: Number, required: true, min: 0 },
    startMonth: { type: Number, required: true, min: 1, max: 12 },
    startYear: { type: Number, required: true, min: 2000 },
    endMonth: { type: Number, min: 1, max: 12, default: null },
    endYear: { type: Number, min: 2000, default: null },
    note: { type: String, trim: true },
    active: { type: Boolean, default: true },
    source: {
      type: String,
      enum: ['manual', 'loan'],
      default: 'manual',
    },
  },
  { timestamps: true },
)

payrollAssignmentSchema.index({ companyId: 1, employeeId: 1, active: 1 })

export const PayrollAssignment = mongoose.model<IPayrollAssignment>(
  'PayrollAssignment',
  payrollAssignmentSchema,
)

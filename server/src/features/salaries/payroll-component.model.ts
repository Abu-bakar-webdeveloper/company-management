import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type PayrollComponentKind = 'earning' | 'deduction'
export type PayrollCalcType = 'fixed' | 'percent_of_basic'

export interface IPayrollComponent extends Document {
  companyId: Types.ObjectId
  code: string
  name: string
  kind: PayrollComponentKind
  calcType: PayrollCalcType
  defaultValue: number
  isSystem: boolean
  active: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const payrollComponentSchema = new Schema<IPayrollComponent>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    kind: {
      type: String,
      enum: ['earning', 'deduction'],
      required: true,
    },
    calcType: {
      type: String,
      enum: ['fixed', 'percent_of_basic'],
      default: 'fixed',
    },
    defaultValue: { type: Number, required: true, min: 0, default: 0 },
    isSystem: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

payrollComponentSchema.index({ companyId: 1, code: 1 }, { unique: true })
payrollComponentSchema.index({ companyId: 1, kind: 1, sortOrder: 1 })

export const PayrollComponent = mongoose.model<IPayrollComponent>(
  'PayrollComponent',
  payrollComponentSchema,
)

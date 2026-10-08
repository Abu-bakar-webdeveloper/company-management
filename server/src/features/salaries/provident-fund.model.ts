import mongoose, { type Document, Schema, type Types } from 'mongoose'

export interface IProvidentFundAccount extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  balance: number
  createdAt: Date
  updatedAt: Date
}

const pfAccountSchema = new Schema<IProvidentFundAccount>(
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
    balance: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
)

pfAccountSchema.index({ companyId: 1, employeeId: 1 }, { unique: true })

export const ProvidentFundAccount = mongoose.model<IProvidentFundAccount>(
  'ProvidentFundAccount',
  pfAccountSchema,
)

export type PfLedgerType = 'contribution' | 'adjustment' | 'withdrawal' | 'reversal'

export interface IProvidentFundLedger extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  salaryId?: Types.ObjectId
  year: number
  month: number
  employeeAmount: number
  employerAmount: number
  type: PfLedgerType
  note?: string
  createdAt: Date
  updatedAt: Date
}

const pfLedgerSchema = new Schema<IProvidentFundLedger>(
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
    salaryId: { type: Schema.Types.ObjectId, ref: 'Salary' },
    year: { type: Number, required: true, min: 2000 },
    month: { type: Number, required: true, min: 1, max: 12 },
    employeeAmount: { type: Number, required: true, min: 0, default: 0 },
    employerAmount: { type: Number, required: true, min: 0, default: 0 },
    type: {
      type: String,
      enum: ['contribution', 'adjustment', 'withdrawal', 'reversal'],
      required: true,
    },
    note: { type: String, trim: true },
  },
  { timestamps: true },
)

pfLedgerSchema.index(
  { companyId: 1, employeeId: 1, year: 1, month: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { type: 'contribution' },
  },
)

export const ProvidentFundLedger = mongoose.model<IProvidentFundLedger>(
  'ProvidentFundLedger',
  pfLedgerSchema,
)

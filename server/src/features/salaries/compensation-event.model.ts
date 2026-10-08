import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type CompensationEventType =
  | 'increment'
  | 'confirmation'
  | 'correction'
  | 'structure_change'
  | 'initial'

export type CompensationAllowances = {
  HRA?: number
  UTILITY?: number
  CONVEYANCE?: number
  [code: string]: number | undefined
}

export interface ICompensationEvent extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  effectiveFrom: Date
  type: CompensationEventType
  basic: number
  allowances: CompensationAllowances
  reason?: string
  actorId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const compensationEventSchema = new Schema<ICompensationEvent>(
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
    effectiveFrom: { type: Date, required: true, index: true },
    type: {
      type: String,
      enum: ['increment', 'confirmation', 'correction', 'structure_change', 'initial'],
      required: true,
    },
    basic: { type: Number, required: true, min: 0 },
    allowances: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    reason: { type: String, trim: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

compensationEventSchema.index({ companyId: 1, employeeId: 1, effectiveFrom: -1 })

export const CompensationEvent = mongoose.model<ICompensationEvent>(
  'CompensationEvent',
  compensationEventSchema,
)

import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type PerformanceAuditType = 'bonus' | 'penalty' | 'score_change'

export interface IPerformanceAuditLog extends Document {
  companyId: Types.ObjectId
  reviewId: Types.ObjectId
  employeeId: Types.ObjectId
  actorId: Types.ObjectId
  type: PerformanceAuditType
  amount: number
  note: string
  createdAt: Date
  updatedAt: Date
}

const performanceAuditLogSchema = new Schema<IPerformanceAuditLog>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'PerformanceReview',
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['bonus', 'penalty', 'score_change'],
      required: true,
    },
    amount: { type: Number, required: true },
    note: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)

performanceAuditLogSchema.index({ companyId: 1, createdAt: -1 })

export const PerformanceAuditLog = mongoose.model<IPerformanceAuditLog>(
  'PerformanceAuditLog',
  performanceAuditLogSchema,
)

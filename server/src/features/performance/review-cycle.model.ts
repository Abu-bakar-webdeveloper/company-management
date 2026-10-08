import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type ReviewCycleType = 'quarterly' | 'annual' | 'custom'
export type ReviewCycleStatus = 'draft' | 'active' | 'closed'

export interface IReviewCycle extends Document {
  companyId: Types.ObjectId
  name: string
  type: ReviewCycleType
  periodStart: Date
  periodEnd: Date
  status: ReviewCycleStatus
  createdAt: Date
  updatedAt: Date
}

const reviewCycleSchema = new Schema<IReviewCycle>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['quarterly', 'annual', 'custom'],
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true },
)

reviewCycleSchema.index({ companyId: 1, periodStart: -1 })

export const ReviewCycle = mongoose.model<IReviewCycle>('ReviewCycle', reviewCycleSchema)

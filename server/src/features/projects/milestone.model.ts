import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type MilestoneStatus = 'pending' | 'completed'

export interface IMilestone extends Document {
  companyId: Types.ObjectId
  projectId: Types.ObjectId
  title: string
  dueDate?: Date
  status: MilestoneStatus
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const milestoneSchema = new Schema<IMilestone>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

milestoneSchema.index({ projectId: 1, sortOrder: 1 })

export const Milestone = mongoose.model<IMilestone>('Milestone', milestoneSchema)

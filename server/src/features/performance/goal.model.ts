import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type GoalStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export type KeyResult = {
  id: string
  title: string
  target: number
  current: number
  unit: string
}

export interface IGoal extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  cycleId?: Types.ObjectId
  periodStart?: Date
  periodEnd?: Date
  title: string
  description: string
  status: GoalStatus
  progressPct: number
  keyResults: KeyResult[]
  managerConfirmed: boolean
  createdAt: Date
  updatedAt: Date
}

const keyResultSchema = new Schema<KeyResult>(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    target: { type: Number, required: true, min: 0 },
    current: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: '%', trim: true },
  },
  { _id: false },
)

const goalSchema = new Schema<IGoal>(
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
    cycleId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewCycle',
      index: true,
    },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    progressPct: { type: Number, default: 0, min: 0, max: 100 },
    keyResults: { type: [keyResultSchema], default: [] },
    managerConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

goalSchema.index({ companyId: 1, employeeId: 1, createdAt: -1 })

export const Goal = mongoose.model<IGoal>('Goal', goalSchema)

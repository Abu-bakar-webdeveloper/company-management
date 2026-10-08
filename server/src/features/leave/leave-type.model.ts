import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type LeaveTypeIcon = 'sick' | 'casual' | 'annual' | 'unpaid'
export type LeaveTypeStatus = 'active' | 'inactive'

export interface ILeaveType extends Document {
  companyId: Types.ObjectId
  name: string
  maxDays: number | null
  description: string
  icon: LeaveTypeIcon
  carryForward: boolean
  paidLeave: boolean
  status: LeaveTypeStatus
  createdAt: Date
  updatedAt: Date
}

const leaveTypeSchema = new Schema<ILeaveType>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    maxDays: {
      type: Number,
      default: null,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      enum: ['sick', 'casual', 'annual', 'unpaid'],
      default: 'casual',
    },
    carryForward: {
      type: Boolean,
      default: false,
    },
    paidLeave: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true },
)

leaveTypeSchema.index({ companyId: 1, name: 1 }, { unique: true })

export const LeaveType = mongoose.model<ILeaveType>('LeaveType', leaveTypeSchema)

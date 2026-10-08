import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected'
export type ExcessDisposition = 'none' | 'unpaid_deduct' | 'waived' | 'rejected_excess'

export interface ILeaveRequest extends Document {
  companyId: Types.ObjectId
  requestCode: string
  employeeId: Types.ObjectId
  leaveTypeId: Types.ObjectId
  reason: string
  startDate: Date
  endDate: Date
  durationDays: number
  balanceDaysUsed: number
  excessDays: number
  excessDisposition: ExcessDisposition
  status: LeaveRequestStatus
  appliedAt: Date
  adminComment?: string
  reviewedById?: Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    requestCode: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    leaveTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    balanceDaysUsed: {
      type: Number,
      min: 0,
      default: 0,
    },
    excessDays: {
      type: Number,
      min: 0,
      default: 0,
    },
    excessDisposition: {
      type: String,
      enum: ['none', 'unpaid_deduct', 'waived', 'rejected_excess'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    adminComment: {
      type: String,
      trim: true,
    },
    reviewedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

leaveRequestSchema.index({ companyId: 1, requestCode: 1 }, { unique: true })
leaveRequestSchema.index({ companyId: 1, status: 1, appliedAt: -1 })
leaveRequestSchema.index({ companyId: 1, employeeId: 1, appliedAt: -1 })

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema)

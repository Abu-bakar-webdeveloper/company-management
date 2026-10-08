import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type LeaveEncashmentStatus = 'pending' | 'applied' | 'cancelled'

export interface ILeaveEncashment extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  year: number
  unusedDays: number
  amount: number
  targetMonth: number
  targetYear: number
  status: LeaveEncashmentStatus
  leaveTypeId?: Types.ObjectId
  /** Salary record that applied this encashment (cleared if salary is deleted). */
  salaryId?: Types.ObjectId
  note?: string
  createdAt: Date
  updatedAt: Date
}

const leaveEncashmentSchema = new Schema<ILeaveEncashment>(
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
    year: { type: Number, required: true, min: 2000 },
    unusedDays: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    targetMonth: { type: Number, required: true, min: 1, max: 12 },
    targetYear: { type: Number, required: true, min: 2000 },
    status: {
      type: String,
      enum: ['pending', 'applied', 'cancelled'],
      default: 'pending',
      index: true,
    },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType' },
    salaryId: { type: Schema.Types.ObjectId, ref: 'Salary', index: true },
    note: { type: String, trim: true },
  },
  { timestamps: true },
)

leaveEncashmentSchema.index(
  { companyId: 1, employeeId: 1, year: 1, leaveTypeId: 1 },
  { unique: true },
)

export const LeaveEncashment = mongoose.model<ILeaveEncashment>(
  'LeaveEncashment',
  leaveEncashmentSchema,
)

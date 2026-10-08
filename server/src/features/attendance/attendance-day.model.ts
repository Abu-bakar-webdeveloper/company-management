import mongoose, { type Document, Schema, type Types } from 'mongoose'
import type { PunchLocationStatus } from './attendance-punch.model.js'

export type AttendanceDayStatus =
  | 'present'
  | 'late'
  | 'absent'
  | 'on_leave'
  | 'half_day'
  | 'weekend'
  | 'holiday'
  | 'not_arrived'

export type AttendanceDaySource = 'punch' | 'leave' | 'manual' | 'system'

/** Denormalized clock-in location for roster / history without joining punches */
export type AttendanceClockInLocation = {
  label?: string
  status: PunchLocationStatus
  lat?: number
  lng?: number
}

export interface IAttendanceDay extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  /** YYYY-MM-DD in company timezone */
  date: string
  status: AttendanceDayStatus
  clockInAt?: Date
  clockOutAt?: Date
  totalWorkMinutes: number
  breakMinutes: number
  isLate: boolean
  lateMinutes: number
  source: AttendanceDaySource
  notes?: string
  editedBy?: Types.ObjectId
  editedAt?: Date
  clockInLocation?: AttendanceClockInLocation
  /** Short-lived mutex for concurrent punch serialization */
  punchLockUntil?: Date
  createdAt: Date
  updatedAt: Date
}

const clockInLocationSchema = new Schema<AttendanceClockInLocation>(
  {
    label: { type: String, trim: true },
    status: {
      type: String,
      enum: ['on_site', 'remote', 'unknown'],
      required: true,
    },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false },
)

const attendanceDaySchema = new Schema<IAttendanceDay>(
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
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: [
        'present',
        'late',
        'absent',
        'on_leave',
        'half_day',
        'weekend',
        'holiday',
        'not_arrived',
      ],
      required: true,
    },
    clockInAt: { type: Date },
    clockOutAt: { type: Date },
    totalWorkMinutes: { type: Number, min: 0, default: 0 },
    breakMinutes: { type: Number, min: 0, default: 0 },
    isLate: { type: Boolean, default: false },
    lateMinutes: { type: Number, min: 0, default: 0 },
    source: {
      type: String,
      enum: ['punch', 'leave', 'manual', 'system'],
      default: 'system',
    },
    notes: { type: String, trim: true },
    editedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date },
    clockInLocation: { type: clockInLocationSchema },
    punchLockUntil: { type: Date },
  },
  { timestamps: true },
)

attendanceDaySchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true })
attendanceDaySchema.index({ companyId: 1, date: 1, status: 1 })

export const AttendanceDay = mongoose.model<IAttendanceDay>(
  'AttendanceDay',
  attendanceDaySchema,
)

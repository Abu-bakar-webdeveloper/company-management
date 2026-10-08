import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type AttendancePunchType = 'clock_in' | 'break_start' | 'break_end' | 'clock_out'

export type PunchLocationStatus = 'on_site' | 'remote' | 'unknown'

export type AttendancePunchLocation = {
  lat?: number
  lng?: number
  accuracyMeters?: number
  label?: string
  ip?: string
  userAgent?: string
  status: PunchLocationStatus
  distanceMeters?: number
  nearestSiteName?: string
}

export interface IAttendancePunch extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  type: AttendancePunchType
  at: Date
  /** YYYY-MM-DD in company timezone */
  date: string
  location?: AttendancePunchLocation
  createdAt: Date
  updatedAt: Date
}

const punchLocationSchema = new Schema<AttendancePunchLocation>(
  {
    lat: { type: Number },
    lng: { type: Number },
    accuracyMeters: { type: Number },
    label: { type: String, trim: true },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    status: {
      type: String,
      enum: ['on_site', 'remote', 'unknown'],
      required: true,
      default: 'unknown',
    },
    distanceMeters: { type: Number },
    nearestSiteName: { type: String, trim: true },
  },
  { _id: false },
)

const attendancePunchSchema = new Schema<IAttendancePunch>(
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
    type: {
      type: String,
      enum: ['clock_in', 'break_start', 'break_end', 'clock_out'],
      required: true,
    },
    at: { type: Date, required: true, index: true },
    date: { type: String, required: true, index: true },
    location: { type: punchLocationSchema },
  },
  { timestamps: true },
)

attendancePunchSchema.index({ companyId: 1, employeeId: 1, date: 1, at: 1 })

export const AttendancePunch = mongoose.model<IAttendancePunch>(
  'AttendancePunch',
  attendancePunchSchema,
)

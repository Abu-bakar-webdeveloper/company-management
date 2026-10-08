import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type AttendanceShiftSettings = {
  start: string
  end: string
  breakMinutes: number
  graceMinutes: number
}

export type AttendanceOfficeSite = {
  name: string
  lat: number
  lng: number
  /** Allowed radius in meters; punches inside are on_site */
  radiusMeters: number
}

export interface ICompanyAttendanceSettings extends Document {
  companyId: Types.ObjectId
  timezone: string
  /** JS weekday: 0=Sun … 6=Sat. Default Mon–Fri. */
  workDays: number[]
  defaultShift: AttendanceShiftSettings
  halfDayHours: number
  fullDayHours: number
  officeSites: AttendanceOfficeSite[]
  createdAt: Date
  updatedAt: Date
}

const shiftSchema = new Schema<AttendanceShiftSettings>(
  {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    breakMinutes: { type: Number, min: 0, default: 60 },
    graceMinutes: { type: Number, min: 0, default: 15 },
  },
  { _id: false },
)

const officeSiteSchema = new Schema<AttendanceOfficeSite>(
  {
    name: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radiusMeters: { type: Number, min: 50, max: 5000, default: 200 },
  },
  { _id: false },
)

const companyAttendanceSettingsSchema = new Schema<ICompanyAttendanceSettings>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
      index: true,
    },
    timezone: { type: String, default: 'Asia/Karachi', trim: true },
    workDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
    },
    defaultShift: {
      type: shiftSchema,
      default: () => ({
        start: '09:00',
        end: '18:00',
        breakMinutes: 60,
        graceMinutes: 15,
      }),
    },
    halfDayHours: { type: Number, min: 0, default: 4 },
    fullDayHours: { type: Number, min: 0, default: 8 },
    officeSites: {
      type: [officeSiteSchema],
      default: [],
    },
  },
  { timestamps: true },
)

export const CompanyAttendanceSettings = mongoose.model<ICompanyAttendanceSettings>(
  'CompanyAttendanceSettings',
  companyAttendanceSettingsSchema,
)

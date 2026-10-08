import mongoose, { type Document, Schema, type Types } from 'mongoose'
import type { Permission } from '../auth/permissions.js'

export type StaffBaseRole = 'manager' | 'hr' | 'employee'

export interface ICompanyRole extends Document {
  companyId: Types.ObjectId
  name: string
  description: string
  baseRole: StaffBaseRole
  permissions: Permission[]
  isLocked: boolean
  createdAt: Date
  updatedAt: Date
}

const companyRoleSchema = new Schema<ICompanyRole>(
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
    description: {
      type: String,
      trim: true,
      default: '',
    },
    baseRole: {
      type: String,
      enum: ['manager', 'hr', 'employee'],
      required: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

companyRoleSchema.index({ companyId: 1, name: 1 }, { unique: true })

export const CompanyRole = mongoose.model<ICompanyRole>('CompanyRole', companyRoleSchema)

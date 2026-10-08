import mongoose, { type Document, Schema, type Types } from 'mongoose'
import type { Permission } from '../auth/permissions.js'

export type ActivityModule =
  | 'leave'
  | 'expense'
  | 'salary'
  | 'settings'
  | 'project'
  | 'task'
  | 'user'
  | 'performance'
  | 'client'
  | 'company'
  | 'attendance'

export type ActivityVisibility = 'private' | 'team' | 'company' | 'platform'
export type ActivityIconHint = 'user' | 'check' | 'warning'
export type ActivityEntityType =
  | 'leave'
  | 'expense'
  | 'salary'
  | 'project'
  | 'task'
  | 'user'
  | 'performance'
  | 'client'
  | 'company'
  | 'attendance'

export interface IActivity extends Document {
  companyId: Types.ObjectId | null
  actorId: Types.ObjectId
  actorName: string
  module: ActivityModule
  action: string
  title: string
  description: string
  entityType: ActivityEntityType
  entityId: Types.ObjectId
  visibility: ActivityVisibility
  relatedUserIds: Types.ObjectId[]
  requiredPermission?: Permission
  iconHint: ActivityIconHint
  createdAt: Date
  updatedAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      enum: [
        'leave',
        'expense',
        'salary',
        'settings',
        'project',
        'task',
        'user',
        'performance',
        'client',
        'company',
        'attendance',
      ],
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    entityType: {
      type: String,
      enum: [
        'leave',
        'expense',
        'salary',
        'project',
        'task',
        'user',
        'performance',
        'client',
        'company',
        'attendance',
      ],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'team', 'company', 'platform'],
      required: true,
      index: true,
    },
    relatedUserIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
      index: true,
    },
    requiredPermission: {
      type: String,
    },
    iconHint: {
      type: String,
      enum: ['user', 'check', 'warning'],
      default: 'user',
    },
  },
  { timestamps: true },
)

activitySchema.index({ companyId: 1, createdAt: -1 })
activitySchema.index({ relatedUserIds: 1, createdAt: -1 })

export const Activity = mongoose.model<IActivity>('Activity', activitySchema)

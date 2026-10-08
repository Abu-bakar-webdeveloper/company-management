import mongoose, { type Document, Schema, type Types } from 'mongoose'

export const NOTIFICATION_TYPES = [
  'leave.submitted',
  'leave.approved',
  'leave.rejected',
  'expense.submitted',
  'expense.approved',
  'expense.rejected',
  'salary.paid',
  'salary.status_changed',
  'project.created',
  'project.updated',
  'project.deleted',
  'task.assigned',
  'task.completed',
  'user.created',
  'user.status_changed',
  'user.invite_accepted',
  'performance.review_created',
  'performance.review_updated',
  'client.created',
  'company.created',
  'attendance.clocked_in',
  'attendance.clocked_out',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export type NotificationEntityType =
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

export interface INotification extends Document {
  companyId: Types.ObjectId | null
  recipientId: Types.ObjectId
  actorId: Types.ObjectId
  actorName: string
  type: NotificationType
  title: string
  body: string
  entityType: NotificationEntityType
  entityId: Types.ObjectId
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
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
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

notificationSchema.index({ recipientId: 1, createdAt: -1 })
notificationSchema.index({ recipientId: 1, readAt: 1 })

export const Notification = mongoose.model<INotification>('Notification', notificationSchema)

import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'hold'

export type TaskSubtask = {
  _id: Types.ObjectId
  text: string
  done: boolean
  sortOrder: number
}

export type TaskAttachment = {
  _id: Types.ObjectId
  url: string
  publicId?: string | null
  fileName: string
  mimeType: string
  sizeBytes: number
  sortOrder: number
  createdById: Types.ObjectId
  createdAt: Date
}

export interface ITask extends Document {
  companyId: Types.ObjectId
  projectId: Types.ObjectId
  columnId: Types.ObjectId
  sortOrder: number
  title: string
  description: string
  assigneeId?: Types.ObjectId | null
  createdById: Types.ObjectId
  milestoneId?: Types.ObjectId | null
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date | null
  /** Set when status first becomes `done`; cleared if reopened. */
  completedAt?: Date | null
  subtasks: TaskSubtask[]
  attachmentItems: TaskAttachment[]
  commentCount: number
  attachmentCount: number
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

const subtaskSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
)

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: null, trim: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, required: true, min: 0 },
    sortOrder: { type: Number, default: 0 },
    createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const taskSchema = new Schema<ITask>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'BoardColumn',
      required: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done', 'hold'],
      default: 'todo',
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    attachmentItems: {
      type: [attachmentSchema],
      default: [],
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    attachmentCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
)

taskSchema.index({ projectId: 1, columnId: 1, sortOrder: 1 })
taskSchema.index({ companyId: 1, assigneeId: 1, status: 1 })
taskSchema.index({ companyId: 1, status: 1, completedAt: 1 })
taskSchema.index({ companyId: 1, assigneeId: 1, status: 1, completedAt: 1 })
taskSchema.index({ companyId: 1, status: 1, updatedAt: 1 })

export const Task = mongoose.model<ITask>('Task', taskSchema)

export const MAX_TASK_ATTACHMENTS = 10
export const MAX_TASK_ATTACHMENT_BYTES = 5 * 1024 * 1024

/** Prefer completedAt; fall back to updatedAt for legacy done tasks. */
export function taskCompletionTime(task: {
  completedAt?: Date | null
  updatedAt: Date
}): Date {
  return task.completedAt ?? task.updatedAt
}

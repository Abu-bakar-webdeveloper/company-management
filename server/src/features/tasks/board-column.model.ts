import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type ColumnKind = 'todo' | 'in_progress' | 'done' | 'custom'

export interface IBoardColumn extends Document {
  companyId: Types.ObjectId
  projectId: Types.ObjectId
  name: string
  sortOrder: number
  wipLimit?: number | null
  columnKind: ColumnKind
  createdAt: Date
  updatedAt: Date
}

const boardColumnSchema = new Schema<IBoardColumn>(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    wipLimit: {
      type: Number,
      default: null,
    },
    columnKind: {
      type: String,
      enum: ['todo', 'in_progress', 'done', 'custom'],
      default: 'custom',
      index: true,
    },
  },
  { timestamps: true },
)

boardColumnSchema.index({ projectId: 1, sortOrder: 1 })

export const BoardColumn = mongoose.model<IBoardColumn>('BoardColumn', boardColumnSchema)

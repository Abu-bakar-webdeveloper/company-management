import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type ProjectFileKind = 'file' | 'link'

export interface IProjectFile extends Document {
  companyId: Types.ObjectId
  projectId: Types.ObjectId
  kind: ProjectFileKind
  title: string
  url: string
  publicId?: string | null
  fileName?: string
  mimeType?: string
  sizeBytes?: number
  createdById: Types.ObjectId
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const projectFileSchema = new Schema<IProjectFile>(
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
    kind: {
      type: String,
      enum: ['file', 'link'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: null,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      min: 0,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

projectFileSchema.index({ projectId: 1, sortOrder: 1 })

export const ProjectFile = mongoose.model<IProjectFile>('ProjectFile', projectFileSchema)

export const MAX_PROJECT_FILES = 50
export const MAX_PROJECT_FILE_BYTES = 15 * 1024 * 1024

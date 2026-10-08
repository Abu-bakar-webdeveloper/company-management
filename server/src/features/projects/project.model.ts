import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type ProjectStatus = 'in_progress' | 'completed' | 'delayed'
export type ProjectPriority = 'low' | 'medium' | 'high'
export type ProjectSource =
  | 'referral'
  | 'website'
  | 'rfp'
  | 'existing_client'
  | 'partner'
  | 'other'

export interface IProject extends Document {
  companyId: Types.ObjectId
  projectCode: string
  name: string
  description: string
  managerId: Types.ObjectId
  teamMemberIds: Types.ObjectId[]
  clientId?: Types.ObjectId
  source?: ProjectSource
  sourceNote?: string
  contractValue?: number
  startDate: Date
  endDate: Date
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    projectCode: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teamMemberIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    source: {
      type: String,
      enum: ['referral', 'website', 'rfp', 'existing_client', 'partner', 'other'],
    },
    sourceNote: {
      type: String,
      trim: true,
    },
    contractValue: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'delayed'],
      default: 'in_progress',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
)

projectSchema.index({ companyId: 1, projectCode: 1 }, { unique: true })
projectSchema.index({ companyId: 1, createdAt: -1 })
projectSchema.index({ companyId: 1, teamMemberIds: 1 })
projectSchema.index({ companyId: 1, clientId: 1 })
projectSchema.index({ companyId: 1, status: 1, updatedAt: 1 })

export const Project = mongoose.model<IProject>('Project', projectSchema)

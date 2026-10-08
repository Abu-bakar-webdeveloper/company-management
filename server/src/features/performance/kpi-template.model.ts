import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type KpiTemplateRole = 'employee' | 'manager'

export type KpiSubKpi = {
  id: string
  label: string
  maxMarks: number
}

export type KpiTemplateCategory = {
  name: string
  weightPct: number
  maxMarks: number
  subKpis: KpiSubKpi[]
}

export type KpiTemplateSnapshot = {
  name: string
  role: KpiTemplateRole
  version: number
  categories: KpiTemplateCategory[]
}

export interface IKpiTemplate extends Document {
  companyId: Types.ObjectId
  role: KpiTemplateRole
  name: string
  isActive: boolean
  version: number
  categories: KpiTemplateCategory[]
  createdAt: Date
  updatedAt: Date
}

const subKpiSchema = new Schema<KpiSubKpi>(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    maxMarks: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const categorySchema = new Schema<KpiTemplateCategory>(
  {
    name: { type: String, required: true, trim: true },
    weightPct: { type: Number, required: true, min: 0, max: 100 },
    maxMarks: { type: Number, required: true, min: 0 },
    subKpis: { type: [subKpiSchema], default: [] },
  },
  { _id: false },
)

const kpiTemplateSchema = new Schema<IKpiTemplate>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['employee', 'manager'],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    version: { type: Number, default: 1, min: 1 },
    categories: { type: [categorySchema], default: [] },
  },
  { timestamps: true },
)

kpiTemplateSchema.index({ companyId: 1, role: 1, isActive: 1 })
kpiTemplateSchema.index({ companyId: 1, role: 1, version: -1 })

export const KpiTemplate = mongoose.model<IKpiTemplate>('KpiTemplate', kpiTemplateSchema)

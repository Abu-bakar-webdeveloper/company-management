import mongoose, { type Document, Schema, type Types } from 'mongoose'
import type { KpiTemplateSnapshot } from './kpi-template.model.js'

export type PerformanceLevel = 'excellent' | 'good' | 'needs_improvement' | 'poor'

export type PerformanceReviewStatus = 'draft' | 'submitted'

export type PerformanceMetricsSnapshot = {
  tasksCompleted: number
  tasksPending: number
  deadlinesMet: number
  attendance: number
  efficiency: number
}

export type ReviewKpiScore = {
  subKpiId: string
  marksObtained: number
  remarks: string
}

export type ReviewCategoryScore = {
  name: string
  maxMarks: number
  obtained: number
}

export type ReviewRoiSnapshot = {
  outputValue: number
  effortInput: number
  roiIndex: number
  financialRoi: number | null
  cost?: number | null
  businessValue?: number | null
}

export interface IPerformanceReview extends Document {
  companyId: Types.ObjectId
  employeeId: Types.ObjectId
  reviewerId: Types.ObjectId
  periodStart: Date
  periodEnd: Date
  periodLabel: string
  cycleId?: Types.ObjectId
  rating: number
  feedback: string
  status: PerformanceReviewStatus
  metricsSnapshot: PerformanceMetricsSnapshot
  kpiTemplateId?: Types.ObjectId
  kpiTemplateSnapshot?: KpiTemplateSnapshot
  kpiScores: ReviewKpiScore[]
  categoryScores: ReviewCategoryScore[]
  totalScore?: number
  bonus: number
  penalty: number
  bonusPenaltyNote: string
  finalAdjustedScore?: number
  performanceLevel?: PerformanceLevel
  roi?: ReviewRoiSnapshot
  templateOutdated?: boolean
  createdAt: Date
  updatedAt: Date
}

const metricsSnapshotSchema = new Schema(
  {
    tasksCompleted: { type: Number, default: 0, min: 0 },
    tasksPending: { type: Number, default: 0, min: 0 },
    deadlinesMet: { type: Number, default: 0, min: 0, max: 100 },
    attendance: { type: Number, default: 0, min: 0, max: 100 },
    efficiency: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false },
)

const kpiScoreSchema = new Schema(
  {
    subKpiId: { type: String, required: true, trim: true },
    marksObtained: { type: Number, required: true, min: 0 },
    remarks: { type: String, default: '', trim: true },
  },
  { _id: false },
)

const categoryScoreSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    maxMarks: { type: Number, required: true, min: 0 },
    obtained: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const kpiTemplateSnapshotSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager'], required: true },
    version: { type: Number, required: true },
    categories: { type: Array, default: [] },
  },
  { _id: false },
)

const roiSchema = new Schema(
  {
    outputValue: { type: Number, default: 0, min: 0 },
    effortInput: { type: Number, default: 0, min: 0 },
    roiIndex: { type: Number, default: 0 },
    financialRoi: { type: Number, default: null },
    cost: { type: Number, default: null },
    businessValue: { type: Number, default: null },
  },
  { _id: false },
)

const performanceReviewSchema = new Schema<IPerformanceReview>(
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
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    periodLabel: {
      type: String,
      required: true,
      trim: true,
    },
    cycleId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewCycle',
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft',
      index: true,
    },
    metricsSnapshot: {
      type: metricsSnapshotSchema,
      default: () => ({}),
    },
    kpiTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'KpiTemplate',
      index: true,
    },
    kpiTemplateSnapshot: {
      type: kpiTemplateSnapshotSchema,
    },
    kpiScores: {
      type: [kpiScoreSchema],
      default: [],
    },
    categoryScores: {
      type: [categoryScoreSchema],
      default: [],
    },
    totalScore: { type: Number, min: 0 },
    bonus: { type: Number, default: 0 },
    penalty: { type: Number, default: 0, min: 0 },
    bonusPenaltyNote: { type: String, default: '', trim: true },
    finalAdjustedScore: { type: Number },
    performanceLevel: {
      type: String,
      enum: ['excellent', 'good', 'needs_improvement', 'poor'],
    },
    roi: {
      type: roiSchema,
    },
    templateOutdated: { type: Boolean, default: false },
  },
  { timestamps: true },
)

performanceReviewSchema.index({ companyId: 1, employeeId: 1, periodStart: 1 }, { unique: true })
performanceReviewSchema.index({ companyId: 1, reviewerId: 1 })
performanceReviewSchema.index({ companyId: 1, status: 1, periodStart: -1 })
performanceReviewSchema.index({ companyId: 1, finalAdjustedScore: -1 })

export const PerformanceReview = mongoose.model<IPerformanceReview>(
  'PerformanceReview',
  performanceReviewSchema,
)

import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type ReportModule = 'employees' | 'projects' | 'leaves' | 'performance' | 'expenses'
export type GeneratableReportModule =
  | 'employees'
  | 'projects'
  | 'leaves'
  | 'performance'
  | 'expenses'
export type ReportStatus = 'ready' | 'processing' | 'failed'
export type ExportFormat = 'pdf' | 'excel' | 'csv'
export type ReportMetricFormat = 'currency' | 'number' | 'percent' | 'days' | 'rating' | 'none'
export type RecordStatus =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'inactive'

export type ReportFiltersSnapshot = {
  cycle: 'monthly' | 'weekly'
  startDate: string
  endDate: string
  department: string
  employee: string
  status: string
  project: string
  rating: string
  includeCharts: boolean
  includeSummary: boolean
  groupBy: string
}

export type ReportRecordSnapshot = {
  id: string
  date: string
  category: string
  employeeName: string
  employeeAvatar?: string
  metric: number | null
  metricFormat: ReportMetricFormat
  status: RecordStatus
  detail: string
}

export type ReportDetailStatsSnapshot = {
  totalRecords: number
  secondaryLabel: string
  secondaryValue: number | null
  secondaryFormat: ReportMetricFormat
  avgLabel: string
  avgValue: number | null
  avgFormat: ReportMetricFormat
  status: string
}

export type TrendBarSnapshot = {
  month: string
  value: number
}

export type CategoryBreakdownSnapshot = {
  name: string
  percent: number
  color: string
}

export interface IReport extends Document {
  companyId: Types.ObjectId
  createdBy: Types.ObjectId
  name: string
  module: ReportModule
  status: ReportStatus
  exportFormat: ExportFormat
  periodLabel: string
  filters: ReportFiltersSnapshot
  stats: ReportDetailStatsSnapshot
  trend: TrendBarSnapshot[]
  categories: CategoryBreakdownSnapshot[]
  records: ReportRecordSnapshot[]
  error?: string
  readyAt?: Date
  createdAt: Date
  updatedAt: Date
}

const filtersSchema = new Schema<ReportFiltersSnapshot>(
  {
    cycle: { type: String, enum: ['monthly', 'weekly'], required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    department: { type: String, default: 'All Departments' },
    employee: { type: String, default: 'All Employee' },
    status: { type: String, default: 'All Status' },
    project: { type: String, default: 'All Projects' },
    rating: { type: String, default: 'All Ratings' },
    includeCharts: { type: Boolean, default: true },
    includeSummary: { type: Boolean, default: true },
    groupBy: { type: String, default: 'Department' },
  },
  { _id: false },
)

const recordSchema = new Schema<ReportRecordSnapshot>(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    employeeName: { type: String, required: true },
    employeeAvatar: { type: String },
    metric: { type: Number, default: null },
    metricFormat: {
      type: String,
      enum: ['currency', 'number', 'percent', 'days', 'rating', 'none'],
      required: true,
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'active', 'completed', 'inactive'],
      required: true,
    },
    detail: { type: String, default: '' },
  },
  { _id: false },
)

const statsSchema = new Schema<ReportDetailStatsSnapshot>(
  {
    totalRecords: { type: Number, required: true },
    secondaryLabel: { type: String, required: true },
    secondaryValue: { type: Number, default: null },
    secondaryFormat: {
      type: String,
      enum: ['currency', 'number', 'percent', 'days', 'rating', 'none'],
      required: true,
    },
    avgLabel: { type: String, required: true },
    avgValue: { type: Number, default: null },
    avgFormat: {
      type: String,
      enum: ['currency', 'number', 'percent', 'days', 'rating', 'none'],
      required: true,
    },
    status: { type: String, required: true },
  },
  { _id: false },
)

const trendSchema = new Schema<TrendBarSnapshot>(
  {
    month: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false },
)

const categorySchema = new Schema<CategoryBreakdownSnapshot>(
  {
    name: { type: String, required: true },
    percent: { type: Number, required: true },
    color: { type: String, required: true },
  },
  { _id: false },
)

const reportSchema = new Schema<IReport>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    module: {
      type: String,
      enum: ['employees', 'projects', 'leaves', 'performance', 'expenses'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ready', 'processing', 'failed'],
      default: 'processing',
      index: true,
    },
    exportFormat: {
      type: String,
      enum: ['pdf', 'excel', 'csv'],
      default: 'pdf',
    },
    periodLabel: { type: String, required: true },
    filters: { type: filtersSchema, required: true },
    stats: { type: statsSchema, required: true },
    trend: { type: [trendSchema], default: [] },
    categories: { type: [categorySchema], default: [] },
    records: { type: [recordSchema], default: [] },
    error: { type: String },
    readyAt: { type: Date },
  },
  { timestamps: true },
)

reportSchema.index({ companyId: 1, createdAt: -1 })
reportSchema.index({ companyId: 1, module: 1, createdAt: -1 })

export const Report = mongoose.model<IReport>('Report', reportSchema)

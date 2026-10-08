import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type ExpenseStatus = 'pending' | 'approved' | 'rejected'
export type ExpenseType = 'monthly' | 'event' | 'employee' | 'other'
export type ExpenseCategory =
  | 'equipment'
  | 'travel'
  | 'food'
  | 'software'
  | 'office'
  | 'other'
export type ExpenseActivityType =
  | 'created'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'updated'

export type ExpenseReceipt = {
  url: string
  publicId?: string
  filename: string
  size: string
  mimeType: string
}

export type ExpenseActivity = {
  type: ExpenseActivityType
  actorId?: Types.ObjectId
  actorName: string
  note?: string
  createdAt: Date
}

export interface IExpense extends Document {
  companyId: Types.ObjectId
  requestId: string
  title: string
  expenseType: ExpenseType
  category: ExpenseCategory
  employeeId?: Types.ObjectId
  employeeName?: string
  employeeAvatar?: string
  projectId?: Types.ObjectId
  projectName?: string
  billingPeriodMonth?: number
  billingPeriodYear?: number
  eventName?: string
  eventDate?: Date
  amount: number
  date: Date
  status: ExpenseStatus
  description: string
  receipt?: ExpenseReceipt
  activities: ExpenseActivity[]
  approvedById?: Types.ObjectId
  approvedByName?: string
  approvedAt?: Date
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const receiptSchema = new Schema<ExpenseReceipt>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true },
    filename: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
  },
  { _id: false },
)

const activitySchema = new Schema<ExpenseActivity>(
  {
    type: {
      type: String,
      enum: ['created', 'reviewed', 'approved', 'rejected', 'updated'],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const expenseSchema = new Schema<IExpense>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    requestId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    expenseType: {
      type: String,
      enum: ['monthly', 'event', 'employee', 'other'],
      required: true,
      default: 'employee',
      index: true,
    },
    category: {
      type: String,
      enum: ['equipment', 'travel', 'food', 'software', 'office', 'other'],
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    employeeName: { type: String, trim: true },
    employeeAvatar: { type: String, trim: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
      index: true,
    },
    projectName: { type: String, trim: true },
    billingPeriodMonth: { type: Number, min: 1, max: 12 },
    billingPeriodYear: { type: Number, min: 2000, max: 2100 },
    eventName: { type: String, trim: true, maxlength: 200 },
    eventDate: { type: Date },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
      default: 'pending',
      index: true,
    },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    receipt: { type: receiptSchema, required: false },
    activities: { type: [activitySchema], default: [] },
    approvedById: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedByName: { type: String, trim: true },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
)

expenseSchema.index({ companyId: 1, requestId: 1 }, { unique: true })
expenseSchema.index({ companyId: 1, status: 1 })
expenseSchema.index({ companyId: 1, expenseType: 1 })
expenseSchema.index({ companyId: 1, employeeId: 1 })
expenseSchema.index({ companyId: 1, projectId: 1 })
expenseSchema.index({ companyId: 1, date: -1 })

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema)

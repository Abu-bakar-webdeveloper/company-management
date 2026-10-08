import mongoose, { type Document, Schema, type Types } from 'mongoose'

import type { CompanyHub } from './company-hubs.js'

export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise'
export type CompanyStatus = 'active' | 'trial' | 'inactive'

export const PLAN_USER_LIMITS: Record<SubscriptionPlan, number> = {
  basic: 25,
  pro: 50,
  enterprise: 100,
}

export interface ICompany extends Document {
  name: string
  email: string
  phone: string
  phoneSecondary?: string
  startingDate?: Date
  subscriptionPlan: SubscriptionPlan
  status: CompanyStatus
  users: number
  userLimit: number
  rating: number
  country: string
  city: string
  addressLine: string
  postalCode: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  dateFormat: string
  enabledHubs: CompanyHub[]
  adminUserId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneSecondary: { type: String, trim: true },
    startingDate: { type: Date },
    subscriptionPlan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'inactive'],
      default: 'active',
    },
    users: { type: Number, default: 0, min: 0 },
    userLimit: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    logoUrl: { type: String, trim: true },
    primaryColor: { type: String, required: true, trim: true },
    secondaryColor: { type: String, required: true, trim: true },
    timezone: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true },
    dateFormat: { type: String, required: true, trim: true },
    enabledHubs: {
      type: [String],
      enum: ['people', 'finance', 'work'],
      default: () => ['people', 'finance', 'work'],
    },
    adminUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

companySchema.pre('save', function setDefaultUserLimit(next) {
  if (!this.userLimit || this.userLimit <= 0) {
    this.userLimit = PLAN_USER_LIMITS[this.subscriptionPlan] ?? PLAN_USER_LIMITS.basic
  }
  next()
})

companySchema.index({ name: 1 })
companySchema.index({ createdAt: -1 })
companySchema.index({ status: 1 })
companySchema.index({ rating: -1 })

export const Company = mongoose.model<ICompany>('Company', companySchema)

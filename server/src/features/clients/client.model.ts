import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type ClientStatus = 'active' | 'inactive'

export type ClientAddress = {
  country?: string
  city?: string
  addressLine?: string
  postalCode?: string
}

export type ClientPrimaryContact = {
  name?: string
  email?: string
  phone?: string
}

export interface IClient extends Document {
  companyId: Types.ObjectId
  clientCode: string
  name: string
  email?: string
  phone?: string
  website?: string
  industry?: string
  address?: ClientAddress
  primaryContact?: ClientPrimaryContact
  status: ClientStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const addressSchema = new Schema<ClientAddress>(
  {
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    addressLine: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false },
)

const primaryContactSchema = new Schema<ClientPrimaryContact>(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { _id: false },
)

const clientSchema = new Schema<IClient>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    clientCode: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    address: {
      type: addressSchema,
    },
    primaryContact: {
      type: primaryContactSchema,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

clientSchema.index({ companyId: 1, clientCode: 1 }, { unique: true })
clientSchema.index({ companyId: 1, createdAt: -1 })
clientSchema.index({ companyId: 1, name: 1 })

export const Client = mongoose.model<IClient>('Client', clientSchema)

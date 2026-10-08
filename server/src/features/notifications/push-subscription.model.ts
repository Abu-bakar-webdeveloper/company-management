import mongoose, { type Document, Schema, type Types } from 'mongoose'

export interface IPushSubscription extends Document {
  userId: Types.ObjectId
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true })
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 })

export const PushSubscription = mongoose.model<IPushSubscription>(
  'PushSubscription',
  pushSubscriptionSchema,
)

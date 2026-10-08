import mongoose, { type Document, Schema, type Types } from 'mongoose'

export interface IRefreshToken extends Document {
  userId: Types.ObjectId
  tokenHash: string
  expiresAt: Date
  rememberMe: boolean
  revokedAt?: Date
  userAgent?: string
  ip?: string
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    rememberMe: {
      type: Boolean,
      default: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    userAgent: String,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema)

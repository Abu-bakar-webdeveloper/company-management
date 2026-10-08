import mongoose, { type Document, Schema, type Types } from 'mongoose'

export type InviteTokenType = 'invite' | 'password_reset'

export interface IInviteToken extends Document {
  userId: Types.ObjectId
  tokenHash: string
  type: InviteTokenType
  expiresAt: Date
  usedAt: Date | null
}

const inviteTokenSchema = new Schema<IInviteToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    type: { type: String, enum: ['invite', 'password_reset'], required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

inviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const InviteToken = mongoose.model<IInviteToken>('InviteToken', inviteTokenSchema)

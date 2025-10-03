import mongoose, { Document, Schema } from 'mongoose';

export type Channel = 'sms' | 'whatsapp' | 'email' | 'call';

export interface IMessage extends Document {
  eventId?: Schema.Types.ObjectId;
  fromRole?: string;
  to: string[];
  channel: Channel;
  body?: string;
  meta?: Record<string, any>;
  providerMessageId?: string;
  status?: string;
}

const MessageSchema = new Schema<IMessage>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  fromRole: { type: String },
  to: [{ type: String }],
  channel: { type: String, enum: ['sms', 'whatsapp', 'email', 'call'], required: true },
  body: { type: String },
  meta: { type: Schema.Types.Mixed },
  providerMessageId: { type: String },
  status: { type: String, default: 'queued' },
}, { timestamps: true });

MessageSchema.index({ eventId: 1, createdAt: -1 });
const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export default Message;

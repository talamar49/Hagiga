import mongoose, { Document, Schema } from 'mongoose';

export type EventType = 'wedding' | 'festival' | 'standup' | 'concert' | string;

export interface IEvent extends Document {
  hostId: Schema.Types.ObjectId;
  title: string;
  type: EventType;
  date?: Date;
  venue?: string;
  description?: string;
  settings?: Record<string, any>;
}

const EventSchema = new Schema<IEvent>({
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Date, index: true },
  venue: { type: String },
  description: { type: String },
  settings: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

EventSchema.index({ hostId: 1 });
const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default Event;

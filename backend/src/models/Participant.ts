import mongoose, { Document, Schema } from 'mongoose';

export type ParticipantStatus = 'invited' | 'confirmed' | 'declined' | 'checked_in';

export interface IParticipant extends Document {
  eventId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId | null;
  name: string;
  lastName?: string;
  phone?: string;
  numAttendees: number;
  tags?: string[];
  status: ParticipantStatus;
  seatId?: Schema.Types.ObjectId | null;
  groups?: Schema.Types.ObjectId[];
  importMeta?: Record<string, any>;
}

const ParticipantSchema = new Schema<IParticipant>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true },
  lastName: { type: String },
  phone: { type: String, index: true },
  numAttendees: { type: Number, default: 1 },
  tags: { type: [String], default: [] },
  status: { type: String, default: 'invited' },
  seatId: { type: Schema.Types.ObjectId, ref: 'Table', default: null },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  importMeta: { type: Schema.Types.Mixed },
}, { timestamps: true });

ParticipantSchema.index({ eventId: 1, phone: 1 });
ParticipantSchema.index({ eventId: 1, status: 1 });
const Participant = mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);
export default Participant;

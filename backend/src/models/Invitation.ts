import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
  eventId: Schema.Types.ObjectId;
  creatorId?: Schema.Types.ObjectId;
  mediaId?: Schema.Types.ObjectId;
  text?: string;
}

const InvitationSchema = new Schema<IInvitation>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
  text: { type: String },
}, { timestamps: true });

InvitationSchema.index({ eventId: 1, createdAt: -1 });
const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);
export default Invitation;

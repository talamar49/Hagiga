import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  eventId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  members: Schema.Types.ObjectId[];
  createdBy?: Schema.Types.ObjectId;
}

const GroupSchema = new Schema<IGroup>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'Participant' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

GroupSchema.index({ eventId: 1, name: 1 });
const Group = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export default Group;

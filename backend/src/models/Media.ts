import mongoose, { Document, Schema } from 'mongoose';

export type MediaType = 'image' | 'video';

export interface IMedia extends Document {
  eventId: Schema.Types.ObjectId;
  uploaderId: Schema.Types.ObjectId;
  storageKey: string;
  url: string;
  type: MediaType;
  thumbnails?: Record<string, string>;
  caption?: string;
  likesCount: number;
  commentsCount: number;
  visibility?: 'public' | 'private' | 'groups';
  visibilityGroups?: Schema.Types.ObjectId[];
}

const MediaSchema = new Schema<IMedia>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  storageKey: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  thumbnails: { type: Schema.Types.Mixed },
  caption: { type: String },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  visibility: { type: String, default: 'public' },
  visibilityGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
}, { timestamps: true });

MediaSchema.index({ eventId: 1, createdAt: -1 });
MediaSchema.index({ uploaderId: 1 });
const Media = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
export default Media;

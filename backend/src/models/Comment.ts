import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  mediaId?: Schema.Types.ObjectId;
  eventId?: Schema.Types.ObjectId;
  authorId: Schema.Types.ObjectId;
  text: string;
  parentCommentId?: Schema.Types.ObjectId;
}

const CommentSchema = new Schema<IComment>({
  mediaId: { type: Schema.Types.ObjectId, ref: 'Media', index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
}, { timestamps: true });

CommentSchema.index({ mediaId: 1, createdAt: -1 });
CommentSchema.index({ eventId: 1, createdAt: -1 });
const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;

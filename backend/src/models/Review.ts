import mongoose, { Document, Schema } from 'mongoose';

export type ReviewerRole = 'host' | 'participant';

export interface IReview extends Document {
  supplierId: Schema.Types.ObjectId;
  eventId?: Schema.Types.ObjectId;
  reviewerId: Schema.Types.ObjectId;
  reviewerRole: ReviewerRole;
  rating: number;
  title?: string;
  body?: string;
}

const ReviewSchema = new Schema<IReview>({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reviewerRole: { type: String, enum: ['host', 'participant'], required: true },
  rating: { type: Number, min: 1, max: 10, required: true },
  title: { type: String },
  body: { type: String },
}, { timestamps: true });

ReviewSchema.index({ supplierId: 1, createdAt: -1 });
const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;

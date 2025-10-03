import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  ownerId: Schema.Types.ObjectId;
  businessName: string;
  logoUrl?: string;
  managerName?: string;
  phone?: string;
  email?: string;
  photos?: string[];
  shortDesc?: string;
  longDesc?: string;
  ranking?: number;
  ratingCount?: number;
}

const SupplierSchema = new Schema<ISupplier>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  businessName: { type: String, required: true, index: true },
  logoUrl: { type: String },
  managerName: { type: String },
  phone: { type: String },
  email: { type: String },
  photos: [{ type: String }],
  shortDesc: { type: String },
  longDesc: { type: String },
  ranking: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

SupplierSchema.index({ businessName: 'text', shortDesc: 'text', longDesc: 'text' });
const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default Supplier;

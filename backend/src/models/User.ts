import mongoose, { Document, Schema } from 'mongoose';

export type Role = 'participant' | 'host' | 'supplier' | 'admin';

export interface IUser extends Document {
  phone?: string;
  countryCode?: string;
  normalizedPhone?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  roles: Role[];
  lastSeen?: Date;
  metadata?: Record<string, any>;
}

const UserSchema = new Schema<IUser>({
  phone: { type: String, index: true },
  countryCode: { type: String },
  normalizedPhone: { type: String, index: true },
  firstName: { type: String },
  lastName: { type: String },
  displayName: { type: String },
  email: { type: String, lowercase: true, trim: true },
  roles: { type: [String], default: ['participant'] },
  lastSeen: { type: Date },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;

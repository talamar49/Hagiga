import mongoose from 'mongoose';

const { Schema } = mongoose;

// Guest documents store event-scoped guest records created from CSV imports.
// We allow flexible fields (non-strict) so CSV columns become top-level fields.
const GuestSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    // uploadedBy is optional when auth is disabled in dev
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, strict: false }
);

const Guest = mongoose.models.Guest || mongoose.model('Guest', GuestSchema);

export default Guest;

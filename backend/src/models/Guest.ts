import mongoose from 'mongoose';

const { Schema } = mongoose;
const PHONE_REGEX = /^0\d{9}$/;

const GuestSchema = new Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String },
    participantsCount: { type: Number, default: 1 },
    phoneNumber: {
    type: String,
    required: true,
    unique: true, 
    validate: {
      validator: (v: string) => PHONE_REGEX.test(v),
      message: (props: { value: string }) => 
        `${props.value} is not a valid 10-digit phone number starting with 0!`,
      },
    },
    eventId: { type: Schema.Types.ObjectId , ref: 'Event', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, strict: false },
  );

const Guest = mongoose.models.Guest || mongoose.model('Guest', GuestSchema);

export default Guest;

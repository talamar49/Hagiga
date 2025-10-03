import mongoose, { Document, Schema } from 'mongoose';

export type TableType = 'round' | 'rect' | string;

export interface ISeat {
  seatId: string;
  occupantParticipantId?: Schema.Types.ObjectId | null;
  x?: number;
  y?: number;
}

export interface ITable extends Document {
  eventId: Schema.Types.ObjectId;
  name?: string;
  type: TableType;
  capacity: number;
  shapeMeta?: Record<string, any>;
  seats: ISeat[];
  createdBy?: Schema.Types.ObjectId;
}

const SeatSchema = new Schema<ISeat>({
  seatId: { type: String, required: true },
  occupantParticipantId: { type: Schema.Types.ObjectId, ref: 'Participant', default: null },
  x: { type: Number },
  y: { type: Number },
}, { _id: false });

const TableSchema = new Schema<ITable>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  name: { type: String },
  type: { type: String, default: 'round' },
  capacity: { type: Number, default: 8 },
  shapeMeta: { type: Schema.Types.Mixed },
  seats: { type: [SeatSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TableSchema.index({ eventId: 1 });
const Table = mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);
export default Table;

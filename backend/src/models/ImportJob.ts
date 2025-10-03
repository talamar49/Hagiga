import mongoose, { Document, Schema } from 'mongoose';

export interface IImportJob extends Document {
  eventId: Schema.Types.ObjectId;
  uploadedBy?: Schema.Types.ObjectId;
  fileKey: string;
  status: 'uploaded' | 'processing' | 'done' | 'failed';
  totalRows?: number;
  successCount?: number;
  failureCount?: number;
  errorLog?: string[];
}

const ImportJobSchema = new Schema<IImportJob>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  fileKey: { type: String, required: true },
  status: { type: String, default: 'uploaded' },
  totalRows: { type: Number },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  errorLog: [{ type: String }],
}, { timestamps: true });

ImportJobSchema.index({ eventId: 1, status: 1 });
const ImportJob = mongoose.models.ImportJob || mongoose.model<IImportJob>('ImportJob', ImportJobSchema);
export default ImportJob;

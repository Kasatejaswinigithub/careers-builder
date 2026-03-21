import { Schema, model, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  tenantId: Types.ObjectId;
  applicant: { name: string; email: string; phone?: string; linkedIn?: string; };
  resumeUrl?: string;
  coverLetter?: string;
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  jobId:    { type: Schema.Types.ObjectId, ref: 'Job',    required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  applicant: {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    phone:    String,
    linkedIn: String,
  },
  resumeUrl:   String,
  coverLetter: String,
  status: { type: String, enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'], default: 'new' },
}, { timestamps: true });

ApplicationSchema.index({ tenantId: 1, jobId: 1 });

export const Application = model<IApplication>('Application', ApplicationSchema);

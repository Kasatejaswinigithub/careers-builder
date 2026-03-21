import { Schema, model, Document, Types } from 'mongoose';

export interface IJob extends Document {
  tenantId: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  tags: string[];
  status: 'draft' | 'published' | 'closed';
  workPolicy?: string;
  department?: string;
  experienceLevel?: string;
  salaryRange?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  tenantId:       { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title:          { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  location:       { type: String, default: 'Remote' },
  jobType:        { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], default: 'full-time' },
  salaryMin:      { type: Number },
  salaryMax:      { type: Number },
  salaryCurrency: { type: String, default: 'USD' },
  tags:            [{ type: String, trim: true }],
  status:          { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  workPolicy:      { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' },
  department:      { type: String, default: '' },
  experienceLevel: { type: String, enum: ['Junior', 'Mid-level', 'Senior', ''], default: '' },
  salaryRange:     { type: String, default: '' },
}, { timestamps: true });

JobSchema.index({ tenantId: 1, status: 1 });
JobSchema.index({ tenantId: 1, createdAt: -1 });

export const Job = model<IJob>('Job', JobSchema);

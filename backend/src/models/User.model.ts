import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  tenantId: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: 'admin' | 'recruiter' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  tenantId:     { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  email:        { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'recruiter', 'viewer'], default: 'admin' },
}, { timestamps: true });

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User = model<IUser>('User', UserSchema);

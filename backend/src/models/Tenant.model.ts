import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  slug: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  published: boolean;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    bannerUrl: string;
    cultureVideoUrl: string;
    heroHeadline: string;
    heroSubtext: string;
    about: string;
    lifeAtCompany: string;
    website: string;
    linkedin: string;
    twitter: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:      { type: String, required: true, trim: true },
  plan:      { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  published: { type: Boolean, default: false },
  branding: {
    primaryColor:    { type: String, default: '#6366f1' },
    secondaryColor:  { type: String, default: '#f1f5f9' },
    logoUrl:         { type: String, default: '' },
    bannerUrl:       { type: String, default: '' },
    cultureVideoUrl: { type: String, default: '' },
    heroHeadline:    { type: String, default: '' },
    heroSubtext:     { type: String, default: '' },
    about:           { type: String, default: '' },
    lifeAtCompany:   { type: String, default: '' },
    website:         { type: String, default: '' },
    linkedin:        { type: String, default: '' },
    twitter:         { type: String, default: '' },
  },
}, { timestamps: true });

export const Tenant = model<ITenant>('Tenant', TenantSchema);

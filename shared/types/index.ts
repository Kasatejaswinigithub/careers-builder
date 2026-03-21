export type PlanTier = 'free' | 'pro' | 'enterprise';
export type JobStatus = 'draft' | 'published' | 'closed';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
export type UserRole = 'admin' | 'recruiter' | 'viewer';
export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

export interface BrandingDTO {
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
}

export interface TenantDTO {
  _id: string;
  slug: string;
  name: string;
  plan: PlanTier;
  branding: BrandingDTO;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDTO {
  _id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface JobDTO {
  _id: string;
  tenantId: string;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  tags: string[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDTO {
  _id: string;
  jobId: string;
  tenantId: string;
  applicant: {
    name: string;
    email: string;
    phone?: string;
    linkedIn?: string;
  };
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
  tenant: TenantDTO;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

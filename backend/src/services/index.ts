import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { Tenant } from '../models/Tenant.model';
import { User } from '../models/User.model';
import { Job } from '../models/Job.model';
import { Application } from '../models/Application.model';
import { signToken } from '../utils/jwt';
import { UnauthorizedError, NotFoundError, ConflictError, AppError } from '../utils/errors';

// ── Auth ──────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string, tenantSlug: string) {
  const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() });
  if (!tenant) throw new UnauthorizedError('Invalid credentials');
  const user = await User.findOne({ tenantId: tenant._id, email: email.toLowerCase() });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');
  const token = signToken({ userId: user._id.toString(), tenantId: tenant._id.toString(), role: user.role });
  return { token, user: { _id: user._id, tenantId: user.tenantId, email: user.email, role: user.role, createdAt: user.createdAt }, tenant };
}

export async function registerTenant(tenantName: string, slug: string, email: string, password: string) {
  const existing = await Tenant.findOne({ slug: slug.toLowerCase() });
  if (existing) throw new ConflictError('Slug already taken');
  const tenant = await Tenant.create({ slug: slug.toLowerCase(), name: tenantName, plan: 'free', branding: { heroHeadline: 'Join our team', heroSubtext: 'We are hiring!' } });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ tenantId: tenant._id, email: email.toLowerCase(), passwordHash, role: 'admin' });
  const token = signToken({ userId: user._id.toString(), tenantId: tenant._id.toString(), role: user.role });
  return { token, user, tenant };
}

// ── Tenant ────────────────────────────────────────────────────────────
export async function getTenant(tenantId: string) {
  const t = await Tenant.findById(tenantId).lean();
  if (!t) throw new NotFoundError('Tenant');
  return t;
}

export async function updateBranding(tenantId: string, data: Record<string, unknown>) {
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    { $set: Object.fromEntries(Object.entries(data).map(([k, v]) => ['branding.' + k, v])) },
    { new: true, runValidators: true }
  ).lean();
  if (!tenant) throw new NotFoundError('Tenant');
  return tenant;
}

export async function setPublished(tenantId: string, published: boolean) {
  return Tenant.findByIdAndUpdate(tenantId, { $set: { published } }, { new: true }).lean();
}

// ── Public tenant ─────────────────────────────────────────────────────
export async function getPublicTenant(slug: string) {
  const t = await Tenant.findOne({ slug: slug.toLowerCase(), published: true }).lean();
  if (!t) throw new NotFoundError('Company page');
  return t;
}

// ── Jobs ──────────────────────────────────────────────────────────────
export async function getJobs(tenantId: string, filters: Record<string, string> = {}, page = 1, limit = 20) {
  const q: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };
  if (filters.status)   q.status  = filters.status;
  if (filters.jobType)  q.jobType = filters.jobType;
  if (filters.location) q.location = new RegExp(filters.location, 'i');
  if (filters.search)   q.title   = new RegExp(filters.search, 'i');
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Job.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(q),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getJobById(tenantId: string, jobId: string) {
  const job = await Job.findOne({ _id: new Types.ObjectId(jobId), tenantId: new Types.ObjectId(tenantId) }).lean();
  if (!job) throw new NotFoundError('Job');
  return job;
}

export async function createJob(tenantId: string, data: Record<string, unknown>) {
  return Job.create({ tenantId: new Types.ObjectId(tenantId), ...data });
}

export async function updateJob(tenantId: string, jobId: string, data: Record<string, unknown>) {
  const job = await Job.findOneAndUpdate(
    { _id: new Types.ObjectId(jobId), tenantId: new Types.ObjectId(tenantId) },
    { $set: data }, { new: true, runValidators: true }
  ).lean();
  if (!job) throw new NotFoundError('Job');
  return job;
}

export async function deleteJob(tenantId: string, jobId: string) {
  const job = await Job.findOneAndDelete({ _id: new Types.ObjectId(jobId), tenantId: new Types.ObjectId(tenantId) });
  if (!job) throw new NotFoundError('Job');
}

// ── Applications ──────────────────────────────────────────────────────
export async function getApplications(tenantId: string, filters: Record<string, string> = {}, page = 1, limit = 20) {
  const q: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };
  if (filters.jobId)  q.jobId  = new Types.ObjectId(filters.jobId);
  if (filters.status) q.status = filters.status;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Application.find(q).populate('jobId', 'title location').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Application.countDocuments(q),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function submitApplication(tenantId: string, jobId: string, data: Record<string, unknown>) {
  const job = await Job.findOne({ _id: new Types.ObjectId(jobId), tenantId: new Types.ObjectId(tenantId), status: 'published' });
  if (!job) throw new NotFoundError('Job');
  const existing = await Application.findOne({ jobId: new Types.ObjectId(jobId), 'applicant.email': (data.applicant as any).email.toLowerCase() });
  if (existing) throw new AppError('You have already applied for this position', 409, 'DUPLICATE');
  return Application.create({ jobId: new Types.ObjectId(jobId), tenantId: new Types.ObjectId(tenantId), ...data });
}

export async function updateApplicationStatus(tenantId: string, appId: string, status: string) {
  const app = await Application.findOneAndUpdate(
    { _id: new Types.ObjectId(appId), tenantId: new Types.ObjectId(tenantId) },
    { $set: { status } }, { new: true }
  ).lean();
  if (!app) throw new NotFoundError('Application');
  return app;
}

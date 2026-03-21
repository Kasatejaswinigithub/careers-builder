import { Router, Request, Response, NextFunction } from 'express';
import * as svc from '../services';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';

const r = Router();

// ── Health ────────────────────────────────────────────────────────────
r.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Auth ──────────────────────────────────────────────────────────────
r.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, tenantSlug } = req.body;
    if (!email || !password || !tenantSlug) { res.status(400).json({ message: 'email, password and tenantSlug required' }); return; }
    const data = await svc.loginUser(email, password, tenantSlug);
    res.json(data);
  } catch (err) { next(err); }
});

r.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantName, slug, email, password } = req.body;
    if (!tenantName || !slug || !email || !password) { res.status(400).json({ message: 'All fields required' }); return; }
    const data = await svc.registerTenant(tenantName, slug, email, password);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

r.get('/auth/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ user: req.user, tenant: req.tenant }); } catch (err) { next(err); }
});

// ── Tenant branding (protected) ───────────────────────────────────────
r.get('/tenant', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.getTenant(req.tenant!._id.toString())); } catch (err) { next(err); }
});

r.patch('/tenant/branding', authenticate, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateBranding(req.tenant!._id.toString(), req.body)); } catch (err) { next(err); }
});

r.patch('/tenant/publish', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.setPublished(req.tenant!._id.toString(), req.body.published)); } catch (err) { next(err); }
});

// ── Jobs (protected) ──────────────────────────────────────────────────
r.get('/jobs', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, jobType, location, search, page, limit } = req.query as Record<string, string>;
    res.json(await svc.getJobs(req.tenant!._id.toString(), { status, jobType, location, search }, +page || 1, +limit || 20));
  } catch (err) { next(err); }
});

r.get('/jobs/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.getJobById(req.tenant!._id.toString(), req.params.id)); } catch (err) { next(err); }
});

r.post('/jobs', authenticate, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await svc.createJob(req.tenant!._id.toString(), req.body)); } catch (err) { next(err); }
});

r.patch('/jobs/:id', authenticate, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateJob(req.tenant!._id.toString(), req.params.id, req.body)); } catch (err) { next(err); }
});

r.delete('/jobs/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await svc.deleteJob(req.tenant!._id.toString(), req.params.id); res.status(204).send(); } catch (err) { next(err); }
});

// ── Applications (protected) ──────────────────────────────────────────
r.get('/applications', authenticate, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobId, status, page, limit } = req.query as Record<string, string>;
    res.json(await svc.getApplications(req.tenant!._id.toString(), { jobId, status }, +page || 1, +limit || 20));
  } catch (err) { next(err); }
});

r.patch('/applications/:id/status', authenticate, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateApplicationStatus(req.tenant!._id.toString(), req.params.id, req.body.status)); } catch (err) { next(err); }
});

// ── Public routes ─────────────────────────────────────────────────────
r.get('/public/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await svc.getPublicTenant(req.params.slug)); } catch (err) { next(err); }
});

r.get('/public/:slug/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await svc.getPublicTenant(req.params.slug);
    const { jobType, location, search, page, limit } = req.query as Record<string, string>;
    res.json(await svc.getJobs(tenant._id.toString(), { status: 'published', jobType, location, search }, +page || 1, +limit || 100));
  } catch (err) { next(err); }
});

r.get('/public/:slug/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await svc.getPublicTenant(req.params.slug);
    res.json(await svc.getJobById(tenant._id.toString(), req.params.jobId));
  } catch (err) { next(err); }
});

r.post('/public/:slug/jobs/:jobId/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await svc.getPublicTenant(req.params.slug);
    const app = await svc.submitApplication(tenant._id.toString(), req.params.jobId, req.body);
    res.status(201).json(app);
  } catch (err) { next(err); }
});

export default r;

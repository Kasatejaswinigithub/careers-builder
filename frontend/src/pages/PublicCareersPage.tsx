import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../api';

interface Job {
  _id: string; title: string; description: string; location: string;
  jobType: string; tags: string[]; status: string; createdAt: string;
  salaryMin?: number; salaryMax?: number; salaryCurrency?: string;
}

interface Company {
  _id: string; slug: string; name: string; published: boolean;
  branding: {
    primaryColor: string; secondaryColor: string; logoUrl: string; bannerUrl: string;
    cultureVideoUrl: string; heroHeadline: string; heroSubtext: string;
    about: string; lifeAtCompany: string; website: string; linkedin: string; twitter: string;
  };
}

const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  'contract': 'Contract', 'internship': 'Internship', 'remote': 'Remote',
};

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return days + ' days ago';
  return Math.floor(days / 30) + ' months ago';
}

function salary(job: Job): string {
  if (!job.salaryMin && !job.salaryMax) return '';
  const cur = job.salaryCurrency || 'USD';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 });
  if (job.salaryMin && job.salaryMax) return `${fmt.format(job.salaryMin)} - ${fmt.format(job.salaryMax)}`;
  if (job.salaryMin) return `${fmt.format(job.salaryMin)}+`;
  return `Up to ${fmt.format(job.salaryMax!)}`;
}

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ApplyDrawer({ job, company, onClose }: { job: Job; company: Company; onClose: () => void; }) {
  const primary = company.branding.primaryColor || '#6366f1';
  const [step, setStep]     = useState<'form' | 'done'>('form');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({ name: '', email: '', phone: '', linkedin: '', coverLetter: '' });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await publicApi.apply(company.slug, job._id, {
        applicant: { name: form.name, email: form.email, phone: form.phone || undefined, linkedIn: form.linkedin || undefined },
        coverLetter: form.coverLetter || undefined,
      });
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col slide-in">
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}} .slide-in{animation:slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)}`}</style>

        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: primary }}>Apply now</p>
            <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.location}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">✕</button>
        </div>

        {step === 'done' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4" style={{ backgroundColor: `${primary}15`, color: primary }}>✓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application sent!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Thanks, {form.name.split(' ')[0]}! We'll be in touch at <strong>{form.email}</strong> soon.
            </p>
            <button onClick={onClose} className="mt-8 w-full py-3 rounded-xl text-sm font-bold text-white transition-transform active:scale-95" style={{ backgroundColor: primary }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full name *</label>
                    <input required value={form.name} onChange={setField('name')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-opacity-20 outline-none" style={{"--tw-ring-color": primary} as any} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email *</label>
                    <input required type="email" value={form.email} onChange={setField('email')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
                    <input value={form.phone} onChange={setField('phone')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">LinkedIn</label>
                    <input value={form.linkedin} onChange={setField('linkedin')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cover letter</label>
                  <textarea rows={5} value={form.coverLetter} onChange={setField('coverLetter')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none outline-none" />
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs font-medium text-red-600 leading-snug">{error}</div>}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all flex items-center justify-center" style={{ backgroundColor: primary }}>
                {saving ? <Spinner /> : 'Apply Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export function PublicCareersPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  
  const [search, setSearch]     = useState('');
  const [locFilter, setLocFilter]   = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [comp, jobsRes] = await Promise.all([
          publicApi.getCompany(slug),
          publicApi.getJobs(slug),
        ]);
        setCompany(comp);
        setJobs(jobsRes.data || jobsRes);
      } catch (err) {
        setError('Careers page not found.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (!company) return;
    
    // SEO Updates
    document.title = `${company.name} Careers`;
    const updateMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', company.branding.heroSubtext || `Join the team at ${company.name}`);
    updateMeta('og:title', `${company.name} - Careers`, 'property');
    updateMeta('og:description', company.branding.heroSubtext || 'Join our team', 'property');

    // JSON-LD Cleanup and Mount
    const ldId = 'ld-json-company';
    document.getElementById(ldId)?.remove();
    const script = document.createElement('script');
    script.id = ldId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': company.name,
      'url': company.branding.website || window.location.origin,
      'sameAs': [company.branding.linkedin, company.branding.twitter].filter(Boolean),
    });
    document.head.appendChild(script);

    return () => { document.getElementById(ldId)?.remove(); };
  }, [company]);

  const locations = useMemo(() => Array.from(new Set(jobs.map(j => j.location).filter(Boolean))).sort(), [jobs]);
  const types = useMemo(() => Array.from(new Set(jobs.map(j => j.jobType).filter(Boolean))).sort(), [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase());
      const matchLoc    = !locFilter  || j.location === locFilter;
      const matchType   = !typeFilter || j.jobType  === typeFilter;
      return matchSearch && matchLoc && matchType;
    });
  }, [jobs, search, locFilter, typeFilter]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (error || !company) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
      <h1 className="text-6xl font-black text-gray-100 mb-4">404</h1>
      <p className="text-xl font-bold text-gray-800">Careers page not found</p>
      <p className="text-gray-400 mt-2 max-w-xs">{error}</p>
    </div>
  );

  const primary = company.branding.primaryColor || '#6366f1';
  const secondary = company.branding.secondaryColor || '#f8fafc';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {company.branding.logoUrl ? (
              <img src={company.branding.logoUrl} alt={company.name} className="h-8 object-contain" />
            ) : (
              <span className="font-black text-xl tracking-tight">{company.name}</span>
            )}
          </div>
          <a href="#jobs" className="text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border-2 transition-all hover:bg-gray-50" style={{ borderColor: primary, color: primary }}>Open Roles</a>
        </div>
      </nav>

      <header style={{ backgroundColor: secondary }} className="relative overflow-hidden">
        {company.branding.bannerUrl && (
          <div className="h-64 sm:h-80 relative">
            <img src={company.branding.bannerUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: primary }}>{company.name} Careers</p>
          <h1 className="text-4xl sm:text-6xl font-black leading-[1.1] tracking-tight mb-6" style={{ color: primary }}>
            {company.branding.heroHeadline || 'Join our team'}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed font-medium">
            {company.branding.heroSubtext || 'We are looking for talented people to join us.'}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 space-y-24">
        {company.branding.about && (
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] mb-6" style={{ color: primary }}>About us</h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{company.branding.about}</p>
          </section>
        )}

        <section id="jobs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Open positions</h2>
              <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">{filtered.length} results</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles..." className="px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2" style={{"--tw-ring-color": primary} as any} />
              {locations.length > 1 && (
                <select value={locFilter} onChange={(e) => setLocFilter(e.target.value)} className="px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none">
                  <option value="">Locations</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map(job => (
              <div key={job._id} onClick={() => setApplyJob(job)} className="bg-white border border-gray-100 rounded-[2rem] p-8 hover:shadow-xl hover:border-transparent transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300">{timeAgo(job.createdAt)}</span>
                </div>
                <h3 className="text-xl font-black mb-3 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                <p className="text-gray-400 text-sm mb-6 flex items-center gap-2 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {job.location}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black" style={{ color: primary }}>{salary(job)}</span>
                  <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-100 pt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-400 font-medium">© {new Date().getFullYear()} {company.name}</p>
          <div className="flex gap-6 text-sm font-bold" style={{ color: primary }}>
            {company.branding.website && <a href={company.branding.website} target="_blank" rel="noreferrer">Website</a>}
            {company.branding.linkedin && <a href={company.branding.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          </div>
        </footer>
      </main>

      {applyJob && <ApplyDrawer job={applyJob} company={company} onClose={() => setApplyJob(null)} />}
    </div>
  );
}
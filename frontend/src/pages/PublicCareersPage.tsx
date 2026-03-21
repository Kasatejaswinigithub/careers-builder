import { useState, useEffect, useMemo } from 'react';
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
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return days + ' days ago';
  return Math.floor(days / 30) + ' months ago';
}

function salary(job: Job): string {
  if (!job.salaryMin && !job.salaryMax) return '';
  const cur = job.salaryCurrency || 'USD';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 });
  if (job.salaryMin && job.salaryMax) return fmt.format(job.salaryMin) + ' - ' + fmt.format(job.salaryMax);
  if (job.salaryMin) return fmt.format(job.salaryMin) + '+';
  return 'Up to ' + fmt.format(job.salaryMax!);
}

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
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

  useEffect(function() {
    document.body.style.overflow = 'hidden';
    return function() { document.body.style.overflow = ''; };
  }, []);

  function setField(k: string) {
    return function(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }); });
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await publicApi.apply(company.slug, job._id, {
        applicant: { name: form.name, email: form.email, phone: form.phone || undefined, linkedIn: form.linkedin || undefined },
        coverLetter: form.coverLetter || undefined,
      });
      setStep('done');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col" style={{ animation: 'slideIn 0.25s ease' }}>
        <style>{'.slide-in{animation:slideIn .25s ease}@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}'}</style>

        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: primary }}>Apply now</p>
            <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.location}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl" aria-label="Close">x</button>
        </div>

        {step === 'done' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: primary + '20', color: primary }}>
              ✓
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application submitted!</h3>
            <p className="text-gray-500 text-sm">
              {'Thanks, ' + form.name.split(' ')[0] + "! We'll be in touch at " + form.email + '.'}
            </p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primary }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Full name <span className="text-red-400">*</span>
                  </label>
                  <input required value={form.name} onChange={setField('name')} placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input required type="email" value={form.email} onChange={setField('email')} placeholder="jane@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                  <input value={form.phone} onChange={setField('phone')} placeholder="+1 555 000 0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">LinkedIn</label>
                  <input value={form.linkedin} onChange={setField('linkedin')} placeholder="linkedin.com/in/jane"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Cover letter</label>
                <textarea rows={6} value={form.coverLetter} onChange={setField('coverLetter')}
                  placeholder="Tell us why you are excited about this role..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-gray-400" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: primary }}>
                {saving ? <Spinner /> : 'Submit application'}
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

  useEffect(function() {
    async function load() {
      try {
        const [comp, jobsData] = await Promise.all([
          publicApi.getCompany(slug),
          publicApi.getJobs(slug),
        ]);
        setCompany(comp);
        setJobs(jobsData.data || jobsData);
      } catch {
        setError('This careers page could not be found.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useEffect(function() {
    if (!company) return;
    document.title = company.name + ' Careers';
    var meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', company.branding.heroSubtext || 'Join ' + company.name);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.setAttribute('content', company.name + ' - Careers');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.setAttribute('content', company.branding.heroSubtext || 'Explore open roles at ' + company.name);
    var ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) { ogType = document.createElement('meta'); ogType.setAttribute('property', 'og:type'); document.head.appendChild(ogType); }
    ogType.setAttribute('content', 'website');
    var existingLd = document.getElementById('ld-json');
    if (existingLd) existingLd.remove();
    var ldScript = document.createElement('script');
    ldScript.id = 'ld-json';
    ldScript.type = 'application/ld+json';
    ldScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': company.name,
      'url': company.branding.website || window.location.origin,
      'sameAs': [company.branding.linkedin, company.branding.twitter].filter(Boolean),
    });
    document.head.appendChild(ldScript);
  }, [company]);

  const locations = useMemo(function() {
    return Array.from(new Set(jobs.map(function(j) { return j.location; }).filter(Boolean))).sort();
  }, [jobs]);

  const types = useMemo(function() {
    return Array.from(new Set(jobs.map(function(j) { return j.jobType; }).filter(Boolean))).sort();
  }, [jobs]);

  const filtered = useMemo(function() {
    return jobs.filter(function(j) {
      var matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase());
      var matchLoc    = !locFilter  || j.location === locFilter;
      var matchType   = !typeFilter || j.jobType  === typeFilter;
      return matchSearch && matchLoc && matchType;
    });
  }, [jobs, search, locFilter, typeFilter]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );

  if (error || !company) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-4xl">404</p>
      <h1 className="text-xl font-bold text-gray-800">Page not found</h1>
      <p className="text-gray-500 text-sm">{error || 'This careers page does not exist.'}</p>
    </div>
  );

  const primary   = company.branding.primaryColor || '#6366f1';
  const secondary = company.branding.secondaryColor || '#eef2ff';
  const hasFilters = search || locFilter || typeFilter;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.branding.logoUrl ? (
              <img src={company.branding.logoUrl} alt={company.name} className="h-7 object-contain" />
            ) : (
              <span className="font-bold text-gray-900 text-lg">{company.name}</span>
            )}
          </div>
          <a
            href="#jobs"
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border-2 transition-colors"
            style={{ borderColor: primary, color: primary }}
          >
            Open roles
          </a>
        </div>
      </nav>

      {/* Hero / Banner */}
      <header style={{ backgroundColor: secondary }}>
        {company.branding.bannerUrl && (
          <div className="relative h-48 sm:h-64 overflow-hidden">
            <img src={company.branding.bannerUrl} alt="Company banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>
            {company.name + ' - Careers'}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4" style={{ color: primary }}>
            {company.branding.heroHeadline || 'Join our team'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
            {company.branding.heroSubtext || 'We are looking for talented people to join us.'}
          </p>
          {jobs.length > 0 && (
            <div className="flex gap-4 mt-8 flex-wrap">
              <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">Open roles</p>
              </div>
              {locations.slice(0, 2).map(function(loc) {
                return (
                  <div key={loc} className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
                    <p className="text-2xl font-bold text-gray-900">{jobs.filter(function(j) { return j.location === loc; }).length}</p>
                    <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">{loc}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">

        {/* About */}
        {company.branding.about && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>About us</h2>
            <p className="text-gray-600 text-base leading-relaxed">{company.branding.about}</p>
          </section>
        )}

        {/* Life at company */}
        {company.branding.lifeAtCompany && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>Life at {company.name}</h2>
            <p className="text-gray-600 text-base leading-relaxed">{company.branding.lifeAtCompany}</p>
          </section>
        )}

        {/* Culture video */}
        {company.branding.cultureVideoUrl && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>Our culture</h2>
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={company.branding.cultureVideoUrl}
                title="Culture video"
                className="absolute top-0 left-0 w-full h-full rounded-2xl border border-gray-200"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Job listings */}
        <section id="jobs">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Open positions
              <span className="ml-2 text-base font-normal text-gray-400">({filtered.length})</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by job title..."
                value={search}
                onChange={function(e) { setSearch(e.target.value); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                aria-label="Search jobs"
              />
            </div>
            {locations.length > 1 && (
              <select
                value={locFilter}
                onChange={function(e) { setLocFilter(e.target.value); }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-400 sm:min-w-36"
                aria-label="Filter by location"
              >
                <option value="">All locations</option>
                {locations.map(function(l) { return <option key={l} value={l}>{l}</option>; })}
              </select>
            )}
            {types.length > 1 && (
              <select
                value={typeFilter}
                onChange={function(e) { setTypeFilter(e.target.value); }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-400 sm:min-w-36"
                aria-label="Filter by job type"
              >
                <option value="">All types</option>
                {types.map(function(t) { return <option key={t} value={t}>{JOB_TYPE_LABELS[t] || t}</option>; })}
              </select>
            )}
          </div>

          {/* Active filter pills */}
          {hasFilters && (
            <div className="flex gap-2 flex-wrap mb-4">
              {search && (
                <button onClick={function() { setSearch(''); }} className="text-xs px-3 py-1.5 rounded-full border font-medium" style={{ borderColor: primary + '60', color: primary }}>
                  {'"' + search + '" x'}
                </button>
              )}
              {locFilter && (
                <button onClick={function() { setLocFilter(''); }} className="text-xs px-3 py-1.5 rounded-full border font-medium" style={{ borderColor: primary + '60', color: primary }}>
                  {locFilter + ' x'}
                </button>
              )}
              {typeFilter && (
                <button onClick={function() { setTypeFilter(''); }} className="text-xs px-3 py-1.5 rounded-full border font-medium" style={{ borderColor: primary + '60', color: primary }}>
                  {(JOB_TYPE_LABELS[typeFilter] || typeFilter) + ' x'}
                </button>
              )}
              <button onClick={function() { setSearch(''); setLocFilter(''); setTypeFilter(''); }} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600">
                Clear all
              </button>
            </div>
          )}

          {/* Job cards */}
          {filtered.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
              <p className="text-3xl mb-3">🔎</p>
              <p className="text-gray-500 font-medium">No roles match your search</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              {hasFilters && (
                <button onClick={function() { setSearch(''); setLocFilter(''); setTypeFilter(''); }}
                  className="mt-4 text-sm font-semibold underline" style={{ color: primary }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(function(job) {
                return (
                  <article
                    key={job._id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={function() { setApplyJob(job); }}
                    tabIndex={0}
                    role="button"
                    aria-label={'Apply for ' + job.title}
                    onKeyDown={function(e) { if (e.key === 'Enter') setApplyJob(job); }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-gray-700">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                            </svg>
                            {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                          </span>
                          {salary(job) && (
                            <span className="font-medium text-gray-700">{salary(job)}</span>
                          )}
                        </div>
                        {job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {job.tags.slice(0, 4).map(function(tag) {
                              return (
                                <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: primary + '15', color: primary }}>
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: primary + '15', color: primary }}>
                          →
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Social links */}
        {(company.branding.website || company.branding.linkedin || company.branding.twitter) && (
          <section className="border-t border-gray-200 pt-10">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-gray-500">Follow us:</span>
              {company.branding.website && (
                <a href={company.branding.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: primary }}>
                  Website
                </a>
              )}
              {company.branding.linkedin && (
                <a href={company.branding.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: primary }}>
                  LinkedIn
                </a>
              )}
              {company.branding.twitter && (
                <a href={company.branding.twitter} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: primary }}>
                  Twitter
                </a>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>{'© ' + new Date().getFullYear() + ' ' + company.name + '. All rights reserved.'}</p>
          <p>{'Powered by Careers Builder'}</p>
        </footer>
      </div>

      {applyJob && company && (
        <ApplyDrawer job={applyJob} company={company} onClose={function() { setApplyJob(null); }} />
      )}
    </div>
  );
}

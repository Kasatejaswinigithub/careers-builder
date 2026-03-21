import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tenantApi, jobsApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import { Spinner, Button } from '../components/ui';

interface Job {
  _id: string; title: string; location: string; jobType: string;
  tags: string[]; status: string; salaryRange?: string; workPolicy?: string;
  department?: string; experienceLevel?: string;
}

interface Branding {
  primaryColor: string; secondaryColor: string; logoUrl: string; bannerUrl: string;
  cultureVideoUrl: string; heroHeadline: string; heroSubtext: string;
  about: string; lifeAtCompany: string; website: string; linkedin: string; twitter: string;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  'contract': 'Contract', 'internship': 'Internship', 'remote': 'Remote',
};

export function PreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant, setTenant } = useAuthStore();
  const [branding, setBranding] = useState<Branding | null>(null);
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [loading, setLoading]   = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(function() {
    Promise.all([
      tenantApi.get(),
      jobsApi.list({ limit: 100, status: 'published' }),
    ]).then(function(results) {
      setBranding(results[0].branding || {});
      setJobs(results[1].data || []);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  async function handlePublish(published: boolean) {
    setPublishing(true);
    try {
      var updated = await tenantApi.setPublished(published);
      setTenant(updated);
    } finally { setPublishing(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  var b = branding || {} as Branding;
  var primary   = b.primaryColor || '#6366f1';
  var secondary = b.secondaryColor || '#eef2ff';
  var isPublished = tenant?.published || false;

  return (
    <div className="min-h-screen bg-white">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-gray-900 text-white px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={'/' + slug + '/edit'}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to editor
          </Link>
          <span className="text-gray-600">|</span>
          <span className="text-xs text-yellow-400 font-medium">
            Preview mode — candidates cannot see this until you publish
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPublished && (
            <a
              href={'/' + slug + '/careers'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-300 hover:text-white transition-colors"
            >
              View live page
            </a>
          )}
          <Button
            variant={isPublished ? 'secondary' : 'primary'}
            size="sm"
            loading={publishing}
            onClick={function() { handlePublish(!isPublished); }}
          >
            {isPublished ? 'Unpublish' : 'Publish now'}
          </Button>
        </div>
      </div>

      {/* Render the careers page exactly as candidates see it */}
      <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>

        {/* Nav */}
        <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: '44px', zIndex: 20 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {b.logoUrl ? (
                <img src={b.logoUrl} alt={tenant?.name || ''} style={{ height: 28, objectFit: 'contain' }}
                  onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <span style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>{tenant?.name || slug}</span>
              )}
            </div>
            <a href="#preview-jobs" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '8px 18px', borderRadius: 50, border: '2px solid ' + primary, color: primary, textDecoration: 'none' }}>
              Open roles
            </a>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ backgroundColor: secondary }}>
          {b.bannerUrl && (
            <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
              <img src={b.bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
            </div>
          )}
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 16 }}>
              {(tenant?.name || slug) + ' - Careers'}
            </p>
            <h1 style={{ fontWeight: 800, color: primary, fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 20 }}>
              {b.heroHeadline || 'Join our team'}
            </h1>
            <p style={{ color: '#4b5563', fontSize: 18, lineHeight: 1.65, maxWidth: 540, fontWeight: 300 }}>
              {b.heroSubtext || 'We are looking for talented people to join us.'}
            </p>
            {jobs.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: '16px 22px', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>{jobs.length}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Open roles</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px' }}>

          {/* About */}
          {b.about && (
            <div style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 16 }}>About us</p>
              <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.8, fontWeight: 300 }}>{b.about}</p>
            </div>
          )}

          {/* Life at company */}
          {b.lifeAtCompany && (
            <div style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 16 }}>
                {'Life at ' + (tenant?.name || slug)}
              </p>
              <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.8, fontWeight: 300 }}>{b.lifeAtCompany}</p>
            </div>
          )}

          {/* Culture video */}
          {b.cultureVideoUrl && (
            <div style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 16 }}>Our culture</p>
              <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 16, overflow: 'hidden' }}>
                <iframe
                  src={b.cultureVideoUrl}
                  title="Culture video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Jobs */}
          <div id="preview-jobs">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
              <h2 style={{ fontWeight: 800, fontSize: 28, color: '#111' }}>Open positions</h2>
              <span style={{ fontSize: 16, color: '#9ca3af' }}>({jobs.length})</span>
            </div>

            {jobs.length === 0 ? (
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af', fontSize: 14 }}>No published jobs yet. Add jobs from the dashboard.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {jobs.map(function(job) {
                  return (
                    <div key={job._id} style={{ background: '#fff', border: '1.5px solid #eaeaea', borderRadius: 20, padding: '20px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 8, lineHeight: 1.3 }}>{job.title}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                        <span>{job.location}</span>
                        <span>·</span>
                        <span>{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
                        {job.workPolicy && <span style={{ color: '#9ca3af' }}>({job.workPolicy})</span>}
                      </div>
                      {job.salaryRange && (
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>{job.salaryRange}</p>
                      )}
                      {job.tags && job.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {job.tags.slice(0, 3).map(function(tag) {
                            return (
                              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, background: primary + '15', color: primary, fontWeight: 500 }}>
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 72, paddingTop: 28, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13, color: '#9ca3af' }}>
            <span>{'© ' + new Date().getFullYear() + ' ' + (tenant?.name || slug) + '. All rights reserved.'}</span>
            <span>Powered by Careers Builder</span>
          </div>
        </div>
      </div>
    </div>
  );
}

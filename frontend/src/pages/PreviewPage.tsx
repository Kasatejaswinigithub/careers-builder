import React, { useState, useEffect } from 'react'; // Added React for safety
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

  useEffect(() => {
    async function loadData() {
      try {
        const [tenantRes, jobsRes] = await Promise.all([
          tenantApi.get(),
          jobsApi.list({ limit: 100, status: 'published' }),
        ]);
        
        // FIX: Extract data from response objects (usually wrapped in .data)
        const tenantData = tenantRes?.data ?? tenantRes;
        const jobsData = jobsRes?.data ?? jobsRes;

        setBranding(tenantData?.branding || {});
        setJobs(Array.isArray(jobsData) ? jobsData : (jobsData?.data || []));
      } catch (err) {
        console.error("Failed to load preview data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handlePublish(targetStatus: boolean) {
    setPublishing(true);
    try {
      const response = await tenantApi.setPublished(targetStatus);
      // FIX: Ensure you pass the object, not the raw Axios response
      const updatedTenant = response?.data ?? response;
      setTenant(updatedTenant);
    } catch (err) {
      console.error("Publish toggle failed", err);
    } finally { 
      setPublishing(false); 
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  // Type-safe branding access
  const b = branding || {} as Branding;
  const primary   = b.primaryColor || '#6366f1';
  const secondary = b.secondaryColor || '#eef2ff';
  const isPublished = tenant?.published || false;

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
          <span className="text-gray-700">|</span>
          <span className="text-xs text-yellow-400 font-medium">
            Preview mode — candidates cannot see this until you publish
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPublished && (
            <Link
              to={'/' + slug + '/careers'}
              target="_blank"
              className="text-xs text-gray-300 hover:text-white transition-colors mr-2"
            >
              View live page
            </Link>
          )}
          <Button
            variant={isPublished ? 'danger' : 'primary'} // Changed to danger for unpublish clarity
            size="sm"
            loading={publishing}
            onClick={() => handlePublish(!isPublished)}
          >
            {isPublished ? 'Unpublish' : 'Publish now'}
          </Button>
        </div>
      </div>

      {/* Career Page Content */}
      <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
        <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: '44px', zIndex: 20 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {b.logoUrl ? (
                <img src={b.logoUrl} alt={tenant?.name || ''} style={{ height: 28, objectFit: 'contain' }}
                  onError={(e) => { (e.currentTarget.style.display = 'none'); }} />
              ) : (
                <span style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>{tenant?.name || slug}</span>
              )}
            </div>
            <a href="#preview-jobs" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '8px 18px', borderRadius: 50, border: '2px solid ' + primary, color: primary, textDecoration: 'none' }}>
              Open roles
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <div style={{ backgroundColor: secondary }}>
          {b.bannerUrl && (
            <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
              <img src={b.bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget.style.display = 'none'); }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
            </div>
          )}
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 16 }}>
              {(tenant?.name || slug) + ' - Careers'}
            </p>
            <h1 style={{ fontWeight: 800, color: primary, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
              {b.heroHeadline || 'Join our team'}
            </h1>
            <p style={{ color: '#4b5563', fontSize: 17, lineHeight: 1.6, maxWidth: 540, fontWeight: 400 }}>
              {b.heroSubtext || 'We are looking for talented people to join us.'}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px' }}>
          {/* About Section */}
          {b.about && (
            <div style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 16 }}>About us</p>
              <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.8 }}>{b.about}</p>
            </div>
          )}

          {/* Jobs Listing */}
          <div id="preview-jobs">
            <h2 style={{ fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 24 }}>Open positions ({jobs.length})</h2>
            {jobs.length === 0 ? (
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 16, padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af' }}>No published jobs found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {jobs.map((job) => (
                  <div key={job._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{job.title}</h3>
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
                      {job.location} · {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                    </div>
                    {job.tags && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {job.tags.slice(0, 2).map(t => (
                          <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: primary + '10', color: primary, fontWeight: 600 }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
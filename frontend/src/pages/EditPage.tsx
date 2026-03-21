import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tenantApi, jobsApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import { Button, Input, Textarea, ColorPicker, Spinner } from '../components/ui';

interface Branding {
  primaryColor: string; secondaryColor: string; logoUrl: string;
  bannerUrl: string; cultureVideoUrl: string; heroHeadline: string;
  heroSubtext: string; about: string; lifeAtCompany: string;
  website: string; linkedin: string; twitter: string;
}

interface Job {
  _id: string; title: string; location: string; jobType: string;
  status: string; tags: string[]; salaryRange?: string; workPolicy?: string;
}

const EMPTY: Branding = {
  primaryColor: '#6366f1', secondaryColor: '#eef2ff', logoUrl: '', bannerUrl: '',
  cultureVideoUrl: '', heroHeadline: '', heroSubtext: '', about: '',
  lifeAtCompany: '', website: '', linkedin: '', twitter: '',
};

type Section = 'hero' | 'about' | 'life' | 'video' | 'jobs' | 'social';

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'hero',   label: 'Hero banner',       icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'about',  label: 'About us',           icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'life',   label: 'Life at company',    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { key: 'video',  label: 'Culture video',      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { key: 'jobs',   label: 'Job listings',       icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'social', label: 'Social links',       icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
];

export function EditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { tenant, setTenant } = useAuthStore();

  const [form, setForm]         = useState<Branding>(EMPTY);
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('hero');

  useEffect(function() {
    if (tenant && tenant.slug !== slug) {
      navigate('/dashboard');
      return;
    }
    Promise.all([
      tenantApi.get(),
      jobsApi.list({ limit: 100 }),
    ]).then(function(results) {
      var data = results[0];
      var jobData = results[1];
      setForm(Object.assign({}, EMPTY, data.branding || {}));
      setJobs(jobData.data || []);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, [slug]);

  function setField(k: keyof Branding) {
    return function(val: string) {
      setForm(function(f) { return Object.assign({}, f, { [k]: val }); });
    };
  }

  function setInputField(k: keyof Branding) {
    return function(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }); });
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      var updated = await tenantApi.updateBranding(form as unknown as Record<string, string>);
      setTenant(updated);
      setSaved(true);
      setTimeout(function() { setSaved(false); }, 2000);
    } finally { setSaving(false); }
  }

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

  var isPublished = tenant?.published || false;
  var primary = form.primaryColor || '#6366f1';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-gray-900">
            {tenant?.name || slug} - Edit page
          </span>
          {isPublished && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={'/' + slug + '/preview'}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Preview
          </Link>
          <a
            href={'/' + slug + '/careers'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            View live
          </a>
          <Button onClick={handleSave} loading={saving} size="sm">
            {saved ? 'Saved!' : 'Save'}
          </Button>
          <Button
            variant={isPublished ? 'danger' : 'primary'}
            size="sm"
            loading={publishing}
            onClick={function() { handlePublish(!isPublished); }}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Left sidebar - section nav */}
        <div className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Page sections</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {SECTIONS.map(function(sec) {
              return (
                <button
                  key={sec.key}
                  onClick={function() { setActiveSection(sec.key); }}
                  className={'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ' + (activeSection === sec.key ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={sec.icon} />
                  </svg>
                  {sec.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto p-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 space-y-1">
              <p>Public URL:</p>
              <a href={'/' + slug + '/careers'} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline break-all">
                {'/' + slug + '/careers'}
              </a>
            </div>
          </div>
        </div>

        {/* Center - editor panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6">

            {activeSection === 'hero' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Hero banner</h2>
                  <p className="text-sm text-gray-500 mb-4">The first thing candidates see on your careers page.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker label="Primary color" value={form.primaryColor} onChange={setField('primaryColor')} />
                  <ColorPicker label="Background color" value={form.secondaryColor} onChange={setField('secondaryColor')} />
                </div>
                <Input label="Logo URL" value={form.logoUrl} onChange={setInputField('logoUrl')} placeholder="https://example.com/logo.png" />
                <Input label="Banner image URL" value={form.bannerUrl} onChange={setInputField('bannerUrl')} placeholder="https://example.com/banner.jpg" />
                <Input label="Headline" value={form.heroHeadline} onChange={setInputField('heroHeadline')} placeholder="Build the future with us" />
                <Textarea label="Subtext" value={form.heroSubtext} onChange={setInputField('heroSubtext')} rows={2} placeholder="Join our team and make an impact." />

                {/* Live mini preview */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
                  <p className="text-xs text-gray-400 bg-gray-50 border-b border-gray-200 px-3 py-2">Preview</p>
                  <div className="p-6" style={{ backgroundColor: form.secondaryColor || '#eef2ff' }}>
                    {form.bannerUrl && (
                      <img src={form.bannerUrl} alt="Banner" className="w-full h-24 object-cover rounded-lg mb-4"
                        onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      {form.logoUrl && (
                        <img src={form.logoUrl} alt="Logo" className="h-8 object-contain"
                          onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      <h3 className="text-lg font-extrabold" style={{ color: form.primaryColor }}>
                        {form.heroHeadline || 'Your headline here'}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{form.heroSubtext || 'Your subtext here'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'about' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">About us</h2>
                  <p className="text-sm text-gray-500 mb-4">Tell candidates about your company, mission and values.</p>
                </div>
                <Textarea
                  label="About the company"
                  value={form.about}
                  onChange={setInputField('about')}
                  rows={8}
                  placeholder="We are a fast-growing technology company building products that matter. Founded in 2019..."
                />
              </div>
            )}

            {activeSection === 'life' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Life at company</h2>
                  <p className="text-sm text-gray-500 mb-4">Describe your culture, benefits and working style.</p>
                </div>
                <Textarea
                  label="Life at the company"
                  value={form.lifeAtCompany}
                  onChange={setInputField('lifeAtCompany')}
                  rows={8}
                  placeholder="We believe in async-first communication, generous PTO, and continuous learning..."
                />
              </div>
            )}

            {activeSection === 'video' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Culture video</h2>
                  <p className="text-sm text-gray-500 mb-4">Embed a YouTube or Vimeo video to showcase your culture.</p>
                </div>
                <div>
                  <Input
                    label="Video embed URL"
                    value={form.cultureVideoUrl}
                    onChange={setInputField('cultureVideoUrl')}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    On YouTube: Share → Embed → copy the src URL (starts with https://www.youtube.com/embed/)
                  </p>
                </div>
                {form.cultureVideoUrl && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <p className="text-xs text-gray-400 bg-gray-50 border-b border-gray-200 px-3 py-2">Preview</p>
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={form.cultureVideoUrl}
                        title="Culture video preview"
                        className="absolute top-0 left-0 w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'jobs' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Job listings</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {'Your published jobs appear here automatically. ' + jobs.filter(function(j) { return j.status === 'published'; }).length + ' of ' + jobs.length + ' jobs are published.'}
                  </p>
                </div>
                <Link
                  to="/dashboard/jobs"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: primary }}
                >
                  Manage jobs
                </Link>
                <div className="space-y-2 mt-2">
                  {jobs.slice(0, 8).map(function(job) {
                    return (
                      <div key={job._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-400">{job.location + ' · ' + job.jobType}</p>
                        </div>
                        <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                          {job.status}
                        </span>
                      </div>
                    );
                  })}
                  {jobs.length > 8 && (
                    <p className="text-xs text-gray-400 text-center pt-2">
                      {'+' + (jobs.length - 8) + ' more jobs'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'social' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Social links</h2>
                  <p className="text-sm text-gray-500 mb-4">Links shown in the footer of your careers page.</p>
                </div>
                <Input label="Website" value={form.website} onChange={setInputField('website')} placeholder="https://yourcompany.com" />
                <Input label="LinkedIn" value={form.linkedin} onChange={setInputField('linkedin')} placeholder="https://linkedin.com/company/yourcompany" />
                <Input label="Twitter / X" value={form.twitter} onChange={setInputField('twitter')} placeholder="https://twitter.com/yourcompany" />
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              <Button onClick={handleSave} loading={saving} size="lg">
                {saved ? 'Saved!' : 'Save changes'}
              </Button>
              {saved && <span className="text-sm text-green-600">Changes saved</span>}
            </div>
          </div>
        </div>

        {/* Right panel - live preview strip */}
        <div className="hidden xl:flex w-96 border-l border-gray-200 bg-white flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Live preview</p>
            <Link
              to={'/' + slug + '/preview'}
              className="text-xs text-indigo-600 hover:underline"
            >
              Full preview
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div style={{ backgroundColor: form.secondaryColor || '#eef2ff', padding: '24px 16px' }}>
              {form.bannerUrl && (
                <img src={form.bannerUrl} alt="Banner" className="w-full h-20 object-cover rounded-lg mb-3"
                  onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              {form.logoUrl && (
                <img src={form.logoUrl} alt="Logo" className="h-6 object-contain mb-2"
                  onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <h3 className="text-base font-extrabold mb-1" style={{ color: form.primaryColor }}>
                {form.heroHeadline || 'Your headline'}
              </h3>
              <p className="text-xs text-gray-600 mb-3">{form.heroSubtext || 'Your subtext'}</p>
            </div>
            {form.about && (
              <div className="px-4 py-4 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: form.primaryColor }}>About us</p>
                <p className="text-xs text-gray-600 line-clamp-4">{form.about}</p>
              </div>
            )}
            <div className="px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: form.primaryColor }}>Open roles</p>
              {jobs.filter(function(j) { return j.status === 'published'; }).slice(0, 4).map(function(job) {
                return (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-2.5 mb-2">
                    <p className="text-xs font-semibold text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.location}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

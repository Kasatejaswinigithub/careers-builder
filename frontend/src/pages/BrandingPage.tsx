import React, { useState, useEffect } from 'react';
import { tenantApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import { Button, Input, Textarea, ColorPicker, Spinner } from '../components/ui';

interface Branding {
  [key: string]: string; 
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

const EMPTY: Branding = {
  primaryColor: '#6366f1',
  secondaryColor: '#ffffff', // Changed to white as a safer default
  logoUrl: '',
  bannerUrl: '',
  cultureVideoUrl: '',
  heroHeadline: '',
  heroSubtext: '',
  about: '',
  lifeAtCompany: '',
  website: '',
  linkedin: '',
  twitter: '',
};

export function BrandingPage() {
  const { tenant, setTenant } = useAuthStore();
  const [form, setForm] = useState<Branding>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await tenantApi.get();
        const tenantData = response?.data ?? response;
        setForm({
          ...EMPTY,
          ...(tenantData?.branding || {}),
        });
      } catch (error) {
        console.error('Failed to load branding:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBranding();
  }, []);

  // Fixed the type-safe field setter
  const setField = (key: keyof Branding) => (value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const setInputField = (key: keyof Branding) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const response = await tenantApi.updateBranding({ ...form });
      const updatedTenant = response?.data ?? response;
      setTenant(updatedTenant);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save branding:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(published: boolean) {
    setPublishing(true);
    try {
      const response = await tenantApi.setPublished(published);
      const updatedTenant = response?.data ?? response;
      setTenant(updatedTenant);
    } catch (error) {
      console.error('Failed to update publish status:', error);
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const isPublished = tenant?.published ?? false;
  const slug = tenant?.slug ?? '';
  const careersPageUrl = slug ? `/${slug}/careers` : '/careers';

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Branding</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize how candidates see your company
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setPreview(!preview)}>
            {preview ? 'Close Preview' : 'Show Preview'}
          </Button>
          <a
            href={careersPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Live Site
          </a>
          <Button
            variant={isPublished ? 'danger' : 'primary'}
            size="sm"
            onClick={() => handlePublish(!isPublished)}
            loading={publishing}
          >
            {isPublished ? 'Unpublish' : 'Go Live'}
          </Button>
        </div>
      </div>

      {isPublished && (
        <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-500">
          <div className="bg-indigo-500 rounded-full p-1 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-sm text-indigo-900">
            <span className="font-semibold">Page is live:</span>{' '}
            <a href={careersPageUrl} target="_blank" rel="noopener noreferrer" className="underline opacity-80 hover:opacity-100">
              {window.location.origin}{careersPageUrl}
            </a>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="mb-10 border border-gray-200 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Preview</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
          </div>

          <div className="p-0" style={{ backgroundColor: form.secondaryColor }}>
            {form.bannerUrl && (
              <div className="h-32 sm:h-48 w-full bg-gray-200 relative overflow-hidden">
                <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="h-12 w-12 object-contain rounded-lg bg-white shadow-sm p-1" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">?</div>
                )}
                <div>
                  <h2 className="text-xl font-bold" style={{ color: form.primaryColor }}>
                    {form.heroHeadline || 'Your Company Headline'}
                  </h2>
                  <p className="text-sm text-gray-600">{form.heroSubtext || 'Subtext appears here'}</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600">
                {form.about || 'Start typing below to see your company description here...'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Colors */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900">Brand Identity</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ColorPicker label="Primary Brand Color" value={form.primaryColor} onChange={setField('primaryColor')} />
            <ColorPicker label="Page Background" value={form.secondaryColor} onChange={setField('secondaryColor')} />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Visuals</h2>
          <Input label="Logo URL" value={form.logoUrl} onChange={setInputField('logoUrl')} placeholder="https://..." />
          <Input label="Banner Image URL" value={form.bannerUrl} onChange={setInputField('bannerUrl')} placeholder="https://..." />
          <div>
            <Input label="Culture Video (Embed URL)" value={form.cultureVideoUrl} onChange={setInputField('cultureVideoUrl')} placeholder="https://youtube.com/embed/..." />
            <p className="text-[10px] text-gray-400 mt-1.5 italic">Use the "Embed" link from YouTube/Vimeo</p>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Hero Content</h2>
          <Input label="Headline" value={form.heroHeadline} onChange={setInputField('heroHeadline')} placeholder="Build the future with us" />
          <Textarea label="Subtext" value={form.heroSubtext} onChange={setInputField('heroSubtext')} rows={2} />
        </div>

        {/* Sections */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">About Us</h2>
          <Textarea label="The Company" value={form.about} onChange={setInputField('about')} rows={5} placeholder="Mission, values, and history..." />
          <Textarea label="Life at Company" value={form.lifeAtCompany} onChange={setInputField('lifeAtCompany')} rows={4} placeholder="Culture, benefits, and office life..." />
        </div>

        {/* Social */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Online Presence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Website" value={form.website} onChange={setInputField('website')} placeholder="https://..." />
            <Input label="LinkedIn" value={form.linkedin} onChange={setInputField('linkedin')} placeholder="https://..." />
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <Button onClick={handleSave} loading={saving} size="lg" className="min-w-[140px]">
            {saved ? 'Saved Successfully' : 'Save Changes'}
          </Button>
          {saved && (
            <span className="text-sm font-medium text-green-600 animate-in fade-in slide-in-from-left-2">
              All updates are saved.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
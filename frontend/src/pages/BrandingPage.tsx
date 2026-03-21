import { useState, useEffect } from 'react';
import { tenantApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import { Button, Input, Textarea, ColorPicker, Spinner } from '../components/ui';

interface Branding {
  [key: string]: string;   // ✅ ADD THIS LINE

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
  secondaryColor: '#eef2ff',
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

  function setField(key: keyof Branding) {
    return function (value: string) {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    };
  }

  function setInputField(key: keyof Branding) {
    return function (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
const response = await tenantApi.updateBranding({ ...form });
      const updatedTenant = response?.data ?? response;

      setTenant(updatedTenant);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
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
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  const isPublished = tenant?.published ?? false;
  const slug = tenant?.slug ?? '';
  const careersPageUrl = slug ? `/${slug}/careers` : '/careers';

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Branding</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Customize your public careers page
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
          >
            {preview ? 'Hide preview' : 'Preview'}
          </button>

          <a
            href={careersPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
          >
            View live page
          </a>

          <Button
            variant={isPublished ? 'danger' : 'primary'}
            onClick={() => handlePublish(!isPublished)}
            loading={publishing}
          >
            {isPublished ? 'Unpublish' : 'Publish page'}
          </Button>
        </div>
      </div>

      {isPublished && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Your careers page is live at</span>
          <a
            href={careersPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            {careersPageUrl}
          </a>
        </div>
      )}

      {preview && (
        <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
            Preview
          </div>

          <div
            className="p-6"
            style={{ backgroundColor: form.secondaryColor || '#eef2ff' }}
          >
            {form.bannerUrl && (
              <img
                src={form.bannerUrl}
                alt="Banner"
                className="w-full h-32 object-cover rounded-lg mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}

            <div className="flex items-center gap-3 mb-4">
              {form.logoUrl && (
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="h-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: form.primaryColor }}
                >
                  {form.heroHeadline || 'Join our team'}
                </h2>
                <p className="text-sm text-gray-600">
                  {form.heroSubtext || 'We are hiring!'}
                </p>
              </div>
            </div>

            {form.about && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {form.about}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Brand colors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPicker
              label="Primary color"
              value={form.primaryColor}
              onChange={setField('primaryColor')}
            />
            <ColorPicker
              label="Background color"
              value={form.secondaryColor}
              onChange={setField('secondaryColor')}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Media</h2>
          <div className="space-y-4">
            <Input
              label="Logo URL"
              value={form.logoUrl}
              onChange={setInputField('logoUrl')}
              placeholder="https://example.com/logo.png"
            />

            <Input
              label="Banner image URL"
              value={form.bannerUrl}
              onChange={setInputField('bannerUrl')}
              placeholder="https://example.com/banner.jpg"
            />

            <div>
              <Input
                label="Culture video URL (YouTube or Vimeo)"
                value={form.cultureVideoUrl}
                onChange={setInputField('cultureVideoUrl')}
                placeholder="https://youtube.com/embed/..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Use the embed URL from YouTube. Go to Share then Embed and copy
                the src URL.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Hero section
          </h2>
          <div className="space-y-4">
            <Input
              label="Headline"
              value={form.heroHeadline}
              onChange={setInputField('heroHeadline')}
              placeholder="Build the future with us"
            />
            <Textarea
              label="Subtext"
              value={form.heroSubtext}
              onChange={setInputField('heroSubtext')}
              rows={2}
              placeholder="Join our team and make an impact."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            About sections
          </h2>
          <div className="space-y-4">
            <Textarea
              label="About the company"
              value={form.about}
              onChange={setInputField('about')}
              rows={5}
              placeholder="Tell candidates about your company, mission, and values..."
            />
            <Textarea
              label="Life at the company"
              value={form.lifeAtCompany}
              onChange={setInputField('lifeAtCompany')}
              rows={4}
              placeholder="Describe culture, benefits, working style..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Social links
          </h2>
          <div className="space-y-4">
            <Input
              label="Website"
              value={form.website}
              onChange={setInputField('website')}
              placeholder="https://yourcompany.com"
            />
            <Input
              label="LinkedIn"
              value={form.linkedin}
              onChange={setInputField('linkedin')}
              placeholder="https://linkedin.com/company/yourcompany"
            />
            <Input
              label="Twitter / X"
              value={form.twitter}
              onChange={setInputField('twitter')}
              placeholder="https://twitter.com/yourcompany"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={saving} size="lg">
            {saved ? 'Saved!' : 'Save changes'}
          </Button>
          {saved && (
            <span className="text-sm text-green-600">
              Changes saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
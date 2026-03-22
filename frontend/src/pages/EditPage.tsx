import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tenantApi, jobsApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import { Button, Input, Textarea, ColorPicker, Spinner } from '../components/ui';
import { BrandingDTO } from '../../../shared/types';

// --- Interfaces ---
interface Branding extends BrandingDTO {}

interface Job {
  _id: string; 
  title: string; 
  location: string; 
  jobType: string;
  status: string; 
  tags: string[]; 
}

type Section = 'hero' | 'about' | 'life' | 'video' | 'jobs' | 'social';

// --- Constants ---
const EMPTY_BRANDING: Branding = {
  primaryColor: '#6366f1', secondaryColor: '#ffffff', logoUrl: '', bannerUrl: '',
  cultureVideoUrl: '', heroHeadline: '', heroSubtext: '', about: '',
  lifeAtCompany: '', website: '', linkedin: '', twitter: '',
};

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'hero',   label: 'Hero',       icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'about',  label: 'About',      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'life',   label: 'Culture',    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { key: 'video',  label: 'Video',      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'jobs',   label: 'Jobs',       icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'social', label: 'Social',     icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
];

export function EditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { tenant, setTenant } = useAuthStore();

  const [brandingData, setBrandingData] = useState<Branding>(EMPTY_BRANDING);
  const [, setJobs]                     = useState<Job[]>([]); // Prefixed with _ if unused
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [publishing, setPublishing]     = useState(false);
  const [saved, setSaved]               = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('hero');

  // Memoized load function to prevent re-render loops
  const loadData = useCallback(async () => {
    try {
      const [tenantRes, jobsRes] = await Promise.all([
        tenantApi.get(),
        jobsApi.list({ limit: 100 })
      ]);
      
      const tData = tenantRes?.data ?? tenantRes;
      const jData = jobsRes?.data ?? jobsRes;

      setBrandingData({ ...EMPTY_BRANDING, ...(tData?.branding || {}) });
      setJobs(Array.isArray(jData) ? jData : (jData?.data || []));
    } catch (err) {
      console.error("Failed to load editor data", err);
    } finally {
      setLoading(false);
    }
  }, [setTenant]); // Added setTenant to satisfy linter

  useEffect(() => {
    if (tenant && tenant.slug !== slug) { 
      navigate('/dashboard'); 
      return; 
    }
    loadData();
  }, [slug, tenant, navigate, loadData]);

  // Handler for direct string values (ColorPicker)
  const handleValueChange = (k: keyof Branding) => (val: string) => 
    setBrandingData(prev => ({ ...prev, [k]: val }));

  // Handler for Event-based values (Inputs/Textarea)
  const handleInputChange = (k: keyof Branding) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setBrandingData(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    try {
      const response = await tenantApi.updateBranding({ ...brandingData });
      setTenant(response?.data ?? response);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(targetStatus: boolean) {
    setPublishing(true);
    try {
      const response = await tenantApi.setPublished(targetStatus);
      setTenant(response?.data ?? response);
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Spinner size="lg" />
    </div>
  );

  const isPublished = tenant?.published || false;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="truncate">
            <h1 className="text-sm font-black text-gray-900 truncate leading-tight">
              {tenant?.name || 'Company Profile'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Editor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} loading={saving} size="sm" className="hidden sm:inline-flex px-6">
            {saved ? 'Saved!' : 'Save'}
          </Button>
          <Button
            variant={isPublished ? 'danger' : 'primary'}
            size="sm"
            loading={publishing}
            onClick={() => handlePublish(!isPublished)}
          >
            {isPublished ? 'Unpublish' : 'Go Live'}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
          <nav className="p-4 space-y-1">
            {SECTIONS.map((sec) => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeSection === sec.key 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={sec.icon} />
                </svg>
                {sec.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-3xl mx-auto w-full p-6 pb-40 md:pb-12">
            
            {activeSection === 'hero' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-black text-gray-900">Hero Section</h2>
                <Input label="Headline" value={brandingData.heroHeadline} onChange={handleInputChange('heroHeadline')} />
                <Textarea label="Subtext" value={brandingData.heroSubtext} onChange={handleInputChange('heroSubtext')} rows={3} />
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker label="Primary Color" value={brandingData.primaryColor} onChange={handleValueChange('primaryColor')} />
                  <ColorPicker label="Background" value={brandingData.secondaryColor} onChange={handleValueChange('secondaryColor')} />
                </div>
                <Input label="Logo URL" value={brandingData.logoUrl} onChange={handleInputChange('logoUrl')} />
                <Input label="Banner Image URL" value={brandingData.bannerUrl} onChange={handleInputChange('bannerUrl')} />
              </div>
            )}

            {activeSection === 'about' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-black text-gray-900">About Us</h2>
                <Textarea label="Company Bio" value={brandingData.about} onChange={handleInputChange('about')} rows={10} />
              </div>
            )}

            {activeSection === 'social' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-black text-gray-900">Social Links</h2>
                <Input label="Website" value={brandingData.website} onChange={handleInputChange('website')} />
                <Input label="LinkedIn" value={brandingData.linkedin} onChange={handleInputChange('linkedin')} />
                <Input label="Twitter / X" value={brandingData.twitter} onChange={handleInputChange('twitter')} />
              </div>
            )}

            <div className="hidden md:flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
               <div className="flex items-center gap-3">
                 <Button onClick={handleSave} loading={saving} size="lg" className="px-10">
                   {saved ? 'Changes Saved!' : 'Save Changes'}
                 </Button>
               </div>
               <Link to={`/${slug}/preview`} className="text-sm font-bold text-gray-400 hover:text-indigo-600">
                 Full Preview →
               </Link>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-6 left-6 right-6 md:hidden z-40">
        <Button onClick={handleSave} loading={saving} size="lg" className="w-full shadow-2xl h-14 text-base font-black">
          {saved ? '✓ Updated' : 'Update Page'}
        </Button>
      </div>
    </div>
  );
}
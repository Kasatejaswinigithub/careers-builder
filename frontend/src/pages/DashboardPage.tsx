import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { jobsApi } from '../api';
import { Badge } from '../components/ui';

interface Job { _id: string; title: string; location: string; status: string; jobType: string; }

export function DashboardPage() {
  const { tenant } = useAuthStore();
  const [jobs, setJobs]   = useState<Job[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(function() {
    jobsApi.list({ limit: 5 }).then(function(data) {
      setJobs(data.data || []);
      setTotal(data.total || 0);
    }).catch(function() {});
  }, []);

  const published = jobs.filter(j => j.status === 'published').length;
  const drafts    = jobs.filter(j => j.status === 'draft').length;
  const primary   = tenant?.branding?.primaryColor || '#6366f1';
  const slug      = tenant?.slug || '';
  const isPublished = tenant?.published || false;

  return (
    // Changed p-8 to p-4 sm:p-8 for better mobile margins
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {'Welcome back' + (tenant?.name ? ', ' + tenant.name : '')}
        </h1>
        <p className="text-gray-500 mt-1 text-sm italic">Summary of your careers workspace</p>
      </div>

      {/* Published status banner - Stack on mobile */}
      {!isPublished && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm text-amber-800 font-medium">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Your page is offline
          </div>
          <Link to={'/' + slug + '/edit'} className="text-xs font-bold text-amber-900 underline underline-offset-4 decoration-amber-300">
            Publish now →
          </Link>
        </div>
      )}

      {isPublished && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Careers page is live
          </div>
          <a href={'/' + slug + '/careers'} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 truncate underline decoration-emerald-200">
            {window.location.origin}/{slug}/careers
          </a>
        </div>
      )}

      {/* Stats - Grid handles mobile automatically */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Jobs</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Published</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{published}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Drafts</p>
          <p className="text-3xl font-black text-amber-500 mt-2">{drafts}</p>
        </div>
      </div>

      {/* Quick actions - Improved for touch targets */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Actions</h2>
        <div className="grid grid-cols-2 sm:flex gap-3">
          <Link
            to={'/' + slug + '/edit'}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-transform active:scale-95"
            style={{ backgroundColor: primary }}
          >
            Edit
          </Link>
          <Link
            to="/dashboard/jobs"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 transition-transform active:scale-95"
          >
            + New Job
          </Link>
          <Link
            to={'/' + slug + '/preview'}
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200"
          >
            Preview
          </Link>
        </div>
      </div>

      {/* Share link - Simplified for mobile */}
      {isPublished && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Share Page</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-gray-500 font-mono truncate">
              {window.location.origin}/{slug}/careers
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.origin + '/' + slug + '/careers')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Recent jobs - Improved spacing */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
          <Link to="/dashboard/jobs" className="text-xs font-bold text-indigo-600">See All</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {jobs.map((job) => (
            <div key={job._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-bold text-gray-900 truncate">{job.title}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{job.location}</p>
              </div>
              <Badge color={job.status === 'published' ? 'green' : job.status === 'draft' ? 'yellow' : 'gray'}>
                {job.status}
              </Badge>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400">No active job listings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
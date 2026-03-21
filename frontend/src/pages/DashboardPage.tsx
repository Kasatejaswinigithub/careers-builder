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

  var published = jobs.filter(function(j) { return j.status === 'published'; }).length;
  var drafts    = jobs.filter(function(j) { return j.status === 'draft'; }).length;
  var primary   = tenant?.branding?.primaryColor || '#6366f1';
  var slug      = tenant?.slug || '';
  var isPublished = tenant?.published || false;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {'Welcome back' + (tenant?.name ? ', ' + tenant.name : '')}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here is a summary of your careers workspace.</p>
      </div>

      {/* Published status banner */}
      {!isPublished && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Your careers page is not published yet. Candidates cannot see it.
          </div>
          <Link
            to={'/' + slug + '/edit'}
            className="text-xs font-semibold text-yellow-800 underline whitespace-nowrap"
          >
            Edit and publish
          </Link>
        </div>
      )}

      {isPublished && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your careers page is live at
            <a href={'/' + slug + '/careers'} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              {'/' + slug + '/careers'}
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total jobs</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-3xl font-semibold text-green-600 mt-1">{published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-3xl font-semibold text-yellow-600 mt-1">{drafts}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            to={'/' + slug + '/edit'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{ backgroundColor: primary }}
          >
            Edit page
          </Link>
          <Link
            to={'/' + slug + '/preview'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
          >
            Preview page
          </Link>
          <Link
            to="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
          >
            + New job
          </Link>
          <a
            href={'/' + slug + '/careers'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
          >
            View live page
          </a>
        </div>
      </div>

      {/* Share link */}
      {isPublished && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Share your careers page</h2>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-mono">
              {window.location.origin + '/' + slug + '/careers'}
            </div>
            <button
              onClick={function() {
                navigator.clipboard.writeText(window.location.origin + '/' + slug + '/careers');
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all whitespace-nowrap"
            >
              Copy link
            </button>
          </div>
        </div>
      )}

      {/* Recent jobs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent jobs</h2>
          <Link to="/dashboard/jobs" className="text-xs text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {jobs.map(function(job) {
            return (
              <div key={job._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.location}</p>
                </div>
                <Badge color={job.status === 'published' ? 'green' : job.status === 'draft' ? 'yellow' : 'gray'}>
                  {job.status}
                </Badge>
              </div>
            );
          })}
          {jobs.length === 0 && (
            <p className="px-5 py-8 text-sm text-center text-gray-400">No jobs yet. Create your first one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

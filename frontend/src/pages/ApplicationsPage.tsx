import { useState, useEffect } from 'react';
import { applicationsApi } from '../api';
import { Badge, Select, Spinner, EmptyState } from '../components/ui';

interface Application {
  _id: string;
  applicant: { name: string; email: string; phone?: string; };
  status: string;
  createdAt: string;
  jobId: { title?: string; location?: string; } | string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];

function statusColor(s: string): 'blue' | 'yellow' | 'purple' | 'red' | 'green' | 'gray' {
  const map: Record<string, 'blue' | 'yellow' | 'purple' | 'red' | 'green' | 'gray'> = {
    new: 'blue', reviewing: 'yellow', shortlisted: 'purple', rejected: 'red', hired: 'green',
  };
  return map[s] || 'gray';
}

export function ApplicationsPage() {
  const [apps, setApps]       = useState<Application[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const data = await applicationsApi.list(params);
      setApps(data.data || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }

  useEffect(function() { load(); }, [statusFilter]);

  async function updateStatus(id: string, status: string) {
    await applicationsApi.updateStatus(id, status);
    load();
  }

  function getJobTitle(jobId: Application['jobId']): string {
    if (typeof jobId === 'object' && jobId && 'title' in jobId) return jobId.title || 'Unknown';
    return 'Unknown';
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header section - stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500">{total} total applicants</p>
        </div>
        <div className="w-full sm:w-48">
          <Select 
            options={STATUS_OPTIONS} 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="No applications found" description="Try changing your status filter or wait for new candidates." />
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Card List (Hidden on Desktop) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {apps.map((app) => (
              <div key={app._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{app.applicant.name}</p>
                    <p className="text-xs text-gray-500 truncate">{app.applicant.email}</p>
                  </div>
                  <Badge color={statusColor(app.status)}>{app.status}</Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Job:</span>
                    <span className="text-gray-700 font-medium">{getJobTitle(app.jobId)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-gray-700">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-semibold">Update Status</p>
                  <Select
                    options={STATUS_OPTIONS.filter(o => o.value !== '')}
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className="w-full py-1.5 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Table (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{app.applicant.name}</p>
                      <p className="text-xs text-gray-400">{app.applicant.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getJobTitle(app.jobId)}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge color={statusColor(app.status)}>{app.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Select
                        options={STATUS_OPTIONS.filter(o => o.value !== '')}
                        value={app.status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                        className="w-32 ml-auto py-1 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
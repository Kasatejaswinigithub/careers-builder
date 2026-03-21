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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
        <div className="w-44">
          <Select options={STATUS_OPTIONS} value={statusFilter} onChange={function(e) { setStatusFilter(e.target.value); }} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : apps.length === 0 ? (
          <EmptyState title="No applications yet" description="Applications will appear here once candidates apply." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Candidate</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Job</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Applied</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Move to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apps.map(function(app) {
                  return (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{app.applicant.name}</p>
                        <p className="text-xs text-gray-400">{app.applicant.email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{getJobTitle(app.jobId)}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3"><Badge color={statusColor(app.status)}>{app.status}</Badge></td>
                      <td className="px-5 py-3">
                        <Select
                          options={STATUS_OPTIONS.filter(function(o) { return o.value !== ''; })}
                          value={app.status}
                          onChange={function(e) { updateStatus(app._id, e.target.value); }}
                          className="w-36 py-1 text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

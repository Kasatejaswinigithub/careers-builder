import React, { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '../api';
import { Button, Input, Textarea, Select, Badge, Modal, EmptyState, Spinner } from '../components/ui';

interface Job { 
  _id: string; title: string; description: string; location: string; 
  jobType: string; status: string; tags: string[]; 
  salaryMin?: number; salaryMax?: number; 
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

const TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

const EMPTY_FORM = { 
  title: '', description: '', location: 'Remote', 
  jobType: 'full-time', status: 'draft', tags: '', 
  salaryMin: '', salaryMax: '' 
};

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await jobsApi.list();
      const data = response?.data ?? response;
      setJobs(Array.isArray(data) ? data : (data?.data || []));
      setTotal(data?.total || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.error("Load failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (k: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      };
      if (editing) {
        await jobsApi.update(editing._id, payload);
      } else {
        await jobsApi.create(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await jobsApi.remove(id);
      load();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const statusColor = (s: string) => {
    if (s === 'published') return 'green';
    if (s === 'draft') return 'yellow';
    return 'gray';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500">{total} total listings</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); }}>
          + New Job
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs found" description="Create a job to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                    <td className="px-6 py-4 text-gray-500">{job.location}</td>
                    <td className="px-6 py-4">
                      {/* Fixed: Wrapped Badge to handle 'className' and cast color to 'any' */}
                      <span className="capitalize">
                        <Badge color={statusColor(job.status) as any}>
                          {job.status}
                        </Badge>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditing(job);
                          setForm({
                            title: job.title,
                            description: job.description,
                            location: job.location,
                            jobType: job.jobType,
                            status: job.status,
                            tags: job.tags.join(', '),
                            salaryMin: job.salaryMin?.toString() || '',
                            salaryMax: job.salaryMax?.toString() || '',
                          });
                          setModalOpen(true);
                        }}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(job._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Job' : 'New Job'}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Input label="Title" value={form.title} onChange={setField('title')} required />
          <Textarea label="Description" value={form.description} onChange={setField('description')} rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={form.location} onChange={setField('location')} />
            <Select label="Type" value={form.jobType} onChange={setField('jobType')} options={TYPE_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Salary Min" type="number" value={form.salaryMin} onChange={setField('salaryMin')} />
            <Input label="Salary Max" type="number" value={form.salaryMax} onChange={setField('salaryMax')} />
          </div>
          <Input label="Tags (comma separated)" value={form.tags} onChange={setField('tags')} />
          <Select label="Status" value={form.status} onChange={setField('status')} options={STATUS_OPTIONS} />
        </div>
      </Modal>
    </div>
  );
}
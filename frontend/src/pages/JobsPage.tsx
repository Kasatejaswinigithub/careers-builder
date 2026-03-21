import { useState, useEffect } from 'react';
import { jobsApi } from '../api';
import { Button, Input, Textarea, Select, Badge, Modal, EmptyState, Spinner } from '../components/ui';

interface Job { _id: string; title: string; description: string; location: string; jobType: string; status: string; tags: string[]; salaryMin?: number; salaryMax?: number; }

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

function statusColor(s: string): 'green' | 'yellow' | 'gray' {
  if (s === 'published') return 'green';
  if (s === 'draft') return 'yellow';
  return 'gray';
}

const EMPTY_FORM = { title: '', description: '', location: 'Remote', jobType: 'full-time', status: 'draft', tags: '', salaryMin: '', salaryMax: '' };

export function JobsPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    try {
      const data = await jobsApi.list();
      setJobs(data.data || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }

  useEffect(function() { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(job: Job) {
    setEditing(job);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      jobType: job.jobType,
      status: job.status,
      tags: job.tags.join(', '),
      salaryMin: job.salaryMin ? String(job.salaryMin) : '',
      salaryMax: job.salaryMax ? String(job.salaryMax) : '',
    });
    setModalOpen(true);
  }

  function setField(k: string) {
    return function(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
      setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }); });
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        jobType: form.jobType,
        status: form.status,
        tags: form.tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean),
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
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job?')) return;
    await jobsApi.remove(id);
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
        <Button onClick={openNew}>+ New job</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs yet" description="Create your first job posting." action={<Button onClick={openNew}>+ New job</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Title</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Location</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Type</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map(function(job) {
                  return (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{job.title}</td>
                      <td className="px-5 py-3 text-gray-500">{job.location}</td>
                      <td className="px-5 py-3 text-gray-500 capitalize">{job.jobType}</td>
                      <td className="px-5 py-3"><Badge color={statusColor(job.status)}>{job.status}</Badge></td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={function() { openEdit(job); }}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={function() { handleDelete(job._id); }}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={function() { setModalOpen(false); }}
        title={editing ? 'Edit job' : 'New job'}
        footer={
          <>
            <Button variant="secondary" onClick={function() { setModalOpen(false); }}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save changes' : 'Create job'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Job title" value={form.title} onChange={setField('title')} placeholder="Senior Frontend Engineer" required />
          <Textarea label="Description" value={form.description} onChange={setField('description')} rows={5} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" value={form.location} onChange={setField('location')} placeholder="Remote" />
            <Select label="Job type" value={form.jobType} onChange={setField('jobType')} options={TYPE_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Salary min" type="number" value={form.salaryMin} onChange={setField('salaryMin')} placeholder="80000" />
            <Input label="Salary max" type="number" value={form.salaryMax} onChange={setField('salaryMax')} placeholder="120000" />
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={setField('tags')} placeholder="React, TypeScript" />
          <Select label="Status" value={form.status} onChange={setField('status')} options={STATUS_OPTIONS} />
        </div>
      </Modal>
    </div>
  );
}

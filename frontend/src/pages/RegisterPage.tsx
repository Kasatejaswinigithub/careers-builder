import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button, Input } from '../components/ui';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ tenantName: '', slug: '', email: '', password: '' });
  const [error, setError] = useState('');

  function setField(k: string) {
    return function(e: React.ChangeEvent<HTMLInputElement>) {
      setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }); });
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(form.tenantName, form.slug, form.email, form.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">C</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Create your workspace</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Company name" placeholder="Acme Inc." value={form.tenantName} onChange={setField('tenantName')} required />
            <Input label="Workspace slug" placeholder="acme" value={form.slug} onChange={setField('slug')} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={setField('email')} required />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={setField('password')} minLength={8} required />
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={loading}>Create workspace</Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have a workspace?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

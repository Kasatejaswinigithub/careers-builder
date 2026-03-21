import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button, Input } from '../components/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', tenantSlug: '' });
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
      await login(form.email, form.password, form.tenantSlug);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || msg);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">C</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Sign in to your workspace</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Workspace slug" placeholder="acme" value={form.tenantSlug} onChange={setField('tenantSlug')} required autoFocus />
            <Input label="Email" type="email" placeholder="admin@acme.com" value={form.email} onChange={setField('email')} required />
            <Input label="Password" type="password" placeholder="password" value={form.password} onChange={setField('password')} required />
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">Create workspace</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-3">
          Demo: slug <strong>acme</strong> / admin@acme.com / password123
        </p>
      </div>
    </div>
  );
}

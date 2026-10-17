'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (d.ok) router.push('/');
      else setError(d.error || 'Invalid credentials');
    } catch {
      setError('Login failed — check your connection');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <form onSubmit={login} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-amber-400 text-2xl">⚙️</span>
          <h1 className="text-2xl font-bold text-amber-400">O&G Operations Portal</h1>
        </div>
        {error && <div className="bg-red-500/20 text-red-400 rounded p-3 mb-4 text-sm">{error}</div>}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="admin@oilandgas.com"
            required
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            required
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold py-2 rounded transition"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-gray-500 text-xs mt-4 text-center">Demo: admin@oilandgas.com / admin123</p>
      </form>
    </div>
  );
}

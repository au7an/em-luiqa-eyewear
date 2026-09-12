import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, user, session, isLoading, error, clearError, initializeAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user && session) {
      navigate(from, { replace: true });
    }
  }, [user, session, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return;

    const res = await signIn(email, password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-between p-4 sm:p-8 font-sans text-neutral-200 selection:bg-white selection:text-neutral-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-neutral-900 font-bold text-xs">
            JL
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-widest uppercase block">
              JEM LUIQA
            </span>
            <span className="text-[9px] text-neutral-400 font-medium block -mt-0.5 tracking-wider uppercase">
              Eyewear Studio
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs text-neutral-400 hover:text-white transition-colors"
        >
          ← Return to Storefront
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white mx-auto mb-4">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Studio Operations CMS
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Sign in with your authorized studio administrator account.
            </p>
          </div>

          {!isConfigured && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5">
                  Supabase Environment Setup
                </strong>
                <p className="text-[11px] leading-relaxed text-amber-300/90 font-light">
                  Please ensure <code className="bg-black/40 px-1 py-0.5 rounded text-[10px]">VITE_SUPABASE_URL</code> and <code className="bg-black/40 px-1 py-0.5 rounded text-[10px]">VITE_SUPABASE_ANON_KEY</code> are set in your <code className="bg-black/40 px-1 py-0.5 rounded text-[10px]">.env</code> file.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jemluiqa.com"
                  className="w-full bg-neutral-900 text-white pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-900 text-white pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-neutral-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-[11px] text-neutral-500">
          Internal system for authorized JEM LUIQA personnel only.
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-neutral-600 max-w-5xl mx-auto w-full">
        © 2026 JEM LUIQA EYEWEAR. All rights reserved.
      </div>
    </div>
  );
};

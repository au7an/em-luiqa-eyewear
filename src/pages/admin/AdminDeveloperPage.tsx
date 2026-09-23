import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  Database,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  Glasses,
  MessageSquare,
  Sparkles,
  BookOpen,
  Tag,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { useToast } from '../../components/admin/Toast';
import { getSupabaseClient } from '../../lib/supabase';
import { useProductStore } from '../../store/useProductStore';
import { useInquiryStore } from '../../store/useInquiryStore';
import { useCampaignStore } from '../../store/useCampaignStore';
import { useLensStore } from '../../store/useLensStore';
import { usePromotionStore } from '../../store/usePromotionStore';
import { useLookbookStore } from '../../store/useLookbookStore';

export const AdminDeveloperPage: React.FC = () => {
  const { addToast } = useToast();
  const { products, loadInitialData } = useProductStore();
  const { inquiries, loadInquiries } = useInquiryStore();
  const { campaigns, loadCampaigns } = useCampaignStore();
  const { activeLenses, loadActiveLenses } = useLensStore();
  const { promotions, loadPromotions } = usePromotionStore();
  const { collections, loadLookbook } = useLookbookStore();

  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const checkConnection = async () => {
    setIsPinging(true);
    const start = performance.now();
    const supabase = getSupabaseClient();

    if (!supabase) {
      setDbStatus('offline');
      setDbLatency(null);
      setIsPinging(false);
      return;
    }

    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      const elapsed = Math.round(performance.now() - start);
      if (error) {
        setDbStatus('offline');
        setDbLatency(null);
      } else {
        setDbStatus('connected');
        setDbLatency(elapsed);
      }
    } catch {
      setDbStatus('offline');
      setDbLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkConnection();
    loadInitialData();
    loadInquiries();
    loadCampaigns();
    loadActiveLenses();
    loadPromotions();
    loadLookbook();
  }, [loadInitialData, loadInquiries, loadCampaigns, loadActiveLenses, loadPromotions, loadLookbook]);

  // Aggregate variant count
  const totalVariants = products.reduce(
    (acc, p) => acc + (p.variants ? p.variants.length : 0),
    0
  );

  const clearAppCache = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('sb-') && key !== 'sb_auth_token') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    addToast({
      type: 'success',
      title: 'Cache Dibersihkan',
      message: `${keysToRemove.length} entri client storage telah dibersihkan.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Telemetry & Diagnostics"
        description="Real-time application infrastructure health, database record counts, and build architecture."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Developer Portal' },
        ]}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={checkConnection}
            disabled={isPinging}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isPinging ? 'animate-spin text-neutral-900' : ''} />
            <span>Ping Backend</span>
          </button>
          <a
            href="https://github.com/au7an"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold shadow-xs hover:bg-black transition-colors"
          >
            <span>au7an GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </PageHeader>

      {/* Grid: Health & Infrastructure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Health Card */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Database Status</span>
            <Server size={18} className="text-neutral-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus === 'connected'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : dbStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-lg font-bold text-neutral-900">
                {dbStatus === 'connected' ? 'Connected' : dbStatus === 'checking' ? 'Checking...' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              {dbLatency !== null ? `Latency: ${dbLatency}ms` : 'Supabase PostgreSQL'}
            </p>
          </div>
        </div>

        {/* Storage Health */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Buckets</span>
            <HardDrive size={18} className="text-neutral-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-neutral-900 mb-1">
              4 Active
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              products, campaigns, lookbook, promotions
            </p>
          </div>
        </div>

        {/* Image Compressor Engine */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Image Compressor</span>
            <Cpu size={18} className="text-neutral-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-lg font-bold text-neutral-900 mb-1">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>WebP + HEIC</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Canvas bicubic + heic2any WASM
            </p>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Auth & RLS</span>
            <Shield size={18} className="text-neutral-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-neutral-900 mb-1">
              Protected
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Supabase GoTrue JWT session
            </p>
          </div>
        </div>
      </div>

      {/* Database Resource Telemetry */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Database size={17} className="text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900 tracking-wide uppercase">
              Database Resource Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Live Storefront State
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              <Glasses size={14} />
              <span className="text-[11px] font-semibold">Products</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">{products.length}</div>
            <span className="text-[10px] text-neutral-400">{totalVariants} active variants</span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              <MessageSquare size={14} />
              <span className="text-[11px] font-semibold">Inquiries</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">{inquiries.length}</div>
            <span className="text-[10px] text-neutral-400">Custom lens orders</span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              <Sparkles size={14} />
              <span className="text-[11px] font-semibold">Campaigns</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">{campaigns.length}</div>
            <span className="text-[10px] text-neutral-400">Hero banners</span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              <Layers size={14} />
              <span className="text-[11px] font-semibold">Lenses</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">{activeLenses.length}</div>
            <span className="text-[10px] text-neutral-400">Active services</span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              <Tag size={14} />
              <span className="text-[11px] font-semibold">Promotions</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">{promotions.length}</div>
            <span className="text-[10px] text-neutral-400">Special offers</span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              <BookOpen size={14} />
              <span className="text-[11px] font-semibold">Lookbook</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">{collections.length}</div>
            <span className="text-[10px] text-neutral-400">Editorial series</span>
          </div>
        </div>
      </div>

      {/* Architecture & Client Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2.5">
            <Activity size={16} className="text-neutral-600" />
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Application Build Stack
            </h4>
          </div>

          <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
            <dt className="text-neutral-500 font-medium">Application Name</dt>
            <dd className="font-semibold text-neutral-900">Jem Luiqa Eyewear v1.0.0</dd>

            <dt className="text-neutral-500 font-medium">Frontend Framework</dt>
            <dd className="font-mono text-neutral-900">React 18.3.1 + TypeScript 5.7</dd>

            <dt className="text-neutral-500 font-medium">Build Bundler</dt>
            <dd className="font-mono text-neutral-900">Vite 6.0.7</dd>

            <dt className="text-neutral-500 font-medium">Styling Engine</dt>
            <dd className="font-mono text-neutral-900">TailwindCSS 3.4.17</dd>

            <dt className="text-neutral-500 font-medium">State Management</dt>
            <dd className="font-mono text-neutral-900">Zustand 5.0.2</dd>

            <dt className="text-neutral-500 font-medium">Motion Engine</dt>
            <dd className="font-mono text-neutral-900">Framer Motion 11.15</dd>
          </dl>
        </div>

        {/* Developer Utilities & Maintenance */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2.5">
            <Terminal size={16} className="text-neutral-600" />
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Developer Actions & Utilities
            </h4>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200/80">
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">
                  Clear Local Cache
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  Hapus cache konfigurasi frontend di browser tanpa logout.
                </span>
              </div>
              <button
                type="button"
                onClick={clearAppCache}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Bersihkan</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200/80">
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">
                  Lead Developer Profile
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  Dikembangkan oleh au7an untuk JEM LUIQA Eyewear Studio.
                </span>
              </div>
              <a
                href="https://github.com/au7an"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>GitHub</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

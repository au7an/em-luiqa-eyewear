import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Glasses,
  Sparkles,
  Layers,
  Tag,
  MessageSquare,
  Plus,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useProductStore } from '../../store/useProductStore';
import { useCampaignStore } from '../../store/useCampaignStore';
import { useLensStore } from '../../store/useLensStore';
import { usePromotionStore } from '../../store/usePromotionStore';
import { useInquiryStore } from '../../store/useInquiryStore';
import { useLookbookStore } from '../../store/useLookbookStore';

export const AdminDashboardPage: React.FC = () => {
  const { products, loadInitialData } = useProductStore();
  const { campaigns, loadCampaigns } = useCampaignStore();
  const { lenses, loadLenses } = useLensStore();
  const { promotions, loadPromotions } = usePromotionStore();
  const { inquiries, loadInquiries } = useInquiryStore();
  const { collections, loadLookbook } = useLookbookStore();

  useEffect(() => {
    loadInitialData();
    loadCampaigns();
    loadLenses();
    loadPromotions();
    loadInquiries();
    loadLookbook();
  }, [loadInitialData, loadCampaigns, loadLenses, loadPromotions, loadInquiries, loadLookbook]);

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.published).length;
  const activeCampaigns = campaigns.filter((c) => c.active).length;
  const activePromotions = promotions.filter((p) => p.active).length;
  const totalLenses = lenses.length;
  const newInquiries = inquiries.filter((i) => i.status === 'New').length;

  const recentProducts = products.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 5);

  const stats = [
    { label: 'Total Products', value: totalProducts, sub: `${publishedProducts} published`, icon: Glasses, to: '/admin/products' },
    { label: 'Active Campaigns', value: activeCampaigns, sub: 'Hero carousel slides', icon: Sparkles, to: '/admin/campaigns' },
    { label: 'Lens Services', value: totalLenses, sub: 'Prescription & specialty', icon: Layers, to: '/admin/lenses' },
    { label: 'Active Promotions', value: activePromotions, sub: 'Special offers & bundles', icon: Tag, to: '/admin/promotions' },
    { label: 'New Inquiries', value: newInquiries, sub: `${inquiries.length} total messages`, icon: MessageSquare, to: '/admin/inquiries', highlight: newInquiries > 0 },
    { label: 'Lookbook Collections', value: collections.length, sub: 'Editorial campaigns', icon: BookOpen, to: '/admin/lookbook' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <PageHeader
        title="Operations Dashboard"
        description="Overview of JEM LUIQA catalog, campaigns, client inquiries, and store operations."
      >
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          <span>Live Store</span>
          <ExternalLink size={13} />
        </Link>
      </PageHeader>

      {/* Real CMS Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.to}
              className={`p-4 rounded-xl border bg-white transition-all hover:shadow-sm group flex flex-col justify-between ${
                stat.highlight
                  ? 'border-violet-300 ring-1 ring-violet-200 bg-violet-50/30'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-neutral-400 group-hover:text-neutral-900 transition-colors">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  {stat.label}
                </span>
                <Icon size={16} />
              </div>

              <div>
                <div className="text-2xl font-bold text-neutral-900 tracking-tight mb-0.5">
                  {stat.value}
                </div>
                <div className="text-[11px] text-neutral-400 font-light truncate">
                  {stat.sub}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Operations Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-2xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-colors text-xs font-semibold text-neutral-800"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/campaigns/new"
            className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-colors text-xs font-semibold text-neutral-800"
          >
            <Plus size={15} />
            <span>Add Campaign Slide</span>
          </Link>
          <Link
            to="/admin/promotions/new"
            className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-colors text-xs font-semibold text-neutral-800"
          >
            <Plus size={15} />
            <span>Add Promotion</span>
          </Link>
          <Link
            to="/admin/lookbook/new"
            className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-colors text-xs font-semibold text-neutral-800"
          >
            <Plus size={15} />
            <span>Add Lookbook</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Tables (Recent Products & Recent Inquiries) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Products (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Recent Catalog Products
              </h3>
              <p className="text-[11px] text-neutral-400">
                Latest active frames in the studio inventory
              </p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-neutral-700 hover:text-black inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {recentProducts.map((p) => {
              const primaryImg =
                p.images?.find((i) => i.image_type === 'Primary')?.image_url ||
                p.images?.[0]?.image_url ||
                '/assets/images/cervula.jpg';

              return (
                <div
                  key={p.id}
                  className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg bg-neutral-100 object-contain p-1 border border-neutral-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="font-semibold text-neutral-900 hover:underline truncate block"
                      >
                        {p.name}
                      </Link>
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                        {p.category} • {p.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={p.stock_status} size="sm" />
                    <StatusBadge
                      status={p.published ? 'Published' : 'Draft'}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Inquiries (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Client Inquiries
              </h3>
              <p className="text-[11px] text-neutral-400">
                Recent consultation messages
              </p>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-xs font-semibold text-neutral-700 hover:text-black inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {recentInquiries.map((inq) => (
              <Link
                key={inq.id}
                to="/admin/inquiries"
                className="p-3 sm:p-4 flex items-start justify-between gap-3 hover:bg-neutral-50/60 transition-colors block"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-neutral-900 truncate">
                      {inq.name}
                    </span>
                    <StatusBadge status={inq.status} size="sm" />
                  </div>
                  <p className="text-[11px] font-medium text-neutral-700 truncate">
                    {inq.subject || 'Eyewear Consultation'}
                  </p>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 font-light mt-0.5">
                    {inq.message}
                  </p>
                </div>

                <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">
                  {new Date(inq.created_at).toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

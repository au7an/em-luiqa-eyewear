import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Tag, Edit2, Trash2, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { useToast } from '../../components/admin/Toast';
import { usePromotionStore } from '../../store/usePromotionStore';
import { Promotion } from '../../types/database';

export const AdminPromotionsPage: React.FC = () => {
  const { promotions, isLoading, loadPromotions, deletePromotion } = usePromotionStore();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [deletingPromo, setDeletingPromo] = useState<Promotion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const handleConfirmDelete = async () => {
    if (!deletingPromo) return;
    setIsDeleting(true);
    const res = await deletePromotion(deletingPromo.id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Promotion Deleted',
        message: `"${deletingPromo.title}" removed.`,
      });
      setDeletingPromo(null);
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete promotion.',
      });
    }
  };

  const columns: Column<Promotion>[] = [
    {
      header: 'Banner',
      className: 'w-20',
      render: (p) => (
        <div className="w-16 h-10 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 flex items-center justify-center">
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Tag size={16} className="text-neutral-400" />
          )}
        </div>
      ),
    },
    {
      header: 'Promotion Title',
      render: (p) => (
        <div>
          <Link
            to={`/admin/promotions/${p.id}`}
            className="font-semibold text-neutral-900 hover:underline block"
          >
            {p.title}
          </Link>
          <span className="text-[11px] text-neutral-400 font-light line-clamp-1">
            {p.subtitle || p.description}
          </span>
        </div>
      ),
    },
    {
      header: 'Offer Highlight',
      className: 'w-36',
      render: (p) => (
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
          {p.price_label || 'Special Bundle'}
        </span>
      ),
    },
    {
      header: 'Schedule',
      className: 'w-48',
      render: (p) => {
        if (!p.start_date && !p.end_date) {
          return <span className="text-[11px] text-neutral-400 font-light">Always active</span>;
        }
        return (
          <div className="text-[11px] text-neutral-600 flex items-center gap-1.5">
            <Calendar size={13} className="text-neutral-400 shrink-0" />
            <span>
              {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Now'} –{' '}
              {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Ongoing'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      className: 'w-24',
      render: (p) => (
        <StatusBadge status={p.active ? 'Active' : 'Inactive'} size="sm" />
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      className: 'w-28',
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/admin/promotions/${p.id}`}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title="Edit promotion"
          >
            <Edit2 size={15} />
          </Link>

          <button
            type="button"
            onClick={() => setDeletingPromo(p)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete promotion"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions & Seasonal Bundles"
        description="Manage promotional campaigns, pairing discounts, and seasonal offers shown on the storefront."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Promotions' },
        ]}
        action={{
          label: 'Add Promotion',
          icon: <Plus size={15} />,
          to: '/admin/promotions/new',
        }}
      />

      <DataTable
        columns={columns}
        data={promotions}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        onRowClick={(p) => navigate(`/admin/promotions/${p.id}`)}
        emptyState={
          <EmptyState
            icon={Tag}
            title="No Active Promotions"
            description="Create promotional banners and bundles to showcase seasonal offers."
            actionLabel="Add Promotion"
            onAction={() => navigate('/admin/promotions/new')}
          />
        }
      />

      <ConfirmDialog
        isOpen={Boolean(deletingPromo)}
        title="Delete Promotion"
        message={`Are you sure you want to delete "${deletingPromo?.title}"?`}
        confirmText="Delete Promotion"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPromo(null)}
      />
    </div>
  );
};

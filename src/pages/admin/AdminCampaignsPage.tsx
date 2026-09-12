import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  Video,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { useToast } from '../../components/admin/Toast';
import { useCampaignStore } from '../../store/useCampaignStore';
import { Campaign } from '../../types/database';

export const AdminCampaignsPage: React.FC = () => {
  const { campaigns, isLoading, loadCampaigns, deleteCampaign, reorderCampaigns } = useCampaignStore();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= campaigns.length) return;

    const list = [...campaigns];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const orderedIds = list.map((c) => c.id);
    reorderCampaigns(orderedIds);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCampaign) return;
    setIsDeleting(true);
    const res = await deleteCampaign(deletingCampaign.id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Campaign Deleted',
        message: `"${deletingCampaign.title}" has been deleted.`,
      });
      setDeletingCampaign(null);
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete campaign.',
      });
    }
  };

  const columns: Column<Campaign>[] = [
    {
      header: 'Order',
      className: 'w-16 text-center',
      render: (_c, idx) => (
        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => handleMove(idx, 'up')}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition-colors"
            title="Move up"
          >
            <ArrowUp size={14} />
          </button>
          <span className="font-bold text-xs text-neutral-700 w-4 text-center">
            {idx + 1}
          </span>
          <button
            type="button"
            disabled={idx === campaigns.length - 1}
            onClick={() => handleMove(idx, 'down')}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition-colors"
            title="Move down"
          >
            <ArrowDown size={14} />
          </button>
        </div>
      ),
    },
    {
      header: 'Media',
      className: 'w-24',
      render: (c) => {
        const isVid = c.media_type === 'video';
        return (
          <div className="w-16 h-10 rounded-lg bg-neutral-900 relative overflow-hidden flex items-center justify-center border border-neutral-200">
            {isVid ? (
              <video
                src={c.desktop_media_url}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={c.desktop_media_url}
                alt={c.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-1 right-1 bg-black/70 text-white rounded p-0.5">
              {isVid ? <Video size={10} /> : <ImageIcon size={10} />}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Hero Content',
      render: (c) => (
        <div>
          <Link
            to={`/admin/campaigns/${c.id}`}
            className="font-semibold text-neutral-900 hover:underline block"
          >
            {c.title}
          </Link>
          <div className="text-[11px] text-neutral-400 font-light flex items-center gap-2 mt-0.5">
            {c.eyebrow && <span className="font-medium text-neutral-600">[{c.eyebrow}]</span>}
            <span>Duration: {(c.autoplay_duration || 6000) / 1000}s</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Buttons / CTAs',
      className: 'w-48',
      render: (c) => (
        <div className="text-[11px] space-y-0.5 text-neutral-600">
          <div>
            <strong className="text-neutral-800 font-semibold">1:</strong> {c.primary_cta_label} ({c.primary_cta_url})
          </div>
          <div>
            <strong className="text-neutral-800 font-semibold">2:</strong> {c.secondary_cta_label} ({c.secondary_cta_url})
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      className: 'w-28',
      render: (c) => (
        <StatusBadge status={c.active ? 'Active' : 'Inactive'} size="sm" />
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      className: 'w-28',
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/admin/campaigns/${c.id}`}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title="Edit campaign"
          >
            <Edit2 size={15} />
          </Link>

          <button
            type="button"
            onClick={() => setDeletingCampaign(c)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete campaign"
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
        title="Homepage Hero Campaigns"
        description="Manage dynamic carousel slides, high-resolution media videos/images, and call-to-actions."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Campaigns' },
        ]}
        action={{
          label: 'Add Campaign Slide',
          icon: <Plus size={15} />,
          to: '/admin/campaigns/new',
        }}
      />

      <DataTable
        columns={columns}
        data={campaigns}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        onRowClick={(c) => navigate(`/admin/campaigns/${c.id}`)}
        emptyState={
          <EmptyState
            icon={Sparkles}
            title="No Campaigns Found"
            description="Create your first hero carousel slide with high-resolution image or video background."
            actionLabel="Add Campaign Slide"
            onAction={() => navigate('/admin/campaigns/new')}
          />
        }
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCampaign)}
        title="Delete Campaign Slide"
        message={`Are you sure you want to delete campaign slide "${deletingCampaign?.title}"?`}
        confirmText="Delete Campaign"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCampaign(null)}
      />
    </div>
  );
};

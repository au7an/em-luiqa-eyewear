import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { useToast } from '../../components/admin/Toast';
import { useLookbookStore } from '../../store/useLookbookStore';
import { LookbookCollection } from '../../types/database';

export const AdminLookbookPage: React.FC = () => {
  const { collections, isLoading, loadLookbook, deleteCollection } = useLookbookStore();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [deletingCol, setDeletingCol] = useState<LookbookCollection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadLookbook();
  }, [loadLookbook]);

  const handleConfirmDelete = async () => {
    if (!deletingCol) return;
    setIsDeleting(true);
    const res = await deleteCollection(deletingCol.id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Collection Deleted',
        message: `"${deletingCol.title}" deleted.`,
      });
      setDeletingCol(null);
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete collection.',
      });
    }
  };

  const columns: Column<LookbookCollection>[] = [
    {
      header: 'Cover',
      className: 'w-20',
      render: (c) => (
        <div className="w-16 h-12 rounded-lg bg-neutral-900 overflow-hidden border border-neutral-200 flex items-center justify-center">
          {c.cover_image_url ? (
            <img
              src={c.cover_image_url}
              alt={c.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen size={16} className="text-neutral-400" />
          )}
        </div>
      ),
    },
    {
      header: 'Collection',
      render: (c) => (
        <div>
          <Link
            to={`/admin/lookbook/${c.id}`}
            className="font-semibold text-neutral-900 hover:underline block"
          >
            {c.title}
          </Link>
          <span className="text-[11px] text-neutral-400 font-light line-clamp-1">
            {c.subtitle || c.description}
          </span>
        </div>
      ),
    },
    {
      header: 'Media Count',
      className: 'w-28',
      render: (c) => (
        <span className="text-xs text-neutral-600 font-medium">
          {c.media?.length || 0} media items
        </span>
      ),
    },
    {
      header: 'Status',
      className: 'w-28',
      render: (c) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={c.published ? 'Published' : 'Draft'} size="sm" />
          {c.featured && (
            <span className="text-[10px] text-amber-700 font-semibold">
              ★ Featured
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      className: 'w-28',
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/admin/lookbook/${c.id}`}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title="Edit collection"
          >
            <Edit2 size={15} />
          </Link>

          <button
            type="button"
            onClick={() => setDeletingCol(c)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete collection"
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
        title="Editorial Lookbook & Media"
        description="Manage high-fashion editorial campaigns, lookbook galleries, and photography assets."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Lookbook' },
        ]}
        action={{
          label: 'Add Lookbook Collection',
          icon: <Plus size={15} />,
          to: '/admin/lookbook/new',
        }}
      >
        <Link
          to="/lookbook"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          <span>View Public Lookbook</span>
          <ExternalLink size={13} />
        </Link>
      </PageHeader>

      <DataTable
        columns={columns}
        data={collections}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        onRowClick={(c) => navigate(`/admin/lookbook/${c.id}`)}
        emptyState={
          <EmptyState
            icon={BookOpen}
            title="No Lookbook Collections"
            description="Create an editorial campaign gallery with high-res photos and video assets."
            actionLabel="Add Lookbook Collection"
            onAction={() => navigate('/admin/lookbook/new')}
          />
        }
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCol)}
        title="Delete Lookbook Collection"
        message={`Are you sure you want to delete "${deletingCol?.title}" and its media items?`}
        confirmText="Delete Collection"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCol(null)}
      />
    </div>
  );
};

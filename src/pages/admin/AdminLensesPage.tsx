import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { useToast } from '../../components/admin/Toast';
import { useLensStore } from '../../store/useLensStore';
import { LensService, LensCategory } from '../../types/database';

export const AdminLensesPage: React.FC = () => {
  const { lenses, isLoading, loadLenses, deleteLens } = useLensStore();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<'all' | LensCategory>('all');
  const [deletingLens, setDeletingLens] = useState<LensService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadLenses();
  }, [loadLenses]);

  const filteredLenses = useMemo(() => {
    if (categoryFilter === 'all') return lenses;
    return lenses.filter((l) => l.category === categoryFilter);
  }, [lenses, categoryFilter]);

  const handleConfirmDelete = async () => {
    if (!deletingLens) return;
    setIsDeleting(true);
    const res = await deleteLens(deletingLens.id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Lens Tier Deleted',
        message: `"${deletingLens.name}" removed from catalog.`,
      });
      setDeletingLens(null);
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete lens service.',
      });
    }
  };

  const columns: Column<LensService>[] = [
    {
      header: 'Lens Service',
      render: (l) => (
        <div>
          <Link
            to={`/admin/lenses/${l.id}`}
            className="font-semibold text-neutral-900 hover:underline block"
          >
            {l.name}
          </Link>
          <span className="text-[11px] text-neutral-400 font-light line-clamp-1">
            {l.short_description || l.description}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      className: 'w-36',
      render: (l) => (
        <span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
          {l.category}
        </span>
      ),
    },
    {
      header: 'Starting Price',
      className: 'w-32',
      render: (l) => (
        <span className="font-semibold text-neutral-900">
          {l.starting_price || 'Consultation'}
        </span>
      ),
    },
    {
      header: 'Compatibility',
      className: 'w-52',
      render: (l) => (
        <div className="flex flex-wrap gap-1">
          {l.supports_non_prescription && (
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
              Plano
            </span>
          )}
          {l.supported_vision_types?.map((vt) => (
            <span
              key={vt}
              className="text-[10px] bg-neutral-100 text-neutral-700 border border-neutral-200 px-1.5 py-0.5 rounded font-medium"
            >
              {vt}
            </span>
          ))}
          {l.lens_options && l.lens_options.length > 0 && (
            <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.5 rounded font-medium">
              {l.lens_options.length} Options
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      className: 'w-24',
      render: (l) => (
        <StatusBadge status={l.active ? 'Active' : 'Inactive'} size="sm" />
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      className: 'w-28',
      render: (l) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/admin/lenses/${l.id}`}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title="Edit lens service"
          >
            <Edit2 size={15} />
          </Link>

          <button
            type="button"
            onClick={() => setDeletingLens(l)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete lens service"
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
        title="Prescription & Lens Services CMS"
        description="Manage optical coatings, digital blue defense, photochromic transitions, progressive freeform lenses, and pricing tiers."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Lens Services' },
        ]}
        action={{
          label: 'Add Lens Service',
          icon: <Plus size={15} />,
          to: '/admin/lenses/new',
        }}
      >
        <Link
          to="/lenses"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          <span>View Public Lenses</span>
          <ExternalLink size={13} />
        </Link>
      </PageHeader>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-neutral-200 w-fit overflow-x-auto shadow-2xs">
        {[
          { id: 'all', label: 'All Lenses' },
          { id: 'Single Vision', label: 'Single Vision' },
          { id: 'Specialty', label: 'Specialty & Transitions' },
          { id: 'Progressive', label: 'Progressive Multifocal' },
          { id: 'Bifocal', label: 'Bifocal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              categoryFilter === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredLenses}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        onRowClick={(l) => navigate(`/admin/lenses/${l.id}`)}
        emptyState={
          <EmptyState
            icon={Layers}
            title="No Lens Services Found"
            description="Create your first prescription lens tier with features and pricing specifications."
            actionLabel="Add Lens Service"
            onAction={() => navigate('/admin/lenses/new')}
          />
        }
      />

      <ConfirmDialog
        isOpen={Boolean(deletingLens)}
        title="Delete Lens Service"
        message={`Are you sure you want to delete "${deletingLens?.name}"?`}
        confirmText="Delete Lens"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLens(null)}
      />
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Glasses,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { useToast } from '../../components/admin/Toast';
import { useProductStore } from '../../store/useProductStore';
import { Product, ProductCategory, StockStatus } from '../../types/database';

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    isLoading,
    loadInitialData,
    deleteProduct,
    duplicateProduct,
    togglePublish,
  } = useProductStore();

  const navigate = useNavigate();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [stockFilter, setStockFilter] = useState<'all' | StockStatus>('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured'>('all');

  // Deletion state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      // Stock
      if (stockFilter !== 'all' && p.stock_status !== stockFilter) return false;

      // Published
      if (publishedFilter === 'published' && !p.published) return false;
      if (publishedFilter === 'draft' && p.published) return false;

      // Featured
      if (featuredFilter === 'featured' && !p.featured) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchBadge = p.badge?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchDesc && !matchBadge) return false;
      }

      return true;
    });
  }, [products, categoryFilter, stockFilter, publishedFilter, featuredFilter, search]);

  // Actions
  const handleDuplicate = async (p: Product) => {
    const res = await duplicateProduct(p.id);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Product Duplicated',
        message: `Created draft copy of "${p.name}".`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Duplicate Failed',
        message: res.error || 'Failed to duplicate product.',
      });
    }
  };

  const handleTogglePublish = async (p: Product) => {
    await togglePublish(p.id);
    addToast({
      type: 'info',
      title: p.published ? 'Set to Draft' : 'Product Published',
      message: `"${p.name}" is now ${p.published ? 'hidden from storefront' : 'live on storefront'}.`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    const res = await deleteProduct(deletingProduct.id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Product Deleted',
        message: `"${deletingProduct.name}" has been removed.`,
      });
      setDeletingProduct(null);
    } else {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: res.error || 'Failed to delete product.',
      });
    }
  };

  // Columns definition
  const columns: Column<Product>[] = [
    {
      header: 'Thumbnail',
      className: 'w-16',
      render: (p) => {
        const primary =
          p.images?.find((img) => img.image_type === 'Primary')?.image_url ||
          p.images?.[0]?.image_url ||
          '/assets/images/cervula.jpg';

        return (
          <img
            src={primary}
            alt={p.name}
            className="w-12 h-12 rounded-lg bg-neutral-100 object-contain p-1 border border-neutral-200"
          />
        );
      },
    },
    {
      header: 'Product',
      render: (p) => (
        <div>
          <Link
            to={`/admin/products/${p.id}`}
            className="font-semibold text-neutral-900 hover:underline block"
          >
            {p.name}
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            {p.sku && <span>SKU: {p.sku}</span>}
            {p.badge && (
              <span className="text-neutral-500 font-medium">[{p.badge}]</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      className: 'w-28',
      render: (p) => (
        <span className="capitalize text-neutral-600 font-medium">
          {p.category}
        </span>
      ),
    },
    {
      header: 'Color Variants',
      className: 'w-36',
      render: (p) => {
        const variants = p.variants || [];
        if (variants.length === 0) {
          return <span className="text-neutral-400 text-xs">1 default</span>;
        }
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0"
                  style={{ backgroundColor: v.color_hex || '#000' }}
                  title={`${v.color_name} (${v.sku || 'No SKU'})`}
                />
              ))}
            </div>
            <div className="text-[10px] text-neutral-400">
              {variants.length} {variants.length === 1 ? 'colorway' : 'colorways'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Price',
      className: 'w-32',
      render: (p) => (
        <div>
          <span className="font-semibold text-neutral-900">{p.price}</span>
          {p.compare_at_price && (
            <span className="block text-[10px] text-neutral-400 line-through">
              {p.compare_at_price}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Stock Status',
      className: 'w-28',
      render: (p) => <StatusBadge status={p.stock_status} size="sm" />,
    },
    {
      header: 'Visibility',
      className: 'w-28',
      render: (p) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge
            status={p.published ? 'Published' : 'Draft'}
            size="sm"
          />
          {p.featured && (
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
      className: 'w-36',
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleTogglePublish(p)}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title={p.published ? 'Unpublish (Draft)' : 'Publish'}
          >
            {p.published ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

          <button
            type="button"
            onClick={() => handleDuplicate(p)}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title="Duplicate product"
          >
            <Copy size={15} />
          </button>

          <Link
            to={`/admin/products/${p.id}`}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title="Edit product"
          >
            <Edit2 size={15} />
          </Link>

          <button
            type="button"
            onClick={() => setDeletingProduct(p)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete product"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Products Catalog"
        description="Manage eyewear silhouettes, pricing, specifications, and media gallery."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Products' },
        ]}
        action={{
          label: 'Add Product',
          icon: <Plus size={15} />,
          to: '/admin/products/new',
        }}
      />

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, or specs..."
              className="w-full bg-neutral-50 pl-10 pr-4 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Category Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'sunglasses', label: 'Sunglasses' },
              { id: 'optical', label: 'Optical' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Filters:
          </span>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="py-1 px-2.5 rounded-lg border border-neutral-200 text-neutral-700 bg-white focus:outline-none focus:border-neutral-900 text-xs"
          >
            <option value="all">Stock: All</option>
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Sold Out">Sold Out</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>

          {/* Published Filter */}
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value as any)}
            className="py-1 px-2.5 rounded-lg border border-neutral-200 text-neutral-700 bg-white focus:outline-none focus:border-neutral-900 text-xs"
          >
            <option value="all">Status: All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Featured Filter */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as any)}
            className="py-1 px-2.5 rounded-lg border border-neutral-200 text-neutral-700 bg-white focus:outline-none focus:border-neutral-900 text-xs"
          >
            <option value="all">Featured: All</option>
            <option value="featured">Featured Only</option>
          </select>

          {(search || categoryFilter !== 'all' || stockFilter !== 'all' || publishedFilter !== 'all' || featuredFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setStockFilter('all');
                setPublishedFilter('all');
                setFeaturedFilter('all');
              }}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
        emptyState={
          <EmptyState
            icon={Glasses}
            title="No Products Found"
            description="No frames matched your search keywords or filter options. Try clearing filters or create a new product."
            actionLabel="Add New Product"
            onAction={() => navigate('/admin/products/new')}
          />
        }
      />

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        title="Delete Eyewear Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}" (${deletingProduct?.id})? This action cannot be undone.`}
        confirmText="Delete Product"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
};

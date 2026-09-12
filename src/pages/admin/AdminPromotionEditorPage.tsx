import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FormField, Input, Textarea, Switch } from '../../components/admin/FormField';
import { MediaUploader } from '../../components/admin/MediaUploader';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../components/admin/Toast';
import { usePromotionStore } from '../../store/usePromotionStore';
import { ProductImage } from '../../types/database';

export const AdminPromotionEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { promotions, createPromotion, updatePromotion, deletePromotion, loadPromotions } = usePromotionStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    price_label: string;
    image_url: string;
    cta_label: string;
    cta_url: string;
    active: boolean;
    start_date: string;
    end_date: string;
    sort_order: number;
  }>({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    price_label: '',
    image_url: '/assets/images/lookbook4.jpg',
    cta_label: 'Consult via WhatsApp',
    cta_url: '',
    active: true,
    start_date: '',
    end_date: '',
    sort_order: 1,
  });

  const [bannerMediaList, setBannerMediaList] = useState<ProductImage[]>([]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  useEffect(() => {
    if (!isNew && id) {
      const existing = promotions.find((p) => p.id === id);
      if (existing) {
        setFormData({
          title: existing.title,
          slug: existing.slug,
          subtitle: existing.subtitle || '',
          description: existing.description || '',
          price_label: existing.price_label || '',
          image_url: existing.image_url || '',
          cta_label: existing.cta_label || 'Consult via WhatsApp',
          cta_url: existing.cta_url || '',
          active: existing.active ?? true,
          start_date: existing.start_date ? existing.start_date.slice(0, 16) : '',
          end_date: existing.end_date ? existing.end_date.slice(0, 16) : '',
          sort_order: existing.sort_order || 1,
        });

        if (existing.image_url) {
          setBannerMediaList([
            {
              image_url: existing.image_url,
              image_type: 'Primary',
              sort_order: 1,
            },
          ]);
        }
      }
    }
  }, [isNew, id, promotions]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug,
    }));
  };

  const handleBannerChange = (imgs: ProductImage[]) => {
    setBannerMediaList(imgs);
    if (imgs.length > 0) {
      setFormData((prev) => ({
        ...prev,
        image_url: imgs[imgs.length - 1].image_url,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Promotion title is required.',
      });
      return;
    }

    setIsSaving(true);

    const payload = {
      ...formData,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };

    if (isNew) {
      const res = await createPromotion(payload);
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Promotion Created',
          message: `"${formData.title}" added.`,
        });
        navigate('/admin/promotions');
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to create promotion.',
        });
      }
    } else {
      const res = await updatePromotion(id, payload);
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Promotion Updated',
          message: `"${formData.title}" saved.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to update promotion.',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    setIsDeleting(true);
    const res = await deletePromotion(id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Promotion Deleted',
        message: 'Promotion removed.',
      });
      navigate('/admin/promotions');
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete promotion.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={isNew ? 'New Promotion' : `Edit: ${formData.title}`}
        description="Configure seasonal promotion copy, banner graphic, pricing badge, and scheduling."
        showBackButton
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Promotions', path: '/admin/promotions' },
          { label: isNew ? 'New' : formData.title || 'Edit' },
        ]}
      >
        {!isNew && (
          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-neutral-200 transition-colors"
            title="Delete promotion"
          >
            <Trash2 size={16} />
          </button>
        )}
      </PageHeader>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Banner Graphic */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                1. Promotion Banner Media
              </h3>
              <MediaUploader
                bucket="promotions"
                images={bannerMediaList}
                onChange={handleBannerChange}
                maxFiles={1}
                allowTypeSelection={false}
              />
            </div>

            {/* Copy & Details */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                2. Promotion Copy
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Promotion Headline" required>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Studio Pairing Bundle"
                  />
                </FormField>

                <FormField label="Offer Tagline / Subtitle">
                  <Input
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="e.g. Complimentary Prescription Lens"
                  />
                </FormField>

                <FormField label="Price Label Highlight" helperText="Shown in badge (e.g. Custom Lens Included)">
                  <Input
                    value={formData.price_label}
                    onChange={(e) =>
                      setFormData({ ...formData, price_label: e.target.value })
                    }
                    placeholder="e.g. Custom Lens Included"
                  />
                </FormField>

                <FormField label="CTA Button Label">
                  <Input
                    value={formData.cta_label}
                    onChange={(e) =>
                      setFormData({ ...formData, cta_label: e.target.value })
                    }
                    placeholder="Consult via WhatsApp"
                  />
                </FormField>
              </div>

              <FormField label="Full Description">
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Terms and details of the promotional offer..."
                />
              </FormField>
            </div>

          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                Status & Schedule
              </h3>

              <Switch
                label="Active Promotion"
                description="Live on storefront within schedule"
                checked={formData.active}
                onChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />

              <FormField label="Sort Order">
                <Input
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </FormField>

              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-semibold text-neutral-700 block">
                  Optional Campaign Schedule
                </span>
                <FormField label="Start Date">
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="End Date">
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </FormField>
              </div>
            </div>

            {/* Save Card */}
            <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-md space-y-3 sticky top-6">
              <div className="pt-2 border-t border-neutral-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Promotion</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Promotion"
        message={`Are you sure you want to delete "${formData.title}"?`}
        confirmText="Delete Promotion"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

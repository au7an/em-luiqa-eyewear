import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FormField, Input, Textarea, Switch } from '../../components/admin/FormField';
import { MediaUploader } from '../../components/admin/MediaUploader';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../components/admin/Toast';
import { useLookbookStore } from '../../store/useLookbookStore';
import { LookbookMedia, ProductImage } from '../../types/database';

export const AdminLookbookEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { collections, createCollection, updateCollection, deleteCollection, loadLookbook } = useLookbookStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    cover_image_url: string;
    published: boolean;
    featured: boolean;
    sort_order: number;
  }>({
    title: '',
    slug: '',
    subtitle: 'Editorial Campaign',
    description: '',
    cover_image_url: '/assets/images/lookbook1.jpg',
    published: true,
    featured: true,
    sort_order: 1,
  });

  const [mediaList, setMediaList] = useState<ProductImage[]>([]);

  useEffect(() => {
    loadLookbook();
  }, [loadLookbook]);

  useEffect(() => {
    if (!isNew && id) {
      const existing = collections.find((c) => c.id === id);
      if (existing) {
        setFormData({
          title: existing.title,
          slug: existing.slug,
          subtitle: existing.subtitle || '',
          description: existing.description || '',
          cover_image_url: existing.cover_image_url || '',
          published: existing.published ?? true,
          featured: existing.featured ?? false,
          sort_order: existing.sort_order || 1,
        });

        if (existing.media && existing.media.length > 0) {
          setMediaList(
            existing.media.map((m) => ({
              id: m.id,
              image_url: m.media_url,
              alt_text: m.caption || '',
              image_type: m.media_url === existing.cover_image_url ? 'Primary' : 'Lifestyle',
              sort_order: m.sort_order,
            }))
          );
        }
      }
    }
  }, [isNew, id, collections]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug,
    }));
  };

  const handleMediaChange = (imgs: ProductImage[]) => {
    setMediaList(imgs);
    const primary = imgs.find((i) => i.image_type === 'Primary')?.image_url || imgs[0]?.image_url;
    if (primary) {
      setFormData((prev) => ({ ...prev, cover_image_url: primary }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Lookbook collection title is required.',
      });
      return;
    }

    setIsSaving(true);

    const mediaPayload: Omit<LookbookMedia, 'id' | 'lookbook_id'>[] = mediaList.map((m, idx) => ({
      media_url: m.image_url,
      media_type: m.image_url.endsWith('.mp4') || m.image_url.endsWith('.webm') ? 'video' : 'image',
      caption: m.alt_text || '',
      sort_order: m.sort_order ?? idx + 1,
    }));

    const colPayload = {
      ...formData,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      cover_image_url: formData.cover_image_url || mediaList[0]?.image_url || '',
    };

    if (isNew) {
      const res = await createCollection(colPayload, mediaPayload);
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Lookbook Created',
          message: `"${formData.title}" added with ${mediaList.length} media items.`,
        });
        navigate('/admin/lookbook');
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to create lookbook collection.',
        });
      }
    } else {
      const res = await updateCollection(
        id,
        colPayload,
        mediaPayload as LookbookMedia[]
      );
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Lookbook Updated',
          message: `"${formData.title}" saved.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to update lookbook collection.',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    setIsDeleting(true);
    const res = await deleteCollection(id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Lookbook Deleted',
        message: 'Collection removed.',
      });
      navigate('/admin/lookbook');
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete lookbook collection.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={isNew ? 'New Lookbook Collection' : `Edit: ${formData.title}`}
        description="Upload editorial photo shoots and video clips with captions."
        showBackButton
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Lookbook', path: '/admin/lookbook' },
          { label: isNew ? 'New' : formData.title || 'Edit' },
        ]}
      >
        {!isNew && (
          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-neutral-200 transition-colors"
            title="Delete lookbook collection"
          >
            <Trash2 size={16} />
          </button>
        )}
      </PageHeader>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                1. Collection Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Collection Title" required>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. 2026 Campaign Lookbook"
                  />
                </FormField>

                <FormField label="Slug (URL identifier)" required>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="e.g. 2026-campaign-lookbook"
                  />
                </FormField>

                <FormField label="Subtitle / Tagline">
                  <Input
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="e.g. Milan & Tokyo Editorial Series"
                  />
                </FormField>

                <FormField label="Cover Image URL">
                  <Input
                    value={formData.cover_image_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cover_image_url: e.target.value,
                      })
                    }
                    placeholder="/assets/images/lookbook1.jpg"
                  />
                </FormField>
              </div>

              <FormField label="Narrative Description">
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="An exploration of form, shadow, and architectural silhouettes..."
                />
              </FormField>
            </div>

            {/* Media Gallery */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    2. Lookbook Gallery Media
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Upload lookbook editorial imagery and campaign videos with captions.
                  </p>
                </div>
                <span className="text-xs font-semibold text-neutral-600">
                  {mediaList.length} items
                </span>
              </div>

              <MediaUploader
                bucket="lookbook"
                images={mediaList}
                onChange={handleMediaChange}
                maxFiles={12}
                acceptVideo
                allowTypeSelection
              />
            </div>

          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                Visibility & Settings
              </h3>

              <Switch
                label="Published"
                description="Live in public lookbook page"
                checked={formData.published}
                onChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />

              <Switch
                label="Featured Campaign"
                description="Featured on homepage editorial highlights"
                checked={formData.featured}
                onChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
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
            </div>

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
                      <span>Save Lookbook</span>
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
        title="Delete Lookbook Collection"
        message={`Are you sure you want to delete "${formData.title}"?`}
        confirmText="Delete Collection"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

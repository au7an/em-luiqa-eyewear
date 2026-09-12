import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FormField, Input, Textarea, Select, Switch } from '../../components/admin/FormField';
import { MediaUploader } from '../../components/admin/MediaUploader';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../components/admin/Toast';
import { useCampaignStore } from '../../store/useCampaignStore';
import { MediaType, ProductImage } from '../../types/database';

export const AdminCampaignEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { campaigns, createCampaign, updateCampaign, deleteCampaign, loadCampaigns } = useCampaignStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    eyebrow: string;
    title: string;
    description: string;
    desktop_media_url: string;
    mobile_media_url: string;
    media_type: MediaType;
    primary_cta_label: string;
    primary_cta_url: string;
    secondary_cta_label: string;
    secondary_cta_url: string;
    object_position_desktop: string;
    object_position_mobile: string;
    autoplay_duration: number;
    sort_order: number;
    active: boolean;
    start_date: string;
    end_date: string;
  }>({
    name: '',
    eyebrow: '2026 Collection',
    title: '',
    description: '',
    desktop_media_url: '/assets/images/campaign_slide_2.jpg',
    mobile_media_url: '',
    media_type: 'image',
    primary_cta_label: 'Shop Now',
    primary_cta_url: '/catalog',
    secondary_cta_label: 'View Campaign',
    secondary_cta_url: '/lookbook',
    object_position_desktop: 'center',
    object_position_mobile: 'center',
    autoplay_duration: 6000,
    sort_order: 1,
    active: true,
    start_date: '',
    end_date: '',
  });

  // Media uploader state
  const [desktopMediaList, setDesktopMediaList] = useState<ProductImage[]>([]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!isNew && id) {
      const existing = campaigns.find((c) => c.id === id);
      if (existing) {
        setFormData({
          name: existing.name,
          eyebrow: existing.eyebrow || '',
          title: existing.title,
          description: existing.description || '',
          desktop_media_url: existing.desktop_media_url,
          mobile_media_url: existing.mobile_media_url || '',
          media_type: existing.media_type,
          primary_cta_label: existing.primary_cta_label,
          primary_cta_url: existing.primary_cta_url,
          secondary_cta_label: existing.secondary_cta_label,
          secondary_cta_url: existing.secondary_cta_url,
          object_position_desktop: existing.object_position_desktop || 'center',
          object_position_mobile: existing.object_position_mobile || 'center',
          autoplay_duration: existing.autoplay_duration || 6000,
          sort_order: existing.sort_order || 1,
          active: existing.active ?? true,
          start_date: existing.start_date ? existing.start_date.slice(0, 16) : '',
          end_date: existing.end_date ? existing.end_date.slice(0, 16) : '',
        });

        if (existing.desktop_media_url) {
          setDesktopMediaList([
            {
              image_url: existing.desktop_media_url,
              image_type: 'Primary',
              sort_order: 1,
            },
          ]);
        }
      }
    }
  }, [isNew, id, campaigns]);

  const handleDesktopMediaChange = (imgs: ProductImage[]) => {
    setDesktopMediaList(imgs);
    if (imgs.length > 0) {
      const last = imgs[imgs.length - 1];
      const isVid = last.image_url.endsWith('.mp4') || last.image_url.endsWith('.webm');
      setFormData((prev) => ({
        ...prev,
        desktop_media_url: last.image_url,
        media_type: isVid ? 'video' : 'image',
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.desktop_media_url.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Campaign title and desktop media URL are required.',
      });
      return;
    }

    setIsSaving(true);

    const payload = {
      ...formData,
      name: formData.name || formData.title,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };

    if (isNew) {
      const res = await createCampaign(payload);
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Campaign Created',
          message: `Hero slide "${formData.title}" added.`,
        });
        navigate('/admin/campaigns');
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to create campaign.',
        });
      }
    } else {
      const res = await updateCampaign(id, payload);
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Campaign Updated',
          message: `Hero slide "${formData.title}" updated.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to update campaign.',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    setIsDeleting(true);
    const res = await deleteCampaign(id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Campaign Deleted',
        message: 'Slide removed from hero rotation.',
      });
      navigate('/admin/campaigns');
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete campaign.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={isNew ? 'New Hero Campaign Slide' : `Edit: ${formData.title}`}
        description="Configure video or high-res imagery, headlines, and call to action links."
        showBackButton
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Campaigns', path: '/admin/campaigns' },
          { label: isNew ? 'New' : formData.title || 'Edit' },
        ]}
      >
        {!isNew && (
          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-neutral-200 transition-colors"
            title="Delete campaign"
          >
            <Trash2 size={16} />
          </button>
        )}
      </PageHeader>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Media Upload */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                1. Hero Background Media (Image or Video)
              </h3>

              <MediaUploader
                bucket="campaigns"
                images={desktopMediaList}
                onChange={handleDesktopMediaChange}
                maxFiles={1}
                acceptVideo
                allowTypeSelection={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <FormField label="Media Type">
                  <Select
                    value={formData.media_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        media_type: e.target.value as MediaType,
                      })
                    }
                  >
                    <option value="image">Image (JPEG, PNG, WebP)</option>
                    <option value="video">Video (MP4 / WebM)</option>
                  </Select>
                </FormField>

                <FormField label="Autoplay Duration (Seconds)">
                  <Input
                    type="number"
                    min="3"
                    max="30"
                    value={formData.autoplay_duration / 1000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoplay_duration: (parseInt(e.target.value) || 6) * 1000,
                      })
                    }
                  />
                </FormField>
              </div>
            </div>

            {/* 2. Hero Headlines & Copy */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                2. Typography & Headlines
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Internal Campaign Name">
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. 2026 Solar Campaign"
                  />
                </FormField>

                <FormField label="Eyebrow Subtitle">
                  <Input
                    value={formData.eyebrow}
                    onChange={(e) =>
                      setFormData({ ...formData, eyebrow: e.target.value })
                    }
                    placeholder="e.g. Studio Precision Series"
                  />
                </FormField>
              </div>

              <FormField label="Hero Headline Title" required>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. 2026 OPTICAL COLLECTION"
                />
              </FormField>

              <FormField label="Brief Narrative Description">
                <Textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Sculptural silhouettes engineered to frame your perspective..."
                />
              </FormField>
            </div>

            {/* 3. Call-to-Action Buttons */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                3. Interactive Pill Buttons
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
                  <span className="text-xs font-semibold text-neutral-800 block">
                    Primary Button
                  </span>
                  <FormField label="Button Label">
                    <Input
                      value={formData.primary_cta_label}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primary_cta_label: e.target.value,
                        })
                      }
                      placeholder="Shop Now"
                    />
                  </FormField>
                  <FormField label="Button Link / URL">
                    <Input
                      value={formData.primary_cta_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primary_cta_url: e.target.value,
                        })
                      }
                      placeholder="/catalog?category=optical"
                    />
                  </FormField>
                </div>

                <div className="space-y-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
                  <span className="text-xs font-semibold text-neutral-800 block">
                    Secondary Button
                  </span>
                  <FormField label="Button Label">
                    <Input
                      value={formData.secondary_cta_label}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondary_cta_label: e.target.value,
                        })
                      }
                      placeholder="View Campaign"
                    />
                  </FormField>
                  <FormField label="Button Link / URL">
                    <Input
                      value={formData.secondary_cta_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondary_cta_url: e.target.value,
                        })
                      }
                      placeholder="/lookbook"
                    />
                  </FormField>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status & Schedule */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                Rotation Status
              </h3>

              <Switch
                label="Active in Hero Carousel"
                description="Included in the live homepage rotation"
                checked={formData.active}
                onChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />

              <FormField label="Slide Sort Order">
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
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Status
                </h4>
                <p className="text-sm font-bold text-white mt-0.5">
                  {isNew ? 'Ready to Create Slide' : 'Editing Slide'}
                </p>
              </div>

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
                      <span>Save Slide</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Campaign Slide"
        message={`Are you sure you want to delete "${formData.title}"?`}
        confirmText="Delete Slide"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, Trash2, X } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FormField, Input, Textarea, Select, Switch } from '../../components/admin/FormField';
import { CurrencyInput } from '../../components/admin/CurrencyInput';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../components/admin/Toast';
import { useLensStore } from '../../store/useLensStore';
import { LensCategory } from '../../types/database';

export const AdminLensEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { lenses, createLens, updateLens, deleteLens, loadLenses } = useLensStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    category: LensCategory;
    short_description: string;
    description: string;
    starting_price: string;
    currency: string;
    features: string[];
    recommended_for: string;
    sort_order: number;
    active: boolean;
  }>({
    name: '',
    slug: '',
    category: 'Single Vision',
    short_description: '',
    description: '',
    starting_price: 'IDR 250,000',
    currency: 'IDR',
    features: ['Anti Blue-Light Coating', 'Hard Multi-Coat Anti Scratch', 'UV400 Total Block'],
    recommended_for: 'Everyday prescription and digital screen protection.',
    sort_order: 1,
    active: true,
  });

  const [newFeatureInput, setNewFeatureInput] = useState('');

  useEffect(() => {
    loadLenses();
  }, [loadLenses]);

  useEffect(() => {
    if (!isNew && id) {
      const existing = lenses.find((l) => l.id === id);
      if (existing) {
        setFormData({
          name: existing.name,
          slug: existing.slug,
          category: existing.category,
          short_description: existing.short_description || '',
          description: existing.description || '',
          starting_price: existing.starting_price || '',
          currency: existing.currency || 'IDR',
          features: Array.isArray(existing.features) ? existing.features : [],
          recommended_for: existing.recommended_for || '',
          sort_order: existing.sort_order || 1,
          active: existing.active ?? true,
        });
      }
    }
  }, [isNew, id, lenses]);

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isNew ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug,
    }));
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureInput.trim()],
    }));
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.starting_price.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Lens name and starting price are required.',
      });
      return;
    }

    setIsSaving(true);

    const payload = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    if (isNew) {
      const res = await createLens(payload);
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Lens Service Created',
          message: `"${formData.name}" added to catalog.`,
        });
        navigate('/admin/lenses');
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to create lens service.',
        });
      }
    } else {
      const res = await updateLens(id, payload);
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Lens Service Updated',
          message: `"${formData.name}" changes saved.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to update lens service.',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    setIsDeleting(true);
    const res = await deleteLens(id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Lens Deleted',
        message: 'Lens service removed from catalog.',
      });
      navigate('/admin/lenses');
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete lens service.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={isNew ? 'New Lens Service' : `Edit: ${formData.name}`}
        description="Configure lens category, technology specifications, bullet features, and starting price."
        showBackButton
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Lens Services', path: '/admin/lenses' },
          { label: isNew ? 'New' : formData.name || 'Edit' },
        ]}
      >
        {!isNew && (
          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-neutral-200 transition-colors"
            title="Delete lens service"
          >
            <Trash2 size={16} />
          </button>
        )}
      </PageHeader>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Basic Info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                1. Lens Classification & Name
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Lens Service Name" required>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Blue Control Shield (High-Index)"
                  />
                </FormField>

                <FormField label="Slug (URL identifier)" required>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="e.g. blue-control-shield"
                  />
                </FormField>

                <FormField label="Category" required>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as LensCategory,
                      })
                    }
                  >
                    <option value="Single Vision">Single Vision</option>
                    <option value="Specialty">Specialty & Transitions (Photochromic, Polarized)</option>
                    <option value="Progressive">Progressive Multifocal</option>
                    <option value="Bifocal">Bifocal</option>
                  </Select>
                </FormField>

                <FormField label="Starting Price (Starting From...)" required helperText="Formatted pricing label (e.g. IDR 250.000)">
                  <CurrencyInput
                    required
                    value={formData.starting_price}
                    onChange={(e) =>
                      setFormData({ ...formData, starting_price: e.target.value })
                    }
                    placeholder="IDR 250.000"
                  />
                </FormField>
              </div>

              <FormField label="Short Summary" helperText="Shown in cards & overviews">
                <Input
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                  placeholder="Essential digital blue light defense for screen users."
                />
              </FormField>

              <FormField label="Detailed Description">
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Advanced optical coating filtering harmful high-energy blue-violet light..."
                />
              </FormField>
            </div>

            {/* 2. Feature Bullets & Recommended For */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                2. Key Features & Coating Technologies
              </h3>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-700">
                  Feature Highlights (Bullet points on public card)
                </label>

                <div className="flex gap-2">
                  <Input
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="e.g. Anti Blue-Light 420nm Filter"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors shrink-0"
                  >
                    Add
                  </button>
                </div>

                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-lg text-xs text-neutral-800 border border-neutral-200"
                      >
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-neutral-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <FormField label="Recommended For (Client Profile)" helperText="Guidance notes for who benefits most from this lens">
                  <Input
                    value={formData.recommended_for}
                    onChange={(e) =>
                      setFormData({ ...formData, recommended_for: e.target.value })
                    }
                    placeholder="e.g. Professionals & creatives with extensive screen work."
                  />
                </FormField>
              </div>
            </div>

          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                Visibility & Order
              </h3>

              <Switch
                label="Active Lens Service"
                description="Published on public /lenses catalog"
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
            </div>

            {/* Save Card */}
            <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-md space-y-3 sticky top-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Status
                </h4>
                <p className="text-sm font-bold text-white mt-0.5">
                  {isNew ? 'Ready to Create Lens' : 'Editing Lens Service'}
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
                      <span>Save Lens Service</span>
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
        title="Delete Lens Service"
        message={`Are you sure you want to delete "${formData.name}"?`}
        confirmText="Delete Lens"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

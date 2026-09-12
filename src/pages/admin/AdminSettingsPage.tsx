import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Globe,
  Phone,
  MapPin,
  Search,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FormField, Input, Textarea } from '../../components/admin/FormField';
import { TaxonomyQuickAddModal } from '../../components/admin/TaxonomyQuickAddModal';
import { useToast } from '../../components/admin/Toast';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { SiteSettings } from '../../types/database';

export const AdminSettingsPage: React.FC = () => {
  const { settings, loadSettings, updateSettings, isSaving } = useSettingsStore();
  const {
    frameShapes,
    faceShapes,
    occasions,
    loadTaxonomy,
    updateFrameShape,
    deleteFrameShape,
    updateFaceShape,
    deleteFaceShape,
    updateOccasion,
    deleteOccasion,
  } = useDiscoveryStore();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'concierge' | 'discovery'>('concierge');
  const [discoverySubtab, setDiscoverySubtab] = useState<'shapes' | 'faces' | 'occasions'>('shapes');
  const [quickAddType, setQuickAddType] = useState<'frame_shape' | 'face_shape' | 'occasion' | null>(null);

  const [formData, setFormData] = useState<SiteSettings>(settings);

  useEffect(() => {
    loadSettings();
    loadTaxonomy();
  }, [loadSettings, loadTaxonomy]);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateSettings(formData);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Global site settings and concierge details updated.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: res.error || 'Failed to update site settings.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Settings & Discovery Taxonomy"
        description="Manage brand identity, concierge contact endpoints, and dynamic eyewear discovery attributes."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Settings' },
        ]}
      />

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab('concierge')}
          className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'concierge'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Globe size={15} />
          <span>Site & Concierge</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discovery')}
          className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'discovery'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Layers size={15} />
          <span>Discovery Attributes</span>
        </button>
      </div>

      {/* Tab 1: Concierge & Global Site Settings */}
      {activeTab === 'concierge' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main settings column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Brand Identity */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-neutral-900 border-b border-neutral-100 pb-3">
                  <Globe size={18} />
                  <h3 className="text-sm font-semibold">1. Brand Identity</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Brand Name" required>
                    <Input
                      required
                      value={formData.brand_name}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_name: e.target.value })
                      }
                      placeholder="JEM LUIQA"
                    />
                  </FormField>

                  <FormField label="Brand Tagline">
                    <Input
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                      }
                      placeholder="Define Your Vision"
                    />
                  </FormField>
                </div>

                <FormField label="Footer Brand Narrative">
                  <Textarea
                    rows={3}
                    value={formData.footer_text}
                    onChange={(e) =>
                      setFormData({ ...formData, footer_text: e.target.value })
                    }
                    placeholder="International avant-garde & optical luxury eyewear..."
                  />
                </FormField>
              </div>

              {/* 2. Commerce & Concierge */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-neutral-900 border-b border-neutral-100 pb-3">
                  <Phone size={18} />
                  <h3 className="text-sm font-semibold">
                    2. Commerce & Concierge Communication
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Shopee Storefront URL">
                    <Input
                      type="url"
                      value={formData.shopee_url}
                      onChange={(e) =>
                        setFormData({ ...formData, shopee_url: e.target.value })
                      }
                      placeholder="https://shopee.co.id/jemluiqa"
                    />
                  </FormField>

                  <FormField label="Instagram Profile URL">
                    <Input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram_url: e.target.value })
                      }
                      placeholder="https://instagram.com/jemluiqa"
                    />
                  </FormField>

                  <FormField label="WhatsApp Concierge Number">
                    <Input
                      value={formData.whatsapp_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsapp_number: e.target.value,
                        })
                      }
                      placeholder="6281234567890"
                    />
                  </FormField>

                  <FormField label="Concierge Email Address">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="concierge@jemluiqa.com"
                    />
                  </FormField>
                </div>

                <FormField
                  label="WhatsApp Default Consultation Message"
                  helperText="Default greeting populated when customer starts lens consultation."
                >
                  <Textarea
                    rows={2}
                    value={formData.whatsapp_default_message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp_default_message: e.target.value,
                      })
                    }
                    placeholder="Hello Jem Luiqa Concierge, I would like to consult custom optical lenses..."
                  />
                </FormField>
              </div>

              {/* 3. Studio Flagship Location */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-neutral-900 border-b border-neutral-100 pb-3">
                  <MapPin size={18} />
                  <h3 className="text-sm font-semibold">
                    3. Studio Flagship & Gallery Location
                  </h3>
                </div>

                <FormField label="Physical Studio Address">
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Operational Hours">
                    <Input
                      value={formData.operational_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operational_hours: e.target.value,
                        })
                      }
                      placeholder="Monday – Sunday: 09:00 – 20:00 WIB"
                    />
                  </FormField>

                  <FormField label="Google Maps Direction URL">
                    <Input
                      type="url"
                      value={formData.google_maps_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          google_maps_url: e.target.value,
                        })
                      }
                      placeholder="https://maps.google.com/..."
                    />
                  </FormField>
                </div>
              </div>

              {/* 4. SEO Metadata */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-neutral-900 border-b border-neutral-100 pb-3">
                  <Search size={18} />
                  <h3 className="text-sm font-semibold">
                    4. Default SEO Metadata
                  </h3>
                </div>

                <FormField label="Default Page Title">
                  <Input
                    value={formData.seo_default_title || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo_default_title: e.target.value,
                      })
                    }
                    placeholder="JEM LUIQA EYEWEAR | Define Your Vision"
                  />
                </FormField>

                <FormField label="Default Meta Description">
                  <Textarea
                    rows={2}
                    value={formData.seo_default_description || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo_default_description: e.target.value,
                      })
                    }
                    placeholder="International avant-garde & optical luxury eyewear..."
                  />
                </FormField>
              </div>
            </div>

            {/* Right Save Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-md space-y-4 sticky top-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Settings Synchronization
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 font-light leading-relaxed">
                    Saving updates will instantly reflect across the public Navbar, Footer, Contact page, and WhatsApp concierge generators.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Save Site Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Discovery Attributes Management */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          {/* Sub-tab Pill Navigation */}
          <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-2xl border border-neutral-200/80">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDiscoverySubtab('shapes')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  discoverySubtab === 'shapes'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Frame Shapes ({frameShapes.length})
              </button>
              <button
                type="button"
                onClick={() => setDiscoverySubtab('faces')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  discoverySubtab === 'faces'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Face Shapes ({faceShapes.length})
              </button>
              <button
                type="button"
                onClick={() => setDiscoverySubtab('occasions')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  discoverySubtab === 'occasions'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Curated Occasions ({occasions.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (discoverySubtab === 'shapes') setQuickAddType('frame_shape');
                else if (discoverySubtab === 'faces') setQuickAddType('face_shape');
                else setQuickAddType('occasion');
              }}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <Plus size={14} />
              <span>
                Add{' '}
                {discoverySubtab === 'shapes'
                  ? 'Frame Shape'
                  : discoverySubtab === 'faces'
                  ? 'Face Shape'
                  : 'Occasion'}
              </span>
            </button>
          </div>

          {/* Subtab Content: Table / List */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            {discoverySubtab === 'shapes' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Slug Identifier</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {frameShapes.map((shape) => (
                    <tr key={shape.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">{shape.name}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">{shape.slug}</td>
                      <td className="py-3.5 px-4 text-neutral-600 max-w-sm">{shape.description || '—'}</td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => updateFrameShape(shape.id, { active: !shape.active })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            shape.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                          }`}
                        >
                          {shape.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete frame shape "${shape.name}"?`)) {
                              deleteFrameShape(shape.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {discoverySubtab === 'faces' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Slug Identifier</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {faceShapes.map((face) => (
                    <tr key={face.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">{face.name}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">{face.slug}</td>
                      <td className="py-3.5 px-4 text-neutral-600 max-w-sm">{face.description || '—'}</td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => updateFaceShape(face.id, { active: !face.active })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            face.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                          }`}
                        >
                          {face.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete face shape "${face.name}"?`)) {
                              deleteFaceShape(face.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {discoverySubtab === 'occasions' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Slug Identifier</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {occasions.map((occ) => (
                    <tr key={occ.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">{occ.name}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">{occ.slug}</td>
                      <td className="py-3.5 px-4 text-neutral-600 max-w-sm">{occ.description || '—'}</td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => updateOccasion(occ.id, { active: !occ.active })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            occ.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                          }`}
                        >
                          {occ.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete occasion "${occ.name}"?`)) {
                              deleteOccasion(occ.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {quickAddType && (
        <TaxonomyQuickAddModal
          isOpen={!!quickAddType}
          type={quickAddType}
          onClose={() => setQuickAddType(null)}
          onSuccess={() => {
            loadTaxonomy();
          }}
        />
      )}
    </div>
  );
};

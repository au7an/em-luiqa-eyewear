import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { FormField, Input, Textarea } from './FormField';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { useToast } from './Toast';

interface TaxonomyQuickAddModalProps {
  isOpen: boolean;
  type: 'frame_shape' | 'face_shape' | 'occasion';
  onClose: () => void;
  onSuccess: (createdId: string) => void;
}

export const TaxonomyQuickAddModal: React.FC<TaxonomyQuickAddModalProps> = ({
  isOpen,
  type,
  onClose,
  onSuccess,
}) => {
  const { createFrameShape, createFaceShape, createOccasion } = useDiscoveryStore();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const titles = {
    frame_shape: 'New Frame Silhouette Shape',
    face_shape: 'New Harmonious Face Shape',
    occasion: 'New Curated Occasion',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let res: { success: boolean; data?: any; error?: string };
    if (type === 'frame_shape') {
      res = await createFrameShape({
        id: `shape-${slug}`,
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        sort_order: 99,
        active: true,
      });
    } else if (type === 'face_shape') {
      res = await createFaceShape({
        id: `face-${slug}`,
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        sort_order: 99,
        active: true,
      });
    } else {
      res = await createOccasion({
        id: `occ-${slug}`,
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        sort_order: 99,
        active: true,
      });
    }

    setIsSaving(false);
    if (res.success && res.data) {
      addToast({
        type: 'success',
        title: 'Taxonomy Added',
        message: `"${name}" has been created.`,
      });
      onSuccess(res.data.id);
      onClose();
      setName('');
      setDescription('');
    } else {
      addToast({
        type: 'error',
        title: 'Failed to create',
        message: res.error || 'Could not save attribute.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-neutral-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
          <h3 className="text-base font-bold text-neutral-900">{titles[type]}</h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Name" required>
            <Input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aviator Pilot / Diamond Face / Gala"
            />
          </FormField>

          <FormField label="Description (Optional)" helperText="Brief editorial explanation shown in tooltips">
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Characteristics or fit suitability..."
            />
          </FormField>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Create Attribute</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

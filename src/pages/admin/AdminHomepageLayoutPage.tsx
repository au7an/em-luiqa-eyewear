import React, { useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Eye,
  RotateCcw,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Switch } from '../../components/admin/FormField';
import { useToast } from '../../components/admin/Toast';
import { useHomepageLayoutStore } from '../../store/useHomepageLayoutStore';
import { HomeSectionId } from '../../types/database';

export const AdminHomepageLayoutPage: React.FC = () => {
  const {
    layout,
    isSaving,
    hasUnsavedChanges,
    loadLayout,
    saveLayout,
    toggleHero,
    toggleSection,
    moveSection,
    setSections,
    applyPreset,
  } = useHomepageLayoutStore();

  const { addToast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  const handleSave = async () => {
    const res = await saveLayout();
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Layout Disimpan',
        message: 'Pengaturan tata letak homepage berhasil diperbarui.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: res.error || 'Terjadi kesalahan saat menyimpan tata letak.',
      });
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // set drag image opacity
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const reordered = [...layout.sections];
      const [moved] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      setSections(reordered);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Stats calculation
  const totalSections = 1 + layout.sections.length;
  const activeCount = (layout.hero_enabled ? 1 : 0) + layout.sections.filter((s) => s.enabled).length;

  return (
    <div className="space-y-8 pb-20">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-20 bg-neutral-100/90 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-neutral-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1">
              <span>Admin</span>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">Homepage Builder</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                Homepage Layout & Sections
              </h1>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <AlertCircle size={12} />
                  <span>Unsaved Changes</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons in Top Header */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-black text-xs font-semibold flex items-center gap-1.5 transition-colors bg-white shadow-2xs"
            >
              <ExternalLink size={14} />
              <span>Preview Home</span>
            </a>

            {/* STICKY SAVE BUTTON */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Presets & Status Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">
              Status Tampilan Toko
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-neutral-900">
                {activeCount} dari {totalSections} Section Aktif
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activeCount >= 5
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : activeCount <= 2
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {activeCount >= 5
                  ? 'Rich Mode (Konten Ramai)'
                  : activeCount <= 2
                  ? 'Focus Mode (Minimalis)'
                  : 'Custom Balanced'}
              </span>
            </div>
          </div>

          {/* Quick 1-Click Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => applyPreset('rich')}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-neutral-50 hover:bg-white text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Aktifkan semua menu card agar halaman depan ramai & kaya informasi"
            >
              <Sparkles size={13} className="text-amber-600" />
              <span>Ramekan Semua (Rich)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('focus')}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-neutral-50 hover:bg-white text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Fokus hanya pada Hero dan Produk Unggulan"
            >
              <Eye size={13} className="text-blue-600" />
              <span>Fokus Minimal (Focus)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-neutral-50 hover:bg-white text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Kembalikan ke susunan standar bawaan"
            >
              <RotateCcw size={13} className="text-neutral-500" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          Kamu bisa mengaktifkan atau menonaktifkan section dengan saklar <strong>On/Off</strong>, serta menarik (*drag & drop*) atau menggunakan tombol panah <strong>Naik / Turun</strong> untuk memindahkan urutan posisi section pada halaman depan.
        </p>
      </div>

      {/* SECTION 1: HERO CAROUSEL (PINNED AT TOP) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            Puncak Halaman (Top Pinned)
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">
            Posisi tetap di paling atas
          </span>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            layout.hero_enabled
              ? 'bg-white border-neutral-900/40 shadow-xs'
              : 'bg-neutral-50/70 border-neutral-200 opacity-65'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              #0
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">
                  Hero Campaign Carousel & Video Showcase
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                  Pinned Top
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Full-screen media slider and campaign videos showcasing brand editorial stories.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Switch
              label=""
              checked={layout.hero_enabled}
              onChange={() => toggleHero()}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: REORDERABLE DYNAMIC SECTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            Susunan Section Dinamis (Bisa Di-Reorder & Toggle)
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">
            Tarik atau klik panah untuk atur urutan
          </span>
        </div>

        <div className="space-y-3">
          {layout.sections.map((section, index) => {
            const isFirst = index === 0;
            const isLast = index === layout.sections.length - 1;
            const isDragging = draggedIndex === index;
            const isDropTarget = dragOverIndex === index;

            return (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-40 border-dashed border-neutral-400' : ''
                } ${
                  isDropTarget ? 'border-neutral-900 ring-2 ring-neutral-900/20 scale-101' : ''
                } ${
                  section.enabled
                    ? 'bg-white border-neutral-200/90 shadow-2xs hover:border-neutral-300'
                    : 'bg-neutral-50/70 border-neutral-200 opacity-60'
                }`}
              >
                {/* Left: Drag Handle & Info */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Grip Handle */}
                  <div className="text-neutral-400 hover:text-neutral-900 p-1 -ml-1 transition-colors shrink-0">
                    <GripVertical size={18} />
                  </div>

                  {/* Order Pill */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      section.enabled
                        ? 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-neutral-900 truncate">
                        {section.name}
                      </h4>
                      {section.badge && (
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Right: Up/Down Arrows & Toggle */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {/* Reorder Arrow Buttons */}
                  <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveSection(index, index - 1)}
                      className="p-1.5 text-neutral-600 hover:text-black hover:bg-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Pindahkan ke atas"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveSection(index, index + 1)}
                      className="p-1.5 text-neutral-600 hover:text-black hover:bg-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Pindahkan ke bawah"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* On/Off Switch */}
                  <Switch
                    label=""
                    checked={section.enabled}
                    onChange={() => toggleSection(section.id as HomeSectionId)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

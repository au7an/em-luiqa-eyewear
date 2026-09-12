import React, { useEffect } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useLookbookStore } from '../store/useLookbookStore';

export const LookbookPage: React.FC = () => {
  const openLightbox = useUIStore((state) => state.openLightbox);
  const { collections, loadLookbook } = useLookbookStore();

  useEffect(() => {
    loadLookbook();
  }, [loadLookbook]);

  const activeCollection = collections.find((c) => c.published) || collections[0];
  const mediaItems = activeCollection?.media || [];

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">
          <Sparkles size={14} />
          {activeCollection?.subtitle || 'Editorial Lookbook'}
        </span>
        <h1 className="editorial-title text-4xl sm:text-5xl lg:text-6xl text-neutral-900 uppercase mb-4">
          {activeCollection?.title || '2026 Campaign'}
        </h1>
        <p className="text-sm text-neutral-500 font-light leading-relaxed">
          {activeCollection?.description ||
            'An exploration of form, shadow, and architectural silhouettes captured across international metropolises.'}
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 auto-rows-[340px]">
        {mediaItems.map((item, idx) => {
          // Dynamic span pattern for visual hierarchy
          const span =
            idx === 0
              ? 'col-span-1 md:row-span-2'
              : idx === 1 || idx === 4
              ? 'col-span-1 md:col-span-2'
              : 'col-span-1';

          return (
            <div
              key={item.id || idx}
              onClick={() =>
                openLightbox({
                  src: item.media_url,
                  title: activeCollection?.title || 'Editorial Series',
                  caption: item.caption || '',
                })
              }
              className={`group relative rounded-3xl overflow-hidden bg-neutral-900 shadow-md cursor-pointer ${span}`}
            >
              {item.media_type === 'video' ? (
                <video
                  src={item.media_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={item.caption || 'Lookbook shot'}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white">
                <div className="flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <Eye size={16} />
                  </div>
                </div>

                <div>
                  <h3 className="editorial-title text-xl sm:text-2xl text-white uppercase mb-1">
                    {item.caption?.split('—')[0]?.trim() || 'Editorial Look'}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-neutral-300 font-light line-clamp-2 max-w-sm">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

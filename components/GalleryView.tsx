import React, { useState, useMemo } from 'react';
import { useI18n } from '../i18n';
import type { Transformation } from '../types';

interface GalleryViewProps {
  transformations: Transformation[];
  onCreateSame: (effect: Transformation) => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ transformations, onCreateSame }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | NonNullable<Transformation['category']>>('all');

  // Filter transformations based on search and category
  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return transformations.filter((tr) => {
      const matchQuery = lower
        ? (tr.title + ' ' + tr.prompt).toLowerCase().includes(lower)
        : true;
      const matchCat = activeCategory === 'all' ? true : tr.category === activeCategory;
      return matchQuery && matchCat;
    });
  }, [transformations, query, activeCategory]);

  // Group by category
  const groups = useMemo(() => {
    const map = new Map<string, Transformation[]>();
    for (const tr of filtered) {
      const key = tr.category ?? 'custom';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tr);
    }
    // Sort: custom/style/elements/scene/lighting/special
    const order = ['custom', 'style', 'elements', 'scene', 'lighting', 'special'];
    return Array.from(map.entries()).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [filtered]);

  const categoryTabs: Array<{ key: 'all' | NonNullable<Transformation['category']>; label: string }> = useMemo(() => ([
    { key: 'all', label: t('categories.all') },
    { key: 'custom', label: t('categories.custom') },
    { key: 'style', label: t('categories.style') },
    { key: 'elements', label: t('categories.elements') },
    { key: 'scene', label: t('categories.scene') },
    { key: 'lighting', label: t('categories.lighting') },
    { key: 'special', label: t('categories.special') },
  ]), [t]);

  // Default example images (using placeholder URLs - replace with actual examples)
  const getExampleImages = (effect: Transformation) => {
    // This is a placeholder implementation
    // In production, you would have actual example images for each effect
    const placeholderBefore = 'https://via.placeholder.com/400x300/cccccc/666666?text=Original';
    const placeholderAfter = 'https://via.placeholder.com/400x300/ff9500/000000?text=' + encodeURIComponent(effect.title);
    
    return {
      before: effect.example?.before || placeholderBefore,
      after: effect.example?.after || placeholderAfter
    };
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
          {t('gallery.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('gallery.subtitle')}</p>
      </div>

      {/* Search and Filter */}
      <div className="sticky top-20 z-10 bg-white/80 dark:bg-black/70 backdrop-blur-md border-b border-black/10 dark:border-white/10 mb-6 -mx-4 md:-mx-8 px-4 md:px-8">
        <div className="py-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-gray-950 border border-black/10 dark:border-white/10 text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  activeCategory === key
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black border-transparent'
                    : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10 hover:border-orange-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {groups.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          {t('common.unknown')}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([cat, items]) => (
            <div key={cat} className="animate-fade-in-fast">
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-1 rounded bg-gradient-to-b from-orange-500 to-yellow-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t(`categories.${cat}`)}
                </h2>
              </div>

              {/* Effects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((effect, index) => {
                  const examples = getExampleImages(effect);
                  return (
                    <div
                      key={`${cat}-${index}`}
                      className="group bg-white dark:bg-gray-950 rounded-xl border border-black/10 dark:border-white/10 overflow-hidden hover:border-orange-500 transition-all duration-200 hover:shadow-xl"
                    >
                      {/* Example Images */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900">
                        {effect.example ? (
                          <div className="relative w-full h-full">
                            {/* Before Image */}
                            <img
                              src={examples.before}
                              alt="Before"
                              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                            />
                            {/* After Image */}
                            <img
                              src={examples.after}
                              alt="After"
                              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            />
                            {/* Hover Indicator */}
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md transition-opacity duration-300">
                              <span className="group-hover:hidden">{t('common.original')}</span>
                              <span className="hidden group-hover:inline">{t('gallery.viewEffect')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                            <div className="text-center">
                              <span className="material-symbols-outlined text-5xl mb-2">{effect.icon}</span>
                              <p className="text-sm">{t('gallery.noExample')}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Effect Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {effect.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {effect.prompt !== 'CUSTOM' ? effect.prompt : t('transformations.customPrompt')}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-2xl text-orange-500 ml-2">
                            {effect.icon}
                          </span>
                        </div>

                        {/* Create Same Button */}
                        <button
                          onClick={() => onCreateSame(effect)}
                          className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                          <span>{t('gallery.createSame')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryView;

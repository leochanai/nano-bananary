
import React, { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import type { Transformation } from '../types';

interface TransformationSelectorProps {
  transformations: Transformation[];
  onSelect: (transformation: Transformation) => void;
  hasPreviousResult: boolean;
}

const TransformationSelector: React.FC<TransformationSelectorProps> = ({ transformations, onSelect, hasPreviousResult }) => {
  const { t } = useI18n();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | NonNullable<Transformation['category']>>('all');

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

  const groups = useMemo(() => {
    const map = new Map<string, Transformation[]>();
    for (const tr of filtered) {
      const key = tr.category ?? 'custom';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tr);
    }
    // 排序：自定义/风格/元素/场景/光影/特效
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

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="sticky top-16 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
        <div className="py-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    ? 'bg-orange-500 text-white border-transparent'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-400'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">{t('common.unknown')}</div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([cat, items]) => (
            <div key={cat} className="animate-fade-in-fast">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-1 rounded bg-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t(`categories.${cat}`)}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((trans, index) => (
                  <button
                    key={`${cat}-${index}`}
                    onClick={() => onSelect(trans)}
                    className="group flex flex-col items-center justify-center text-center p-4 aspect-square bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-orange-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-orange-500">
                    <span className="text-4xl mb-2 transition-transform duration-200 group-hover:scale-110 material-symbols-outlined">{trans.icon}</span>
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-200">{trans.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransformationSelector;

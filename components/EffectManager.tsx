import React, { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import type { TransformationCategory } from '../types';
import { useUserEffects, UserEffect } from '../services/effectStore';
import IconPicker from './IconPicker';
import { TRANSFORMATION_SOURCES } from '../constants';

const categoryOptions: Array<{ key: TransformationCategory; icon: string }> = [
  { key: 'custom', icon: 'edit' },
  { key: 'style', icon: 'palette' },
  { key: 'elements', icon: 'local_florist' },
  { key: 'scene', icon: 'landscape' },
  { key: 'lighting', icon: 'wb_sunny' },
  { key: 'special', icon: 'auto_awesome' },
];

export default function EffectManager() {
  const { t } = useI18n();
  const { effects, create, update, remove, clearAll } = useUserEffects();

  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<UserEffect, 'id'>>({
    title: '',
    prompt: '',
    icon: 'auto_awesome',
    category: 'custom',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // 右侧展示：合并“用户效果 + 内置效果”。仅对用户效果提供编辑/删除操作
  type DisplayItem = (UserEffect & { isUser: true }) | ({ id?: undefined; title: string; prompt: string; icon: string; category: TransformationCategory; isUser: false });

  const builtinItems: DisplayItem[] = useMemo(() =>
    TRANSFORMATION_SOURCES.map(({ key, prompt, icon, category }) => ({
      title: t(`transformations.${key}`),
      prompt,
      icon,
      category,
      isUser: false as const,
    })),
  [t]);

  const userItems: DisplayItem[] = useMemo(() => effects.map(e => ({ ...e, isUser: true as const })), [effects]);

  const allItems: DisplayItem[] = useMemo(() => [...userItems, ...builtinItems], [userItems, builtinItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(e => (e.title + ' ' + e.prompt).toLowerCase().includes(q));
  }, [allItems, search]);

  const currentCategory = useMemo(() => categoryOptions.find(c => c.key === form.category), [form.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.prompt.trim()) return;
    if (editingId) {
      update(editingId, form);
      setEditingId(null);
    } else {
      create(form);
    }
    setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'custom' });
  };

  const startEdit = (item: UserEffect) => {
    setEditingId(item.id);
    setForm({ title: item.title, prompt: item.prompt, icon: item.icon, category: item.category });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'custom' });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-orange-500 flex items-center gap-2">
          <span className="material-symbols-outlined">tune</span>
          {t('effects.manage')}
        </h2>
        <button onClick={() => clearAll()} className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
          {t('effects.clearAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-4 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-xl border border-black/10 dark:border-white/10">
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">{editingId ? t('effects.edit') : t('effects.add')}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t('effects.titlePlaceholder')}
              className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900"
            />
            <textarea
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              placeholder={t('effects.promptPlaceholder')}
              rows={3}
              className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900"
            />
            <div className="grid grid-cols-1 gap-3">
              <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap flex items-center gap-2">
                  {t('effects.chooseStyle')}
                  <span className="material-symbols-outlined text-xl">{currentCategory?.icon || 'style'}</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TransformationCategory }))}
                  className="ml-auto w-full md:w-64 p-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900"
                >
                  {categoryOptions.map(({ key, icon }) => (
                    <option key={key} value={key}>{t(`categories.${key}`)} ({icon})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-2 rounded bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold">
                {editingId ? t('effects.save') : t('effects.addAction')}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                  {t('effects.cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="p-4 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-xl border border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-gray-950 border border-black/10 dark:border-white/10 text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">{t('common.unknown')}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((item, idx) => (
                <div key={item.isUser ? item.id : `${item.category}-${item.icon}-${idx}`} className="group flex flex-col items-center justify-center text-center p-4 aspect-square bg-white dark:bg-gray-950 rounded-xl border border-black/10 dark:border-white/10">
                  <span className="text-4xl mb-2 material-symbols-outlined">{item.icon}</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-200 line-clamp-2">{item.title}</span>
                  {item.isUser && (
                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">{t('effects.edit')}</button>
                      <button onClick={() => remove(item.id)} className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60">{t('effects.delete')}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



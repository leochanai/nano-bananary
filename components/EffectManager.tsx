import React, { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import type { TransformationCategory } from '../types';
import { useUserEffects, UserEffect } from '../services/effectStore';
import { TRANSFORMATION_SOURCES } from '../constants';
import { useBuiltinEffects } from '../services/builtinStore';
import EffectEditModal, { EffectFormState } from './EffectEditModal';

export default function EffectManager() {
  const { t } = useI18n();
  const { effects, create, update, remove, clearAll } = useUserEffects();
  const { disabledKeys, overrides, disable, enable, setOverride, clearAll: clearAllBuiltin } = useBuiltinEffects();

  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<UserEffect, 'id'>>({
    title: '',
    prompt: '',
    icon: 'auto_awesome',
    category: 'style',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBuiltin, setEditingBuiltin] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // 右侧展示：合并“用户效果 + 内置效果”。仅对用户效果提供编辑/删除操作
  type DisplayItem = (UserEffect & { isUser: true }) | ({ key: string; title: string; prompt: string; icon: string; category: TransformationCategory; isUser: false; isDisabled: boolean });

  const builtinItems: DisplayItem[] = useMemo(() =>
    TRANSFORMATION_SOURCES
      .filter(({ key }) => (showHidden ? true : !disabledKeys.includes(key)))
      .map(({ key, prompt, icon, category }) => {
        const ov = overrides[key] || {};
        return {
          key,
          title: (ov.title ?? t(`transformations.${key}`)) as string,
          prompt: (ov.prompt ?? prompt) as string,
          icon: (ov.icon ?? icon) as string,
          category: (ov.category ?? category) as TransformationCategory,
          isUser: false as const,
          isDisabled: disabledKeys.includes(key),
        };
      }),
  [t, disabledKeys, overrides, showHidden]);

  const userItems: DisplayItem[] = useMemo(() => effects.map(e => ({ ...e, isUser: true as const })), [effects]);

  const allItems: DisplayItem[] = useMemo(() => [...userItems, ...builtinItems], [userItems, builtinItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(e => (e.title + ' ' + e.prompt).toLowerCase().includes(q));
  }, [allItems, search]);

  // 左侧说明面板已移除，不再需要当前分类计算

  const handleSubmit = () => {
    if (!form.title.trim() || !form.prompt.trim()) return;
    if (editingId) {
      update(editingId, form);
      setEditingId(null);
    } else if (editingBuiltin) {
      setOverride(editingBuiltin, { ...form });
      setEditingBuiltin(null);
    } else {
      create(form);
    }
    setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'style' });
    setIsModalOpen(false);
  };

  const startEdit = (item: UserEffect) => {
    setEditingId(item.id);
    setForm({ title: item.title, prompt: item.prompt, icon: item.icon, category: item.category });
    setIsModalOpen(true);
  };

  const startEditBuiltin = (item: DisplayItem & { isUser: false }) => {
    setEditingId(null);
    setEditingBuiltin(item.key);
    setForm({ title: item.title, prompt: item.prompt, icon: item.icon, category: item.category });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingBuiltin(null);
    setIsModalOpen(false);
    setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'style' });
  };

  const handleClearAll = () => {
    clearAll();
    clearAllBuiltin();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-orange-500 flex items-center gap-2">
          <span className="material-symbols-outlined">tune</span>
          {t('effects.manage')}
        </h2>
        <button onClick={() => { setEditingId(null); setEditingBuiltin(null); setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'style' }); setIsModalOpen(true); }} className="px-3 py-2 text-sm rounded-md bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold">
          {t('effects.add')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
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
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 select-none">
              <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
              <span>{t('effects.showHidden') || '显示已隐藏'}</span>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">{t('common.unknown')}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((item, idx) => (
                <div key={item.isUser ? item.id : `${item.category}-${item.icon}-${idx}`} className={`group relative flex flex-col items-center justify-center text-center p-4 aspect-square rounded-xl border border-black/10 dark:border-white/10 ${('isUser' in item && !item.isUser && item.isDisabled) ? 'bg-gray-100 dark:bg-gray-900 opacity-60' : 'bg-white dark:bg-gray-950'}`}>
                  {(
                    item.isUser || (!item.isUser && item.key !== 'customPrompt')
                  ) && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.isUser ? (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            title={t('effects.edit')}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => remove(item.id)}
                            title={t('effects.delete')}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditBuiltin(item)}
                            title={t('effects.edit')}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          {item.isDisabled ? (
                            <button
                              onClick={() => enable(item.key)}
                              title={t('effects.restore') || '恢复'}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => disable(item.key)}
                              title={t('effects.delete')}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-base">visibility_off</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  <span className="text-4xl mb-2 material-symbols-outlined">{item.icon}</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-200 line-clamp-2">{item.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <EffectEditModal
        open={isModalOpen}
        mode={editingId || editingBuiltin ? 'edit' : 'add'}
        form={form as EffectFormState}
        onChange={(next) => setForm(next)}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
      />
    </div>
  );
}



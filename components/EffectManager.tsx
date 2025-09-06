import React, { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import type { TransformationCategory } from '../types';
import EffectEditModal, { EffectFormState } from './EffectEditModal';
import { usePromptEffects } from '../services/promptService';
import { useBuiltinEffects } from '../services/builtinStore';

export default function EffectManager() {
  const { t, lang } = useI18n();
  const { merged, create, update, remove, clearAll } = usePromptEffects(lang);
  const { disabledKeys, disable, enable } = useBuiltinEffects();

  const [search, setSearch] = useState('');
  const [form, setForm] = useState<EffectFormState>({
    title: '',
    prompt: '',
    icon: 'auto_awesome',
    category: 'style',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showHidden, setShowHidden] = useState<boolean>(false);

  // 展示项：合并 JSON + 隐藏状态
  type DisplayItem = { key: string; title: string; prompt: string; icon?: string; type?: TransformationCategory; isUser: boolean; isBuiltin: boolean; isHidden: boolean };
  const allItems: DisplayItem[] = useMemo(
    () => merged
      .map(m => ({
        key: m.key,
        title: m.title,
        prompt: m.prompt,
        icon: m.icon,
        type: m.type as TransformationCategory | undefined,
        isUser: !m.isBuiltin,
        isBuiltin: m.isBuiltin,
        isHidden: !!(m.isBuiltin && disabledKeys.includes(m.key)),
      }))
      .filter(item => item.key !== 'custom_prompt'),
    [merged, disabledKeys]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(e => (e.title + ' ' + e.prompt).toLowerCase().includes(q));
  }, [allItems, search]);

  const visible = useMemo(() => filtered.filter(item => !(item.isBuiltin && item.isHidden && !showHidden)), [filtered, showHidden]);

  // 左侧说明面板已移除，不再需要当前分类计算

  const handleSubmit = () => {
    if (!form.title.trim() || !form.prompt.trim()) return;
    if (editingId) {
      update(editingId, form.title, form.prompt, form.icon, form.category);
      setEditingId(null);
    } else {
      create(form.title, form.prompt, form.icon, form.category);
    }
    setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'style' });
    setIsModalOpen(false);
  };

  const startEdit = (item: DisplayItem) => {
    setEditingId(item.key);
    setForm({ title: item.title, prompt: item.prompt, icon: item.icon || 'auto_awesome', category: (item.type as TransformationCategory) || 'style' });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsModalOpen(false);
    setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'style' });
  };

  const handleClearAll = () => {
    clearAll();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-orange-500 flex items-center gap-2">
          <span className="material-symbols-outlined">tune</span>
          {t('effects.manage')}
        </h2>
        <button onClick={() => { setEditingId(null); setForm({ title: '', prompt: '', icon: 'auto_awesome', category: 'style' }); setIsModalOpen(true); }} className="px-3 py-2 text-sm rounded-md bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold">
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
            <button
              onClick={() => setShowHidden(v => !v)}
              className={`px-3 py-2 text-sm rounded-md border ${showHidden ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black border-transparent' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10 hover:border-orange-400'}`}
            >
              {t('effects.showHidden')}
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">{t('common.unknown')}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visible.map((item, idx) => (
                <div key={`${item.key}-${idx}`} className={`group relative flex flex-col items-center justify-center text-center p-4 aspect-square rounded-xl border border-black/10 dark:border-white/10 ${item.isBuiltin && item.isHidden ? 'bg-gray-100 dark:bg-gray-900 opacity-60' : 'bg-white dark:bg-gray-950'}`}>
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
                          onClick={() => remove(item.key)}
                          title={t('effects.delete')}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {!item.isHidden ? (
                          <button
                            onClick={() => disable(item.key)}
                            title={'隐藏'}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">visibility_off</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => enable(item.key)}
                            title={t('effects.restore')}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">restart_alt</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-4xl mb-2 material-symbols-outlined">{item.icon || (item.key === 'custom_prompt' ? 'edit' : 'auto_awesome')}</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-200 line-clamp-2">{item.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <EffectEditModal
        open={isModalOpen}
        mode={editingId ? 'edit' : 'add'}
        form={form as EffectFormState}
        onChange={(next) => setForm(next)}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
      />
    </div>
  );
}



import React, { useMemo } from 'react';
import { useI18n } from '../i18n';
import type { TransformationCategory } from '../types';
import IconPicker from './IconPicker';

export interface EffectFormState {
  title: string;
  prompt: string;
  icon: string;
  category: TransformationCategory;
}

interface EffectEditModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  form: EffectFormState;
  onChange: (next: EffectFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

// 动态构建选项，确保始终包含“自定义”
function useCategoryOptions() {
  const options: Array<{ key: TransformationCategory; icon: string; labelKey: string }> = [
    { key: 'style', icon: 'palette', labelKey: 'categories.style' },
    { key: 'elements', icon: 'local_florist', labelKey: 'categories.elements' },
    { key: 'scene', icon: 'landscape', labelKey: 'categories.scene' },
    { key: 'lighting', icon: 'wb_sunny', labelKey: 'categories.lighting' },
    { key: 'special', icon: 'auto_awesome', labelKey: 'categories.special' },
  ];
  return options;
}

const EffectEditModal: React.FC<EffectEditModalProps> = ({ open, mode, form, onChange, onSubmit, onCancel }) => {
  const { t } = useI18n();
  const categoryOptions = useMemo(() => useCategoryOptions(), [t]);
  if (!open) return null;

  const isValid = form.title.trim() && form.prompt.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4 animate-fade-in">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-auto rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-950 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="material-symbols-outlined">{mode === 'edit' ? 'edit' : 'add'}</span>
            {mode === 'edit' ? t('effects.edit') : t('effects.add')}
          </h3>
          <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <input
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            placeholder={t('effects.titlePlaceholder')}
            className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900"
          />
          <textarea
            value={form.prompt}
            onChange={(e) => onChange({ ...form, prompt: e.target.value })}
            placeholder={t('effects.promptPlaceholder')}
            rows={3}
            className="w-full p-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900"
          />
          <IconPicker value={form.icon} onChange={(icon) => onChange({ ...form, icon })} />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap flex items-center gap-2">
              {t('effects.chooseStyle')}
            </label>
            <select
              value={form.category}
              onChange={(e) => onChange({ ...form, category: e.target.value as TransformationCategory })}
              className="ml-auto w-full md:w-64 p-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900"
            >
              {categoryOptions.map(({ key, icon, labelKey }) => (
                <option key={key} value={key}>{t(labelKey)} ({icon})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 pt-0 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
            {t('effects.cancel')}
          </button>
          <button onClick={onSubmit} disabled={!isValid} className="px-3 py-2 rounded bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
            {t('effects.save')}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          .animate-fade-in { animation: fadeIn .2s ease-out }
        `}
      </style>
    </div>
  );
};

export default EffectEditModal;



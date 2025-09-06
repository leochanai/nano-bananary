import React, { useMemo, useState } from 'react';
import { useI18n } from '../i18n';

interface IconPickerProps {
  value: string;
  onChange: (next: string) => void;
}

// 精选 Material Symbols 图标名称列表（可按需扩充）
const ICON_CATALOG: string[] = Array.from(new Set([
  // 常用与已有
  'edit','movie','palette','local_movies','local_florist','ac_unit','robot_2','skull','draw','pets','photo_camera','public','auto_awesome','nights_stay','water_drop','wb_sunny','grid_on','nightlife','color_lens','category','hive','forest','settings','layers','theaters','gradient','emoji_objects','account_balance','military_tech','umbrella','temple_buddhist','shield','menu_book','travel_explore','scuba_diving','image','visibility_off','park','stat_0','flare','garden_cart','eco','ink_pen','cruelty_free','camera_alt','flutter_dash','castle','chess',
  // UI 常用
  'tune','close','search','translate','light_mode','dark_mode','landscape','add','check','radio_button_checked','radio_button_unchecked','done','star','photo','brush','bolt','magic_button','filter_vintage','style','texture','grain','colorize','contrast','invert_colors','water','local_see','auto_fix','blur_on','blur_circular','flare','lens_blur','brightness_5','brightness_7'
]));

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_CATALOG;
    return ICON_CATALOG.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">{t('effects.chooseIcon')}</span>
        <span className="material-symbols-outlined text-xl">{value || 'auto_awesome'}</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('effects.searchIcons')}
          className="ml-auto w-full md:w-64 px-3 py-2 rounded-lg bg-white dark:bg-gray-950 border border-black/10 dark:border-white/10 text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div className="max-h-48 overflow-auto grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-2 bg-white dark:bg-gray-950 rounded-lg border border-black/10 dark:border-white/10">
        {filtered.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={`flex items-center justify-center aspect-square rounded-md border text-gray-800 dark:text-gray-200 transition-colors ${
              value === name
                ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black border-transparent'
                : 'bg-white dark:bg-gray-900 border-black/10 dark:border-white/10 hover:border-orange-400'
            }`}
            aria-label={name}
            title={name}
          >
            <span className="material-symbols-outlined text-2xl">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IconPicker;



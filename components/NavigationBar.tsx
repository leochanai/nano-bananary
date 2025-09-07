import React from 'react';
import { useI18n } from '../i18n';
import type { PageMode } from '../types';

interface NavigationBarProps {
  currentMode: PageMode;
  onModeChange: (mode: PageMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onToggleEffectManager: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  currentMode,
  onModeChange,
  isDark,
  onToggleTheme,
  onToggleLanguage,
  onToggleEffectManager,
}) => {
  const { t, lang } = useI18n();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-black/10 dark:border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Tabs */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍌</span>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
                Creative Banana
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onModeChange('quick')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentMode === 'quick'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('navigation.quickProcess')}
              </button>
              <button
                onClick={() => onModeChange('gallery')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentMode === 'gallery'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('navigation.gallery')}
              </button>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Effect Manager Button */}
            <button
              onClick={onToggleEffectManager}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              title={t('effects.manage')}
            >
              <span className="material-symbols-outlined">tune</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              title={lang === 'zh' ? 'English' : '中文'}
            >
              <span className="material-symbols-outlined">translate</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              <span className="material-symbols-outlined">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;

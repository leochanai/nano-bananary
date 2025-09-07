import React from 'react';
import { useI18n } from '../i18n';

interface NavigationBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onToggleEffectManager: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  isDark,
  onToggleTheme,
  onToggleLanguage,
  onToggleEffectManager,
}) => {
  const { t, lang } = useI18n();

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Tabs */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍌</span>
              <span className="text-lg font-bold text-orange-500">
                Creative Banana
              </span>
            </div>

            {/* Navigation Tabs - Removed */}
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

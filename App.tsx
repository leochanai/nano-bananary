import React, { useState, useCallback } from 'react';
import { useI18n } from './i18n';
import { useTransformations } from './constants';
import type { Transformation } from './types';
import NavigationBar from './components/NavigationBar';
import QuickProcessView from './components/QuickProcessView';
import ImagePreviewModal from './components/ImagePreviewModal';
import EffectManager from './components/EffectManager';

const App: React.FC = () => {
  const { lang, setLang } = useI18n();
  const transformations = useTransformations();
  
  // App state
  const [isManagingEffects, setIsManagingEffects] = useState<boolean>(false);
  const [preSelectedEffect, setPreSelectedEffect] = useState<Transformation | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = useCallback(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains('dark');
    if (nextIsDark) {
      root.classList.add('dark');
      setIsDark(true);
      try { localStorage.setItem('app.theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      setIsDark(false);
      try { localStorage.setItem('app.theme', 'light'); } catch {}
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  }, [lang, setLang]);

  const toggleEffectManager = useCallback(() => {
    setIsManagingEffects((v) => !v);
  }, []);


  const handleClosePreview = () => setPreviewImageUrl(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-300 font-sans">
      {/* Navigation Bar */}
      <NavigationBar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onToggleLanguage={toggleLanguage}
        onToggleEffectManager={toggleEffectManager}
      />

      {/* Main Content */}
      <main className="pt-2">
        {isManagingEffects ? (
          <EffectManager />
        ) : (
          <QuickProcessView
            transformations={transformations}
            preSelectedEffect={preSelectedEffect}
            onEffectApplied={() => setPreSelectedEffect(null)}
          />
        )}
      </main>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <ImagePreviewModal
          imageUrl={previewImageUrl}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

export default App;

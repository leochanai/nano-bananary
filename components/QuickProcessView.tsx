import React, { useState, useCallback, useMemo } from 'react';
import { useI18n } from '../i18n';
import { editImage, editImages } from '../services/geminiService';
import type { GeneratedContent, Transformation, UploadedImage, TransformationCategory } from '../types';
import TransformationSelector from './TransformationSelector';
import ResultDisplay from './ResultDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ImageEditorCanvas from './ImageEditorCanvas';
import ImageUploader from './ImageUploader';
import { dataUrlToFile, embedWatermark } from '../utils/fileUtils';

type ActiveTool = 'mask' | 'none';

interface QuickProcessViewProps {
  transformations: Transformation[];
  preSelectedEffect?: Transformation | null;
  onEffectApplied?: () => void;
}

const QuickProcessView: React.FC<QuickProcessViewProps> = ({ 
  transformations, 
  preSelectedEffect,
  onEffectApplied 
}) => {
  const { t } = useI18n();
  
  // Effect selection state
  const [selectedTransformation, setSelectedTransformation] = useState<Transformation | null>(
    preSelectedEffect || null
  );
  const [showFullSelector, setShowFullSelector] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<TransformationCategory | null>('custom');
  
  // Multi-image state
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Generation state
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  // Always use multi-mode
  const isMultiMode = true;

  // Update selected transformation when preSelectedEffect changes
  React.useEffect(() => {
    if (preSelectedEffect) {
      setSelectedTransformation(preSelectedEffect);
      setSelectedCategory(preSelectedEffect.category || null);
    }
  }, [preSelectedEffect]);

  // 当 effects 加载完成且未有预选时，默认选择 自定义 - 自定义提示词
  React.useEffect(() => {
    if (!preSelectedEffect && !selectedTransformation && transformations && transformations.length > 0) {
      const customEffect = transformations.find(t => t.prompt === 'CUSTOM');
      if (customEffect) {
        setSelectedTransformation(customEffect);
        setSelectedCategory(customEffect.category || 'custom');
      } else {
        setSelectedCategory('custom');
      }
    }
  }, [transformations, preSelectedEffect, selectedTransformation]);

  // Get effects by category
  const effectsByCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return transformations.filter(t => t.category === selectedCategory);
  }, [selectedCategory, transformations]);

  // Category list
  const categories: { key: TransformationCategory; label: string; icon: string }[] = [
    { key: 'custom', label: t('categories.custom'), icon: 'edit' },
    { key: 'style', label: t('categories.style'), icon: 'palette' },
    { key: 'elements', label: t('categories.elements'), icon: 'add_photo_alternate' },
    { key: 'scene', label: t('categories.scene'), icon: 'landscape' },
    { key: 'lighting', label: t('categories.lighting'), icon: 'light_mode' },
    { key: 'special', label: t('categories.special'), icon: 'auto_awesome' },
  ];

  // Removed mode switching - always multi-mode

  const handleSelectTransformation = (transformation: Transformation) => {
    setSelectedTransformation(transformation);
    setGeneratedContent(null);
    setError(null);
    if (transformation.prompt !== 'CUSTOM') {
      setCustomPrompt('');
    }
    setShowFullSelector(false);
  };

  const handleImageSelect = useCallback((file: File, dataUrl: string) => {
    setSelectedFile(file);
    setImagePreviewUrl(dataUrl);
    setGeneratedContent(null);
    setError(null);
    setMaskDataUrl(null);
    setActiveTool('none');
  }, []);

  const addImages = useCallback((files: File[]) => {
    const toRead = files.slice(0, Math.max(0, 3 - images.length));
    const readers = toRead.map(file => new Promise<UploadedImage>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ 
        id: `${Date.now()}-${Math.random()}`, 
        file, 
        dataUrl: reader.result as string 
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    
    Promise.all(readers).then(newOnes => {
      setImages(prev => {
        const combined = [...prev, ...newOnes].slice(0, 3);
        // Always in multi-mode
        if (combined.length > 0 && (activeIndex === null || !imagePreviewUrl)) {
          setActiveIndex(0);
          setSelectedFile(combined[0].file);
          setImagePreviewUrl(combined[0].dataUrl);
        }
        return combined;
      });
      setMaskDataUrl(null);
      setGeneratedContent(null);
      setError(null);
      setActiveTool('none');
    });
  }, [images.length, activeIndex, imagePreviewUrl]);

  const removeImageAt = useCallback((index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      let nextActive: number | null = null;
      if (next.length === 0) {
        nextActive = null;
      } else if (activeIndex !== null) {
        if (index < activeIndex) {
          nextActive = activeIndex - 1;
        } else if (index === activeIndex) {
          nextActive = Math.min(activeIndex, next.length - 1);
        } else {
          nextActive = activeIndex;
        }
      }
      setActiveIndex(nextActive);
      if (nextActive !== null) {
        setSelectedFile(next[nextActive].file);
        setImagePreviewUrl(next[nextActive].dataUrl);
      } else {
        setSelectedFile(null);
        setImagePreviewUrl(null);
      }
      setGeneratedContent(null);
      setError(null);
      setMaskDataUrl(null);
      setActiveTool('none');
      return next;
    });
  }, [activeIndex]);

  const handleClearImage = () => {
    setImagePreviewUrl(null);
    setSelectedFile(null);
    setGeneratedContent(null);
    setError(null);
    setMaskDataUrl(null);
    setActiveTool('none');
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedTransformation) {
      setError(t('errors.uploadAndSelect'));
      return;
    }

    const promptToUse = selectedTransformation.prompt === 'CUSTOM' 
      ? customPrompt 
      : selectedTransformation.prompt;
      
    if (!promptToUse.trim()) {
      setError(t('errors.enterPrompt'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      let result: GeneratedContent;
      // Always use multi-mode
      const prepared = images.map(img => {
        const mimeType = img.dataUrl.split(';')[0].split(':')[1] ?? 'image/png';
        const base64 = img.dataUrl.split(',')[1];
        return { base64, mimeType };
      });
      if (prepared.length === 0) {
        throw new Error(t('errors.uploadAndSelect'));
      }
      result = await editImages(prepared, promptToUse);

      if (result.imageUrl) {
        result.imageUrl = await embedWatermark(result.imageUrl, "Creative Banana");
      }
      setGeneratedContent(result);
      
      if (onEffectApplied) {
        onEffectApplied();
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedTransformation, customPrompt, images, t, onEffectApplied]);

  const handleUseResultAsInput = useCallback(async () => {
    if (!generatedContent?.imageUrl) return;

    try {
      const newFile = await dataUrlToFile(generatedContent.imageUrl, `edited-${Date.now()}.png`);
      setSelectedFile(newFile);
      setImagePreviewUrl(generatedContent.imageUrl);
      setGeneratedContent(null);
      setError(null);
      setMaskDataUrl(null);
      setActiveTool('none');
      setSelectedTransformation(null);
      setSelectedCategory(null);
    } catch (err) {
      console.error("Failed to use image as input:", err);
      setError(t('errors.useAsInputFailed'));
    }
  }, [generatedContent, t]);

  const handleBackToSelection = () => {
    setShowFullSelector(true);
  };
  
  const handleCloseFullSelector = () => {
    setShowFullSelector(false);
  };

  const toggleMaskTool = () => {
    setActiveTool(current => (current === 'mask' ? 'none' : 'mask'));
  };

  const hasAnyInput = images.length > 0;
  const isGenerateDisabled = !hasAnyInput || isLoading || 
    (selectedTransformation?.prompt === 'CUSTOM' && !customPrompt.trim());

  // Show full effect selector if requested
  if (showFullSelector) {
    return (
      <div>
        <div className="container mx-auto p-4 md:p-8">
          <button
            onClick={handleCloseFullSelector}
            className="mb-4 flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t('common.back')}
          </button>
        </div>
        <TransformationSelector 
          transformations={transformations} 
          onSelect={handleSelectTransformation} 
          hasPreviousResult={!!imagePreviewUrl}
        />
      </div>
    );
  }

  // Main processing view
  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="flex flex-col gap-6 p-6 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-xl border border-black/10 dark:border-white/10 shadow-2xl shadow-black/20">
          <div>
            {/* Step 1: Upload Image */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                1. {t('upload.clickToUpload')}
              </h3>
              
              {/* Image Upload - Always multi-mode */}
              <ImageUploader
                images={images}
                onAdd={addImages}
                onRemove={removeImageAt}
                max={3}
                showSlots
              />
            </div>

            {/* Step 2: Choose Effect - Always visible */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  2. {t('selector.chooseEffect')}
                </h3>

                {/* Category Selection */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">选择效果类型：</p>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          selectedCategory === cat.key
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black border-transparent'
                            : 'bg-white dark:bg-gray-950 border-black/10 dark:border-white/10 hover:border-orange-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl mb-1 block">{cat.icon}</span>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effect Selection - Show when category is selected */}
                {selectedCategory && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">选择具体效果：</p>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      {effectsByCategory.map((effect, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectTransformation(effect)}
                          className={`p-2 rounded-lg border transition-all duration-200 text-left ${
                            selectedTransformation?.title === effect.title
                              ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black border-transparent'
                              : 'bg-white dark:bg-gray-950 border-black/10 dark:border-white/10 hover:border-orange-500'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">{effect.icon}</span>
                            <span className="text-xs font-medium">{effect.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleBackToSelection}
                      className="mt-2 text-xs text-orange-500 hover:text-orange-600"
                    >
                      查看所有效果 →
                    </button>
                  </div>
                )}

                {/* Selected Effect Details */}
                {selectedTransformation && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                      <span className="material-symbols-outlined">{selectedTransformation.icon}</span>
                      {selectedTransformation.title}
                    </h4>
                    {selectedTransformation.prompt === 'CUSTOM' ? (
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={t('placeholder.customPrompt')}
                        rows={2}
                        className="w-full mt-2 p-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border border-black/20 dark:border-white/20 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-gray-500"
                      />
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedTransformation.prompt}</p>
                    )}
                  </div>
                )}
              </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-black/10 dark:border-white/10">
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`flex-1 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isGenerateDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black hover:from-orange-600 hover:to-yellow-500 shadow-lg shadow-orange-500/30'
              }`}
            >
              {isLoading ? t('actions.generating') : t('actions.generate')}
            </button>
          </div>
        </div>

        {/* Result Column */}
        <div className="flex flex-col gap-6 p-6 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-xl border border-black/10 dark:border-white/10 shadow-2xl shadow-black/20">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : generatedContent && generatedContent.imageUrl ? (
            <ResultDisplay
              content={generatedContent}
              onUseAsInput={handleUseResultAsInput}
              onImageClick={() => {}}
              originalImageUrl={imagePreviewUrl}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>{t('empty.hint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickProcessView;

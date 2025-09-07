import React, { useState, useCallback } from 'react';
import { useI18n } from '../i18n';
import { editImage, editImages } from '../services/geminiService';
import type { GeneratedContent, Transformation, UploadedImage } from '../types';
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
  const [isMultiMode, setIsMultiMode] = useState<boolean>(false);

  // Update selected transformation when preSelectedEffect changes
  React.useEffect(() => {
    if (preSelectedEffect) {
      setSelectedTransformation(preSelectedEffect);
    }
  }, [preSelectedEffect]);

  const switchToMulti = useCallback(() => {
    if (isMultiMode) return;
    let nextImages = images;
    if (imagePreviewUrl && selectedFile && images.length === 0) {
      const seeded: UploadedImage = { 
        id: `${Date.now()}-${Math.random()}`, 
        file: selectedFile, 
        dataUrl: imagePreviewUrl 
      };
      nextImages = [seeded];
      setImages(nextImages);
    }
    if (nextImages.length > 0) {
      setActiveIndex(0);
    } else {
      setActiveIndex(null);
    }
    setMaskDataUrl(null);
    setActiveTool('none');
    setGeneratedContent(null);
    setError(null);
    setIsMultiMode(true);
  }, [isMultiMode, imagePreviewUrl, selectedFile, images.length]);

  const switchToSingle = useCallback(() => {
    if (!isMultiMode) return;
    const idx = (activeIndex ?? 0);
    const src = images[idx];
    if (src) {
      setSelectedFile(src.file);
      setImagePreviewUrl(src.dataUrl);
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
    setIsMultiMode(false);
  }, [isMultiMode, images, activeIndex]);

  const handleSelectTransformation = (transformation: Transformation) => {
    setSelectedTransformation(transformation);
    setGeneratedContent(null);
    setError(null);
    if (transformation.prompt !== 'CUSTOM') {
      setCustomPrompt('');
    }
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
        if (!isMultiMode) {
          const nextActive = combined.length > 0 ? (prev.length === 0 ? 0 : activeIndex ?? 0) : null;
          setActiveIndex(nextActive);
          if (nextActive !== null) {
            setSelectedFile(combined[nextActive].file);
            setImagePreviewUrl(combined[nextActive].dataUrl);
          }
        } else {
          if (combined.length > 0 && (activeIndex === null || !imagePreviewUrl)) {
            setActiveIndex(0);
            setSelectedFile(combined[0].file);
            setImagePreviewUrl(combined[0].dataUrl);
          }
        }
        return combined;
      });
      setMaskDataUrl(null);
      setGeneratedContent(null);
      setError(null);
      setActiveTool('none');
    });
  }, [images.length, activeIndex, isMultiMode, imagePreviewUrl]);

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
      if (isMultiMode) {
        const prepared = images.map(img => {
          const mimeType = img.dataUrl.split(';')[0].split(':')[1] ?? 'image/png';
          const base64 = img.dataUrl.split(',')[1];
          return { base64, mimeType };
        });
        if (prepared.length === 0) {
          throw new Error(t('errors.uploadAndSelect'));
        }
        result = await editImages(prepared, promptToUse);
      } else {
        if (!imagePreviewUrl) throw new Error(t('errors.uploadAndSelect'));
        const mimeType = imagePreviewUrl.split(';')[0].split(':')[1] ?? 'image/png';
        const base64 = imagePreviewUrl.split(',')[1];
        const maskBase64 = maskDataUrl ? maskDataUrl.split(',')[1] : null;
        result = await editImage(base64, mimeType, promptToUse, maskBase64);
      }

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
  }, [selectedTransformation, customPrompt, isMultiMode, images, imagePreviewUrl, maskDataUrl, t, onEffectApplied]);

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
    } catch (err) {
      console.error("Failed to use image as input:", err);
      setError(t('errors.useAsInputFailed'));
    }
  }, [generatedContent, t]);

  const handleBackToSelection = () => {
    setSelectedTransformation(null);
  };

  const toggleMaskTool = () => {
    setActiveTool(current => (current === 'mask' ? 'none' : 'mask'));
  };

  const hasAnyInput = isMultiMode ? images.length > 0 : !!imagePreviewUrl;
  const isGenerateDisabled = !hasAnyInput || isLoading || 
    (selectedTransformation?.prompt === 'CUSTOM' && !customPrompt.trim());

  // Show effect selector if no transformation is selected
  if (!selectedTransformation) {
    return (
      <TransformationSelector 
        transformations={transformations} 
        onSelect={handleSelectTransformation} 
        hasPreviousResult={!!imagePreviewUrl}
      />
    );
  }

  // Main processing view
  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <button
          onClick={handleBackToSelection}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {t('actions.chooseAnotherEffect')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="flex flex-col gap-6 p-6 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-xl border border-black/10 dark:border-white/10 shadow-2xl shadow-black/20">
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1 text-orange-500 flex items-center gap-3">
                <span className="text-3xl material-symbols-outlined">{selectedTransformation.icon}</span>
                {selectedTransformation.title}
              </h2>
              {selectedTransformation.prompt === 'CUSTOM' ? (
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t('placeholder.customPrompt')}
                  rows={3}
                  className="w-full mt-2 p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-gray-500"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{selectedTransformation.prompt}</p>
              )}
            </div>
            
            {/* Mode Switch */}
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex rounded-md overflow-hidden border border-black/10 dark:border-white/10">
                <button
                  onClick={switchToSingle}
                  className={`px-3 py-1 text-sm transition-colors ${
                    !isMultiMode 
                      ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('upload.singleMode')}
                </button>
                <button
                  onClick={switchToMulti}
                  className={`px-3 py-1 text-sm transition-colors ${
                    isMultiMode 
                      ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100' 
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('upload.multipleMode')}
                </button>
              </div>
            </div>

            {/* Multi uploader */}
            {isMultiMode && (
              <ImageUploader
                images={images}
                onAdd={addImages}
                onRemove={removeImageAt}
                max={3}
                showSlots
              />
            )}

            {!isMultiMode && (
              <>
                <div className="mt-4" />
                <ImageEditorCanvas
                  imageUrl={imagePreviewUrl}
                  selectedFile={selectedFile}
                  activeTool={activeTool}
                  maskData={maskDataUrl}
                  onImageSelect={handleImageSelect}
                  onClearImage={handleClearImage}
                  onMaskUpdate={setMaskDataUrl}
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-black/10 dark:border-white/10">
            {!isMultiMode && (
              <button
                onClick={toggleMaskTool}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  activeTool === 'mask'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                disabled={!imagePreviewUrl}
              >
                <span className="material-symbols-outlined align-middle mr-1">brush</span>
                {t('actions.drawMask')}
              </button>
            )}
            
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

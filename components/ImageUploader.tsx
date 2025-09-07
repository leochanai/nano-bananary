import React, { useCallback } from 'react';
import { useI18n } from '../i18n';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  images: UploadedImage[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  max?: number; // default 3
  showSlots?: boolean; // show 3 labeled slots UI
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onAdd, onRemove, max = 3, showSlots = false }) => {
  const { t } = useI18n();

  const remaining = Math.max(0, max - images.length);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      const allowed = files.slice(0, remaining);
      onAdd(allowed);
    }
    e.currentTarget.value = '';
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    const files: File[] = dt && dt.files ? Array.from(dt.files) : [];
    const imageFiles = files.filter((f) => f.type?.startsWith('image/'));
    if (imageFiles.length) {
      const allowed = imageFiles.slice(0, remaining);
      onAdd(allowed);
    }
  }, [onAdd, remaining]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col gap-3" onDrop={onDrop} onDragOver={onDragOver}>
      {(images.length > 0 || showSlots) && (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: showSlots ? 3 : images.length }).map((_, idx) => {
            const img = images[idx];
            const has = Boolean(img);
            return (
              <div key={has ? img!.id : `slot-${idx}`} className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${has ? 'border-solid border-gray-300 dark:border-gray-600' : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'}`}>
                {has ? (
                  <img src={img!.dataUrl} alt={`uploaded-${idx}`} className="w-full h-full object-cover" />
                ) : (
                  <label className={`absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer w-full h-full ${images.length >= max ? 'pointer-events-none opacity-50' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.158 0h.008v.008h-.008V8.25z" /></svg>
                    <p className="mb-0 text-xs"><span className="font-semibold">{t('upload.clickToUpload')}</span> {t('upload.orDragAndDrop')}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onAdd([file]);
                      e.currentTarget.value = '';
                    }} />
                  </label>
                )}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] rounded bg-black/50 text-white">{t('upload.slotLabel', { index: idx + 1 })}</div>
              {has && (<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 pointer-events-none transition-colors"></div>)}
              {has && (
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRemove(idx)}
                    className="p-1 rounded bg-black/50 text-white hover:bg-red-600"
                    title={t('upload.removeImage')}
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              )}
              {/* No active/select controls in multi-image mode */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;



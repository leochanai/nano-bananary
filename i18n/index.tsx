import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type SupportedLanguage = 'zh' | 'en';

type TranslationLeaf = string | Record<string, unknown>;

type Resources = Record<SupportedLanguage, Record<string, TranslationLeaf>>;

const RESOURCES: Resources = {
  zh: {
    common: {
      result: '结果',
      original: '原图',
      generated: '生成图',
      close: '关闭',
      unknown: '未知',
    },
    actions: {
      chooseAnotherEffect: '选择其他效果',
      drawMask: '绘制遮罩',
      generating: '正在生成…',
      generate: '生成图片',
      downloadImage: '下载图片',
      downloadComparison: '下载对比图',
      useAsInput: '用作输入',
    },
    selector: {
      chooseEffect: '选择一个效果',
      hasPrevious: '已加载上次的结果。请选择新的效果进行应用。',
      initial: '在下方选择一个创意效果。下一步会提示你上传图片。',
    },
    placeholder: {
      customPrompt: "例如：'让天空变为绚丽的日落' 或 '在水面上添加一艘小红船'",
    },
    empty: {
      hint: '你生成的图片将展示在这里。',
    },
    error: {
      title: '发生错误',
    },
    errors: {
      uploadAndSelect: '请先上传图片并选择一个效果。',
      enterPrompt: '请输入你希望看到的修改描述。',
      unknown: '发生未知错误。',
      useAsInputFailed: '无法将生成的图片用作新的输入。',
    },
    upload: {
      clickToUpload: '点击上传',
      orDragAndDrop: '或拖拽到此处',
      removeImage: '移除图片',
    },
    mask: {
      helper: '在图片上绘制区域以进行局部编辑。',
      brushSize: '画笔大小',
      undo: '撤销',
      clearMask: '清除遮罩',
    },
    view: {
      result: '仅生成图',
      sideBySide: '并排对比',
      slider: '滑块对比',
    },
    loading: {
      title: '正在为你生成佳作…',
      subtitle: '这可能需要一点时间。',
    },
    preview: {
      closeAria: '关闭预览',
      alt: '生成结果预览',
    },
    modal: {
      downloadImage: '下载图片',
    },
  },
  en: {
    common: {
      result: 'Result',
      original: 'Original',
      generated: 'Generated',
      close: 'Close',
      unknown: 'Unknown',
    },
    actions: {
      chooseAnotherEffect: 'Choose Another Effect',
      drawMask: 'Draw Mask',
      generating: 'Generating…',
      generate: 'Generate Image',
      downloadImage: 'Download Image',
      downloadComparison: 'Download Comparison',
      useAsInput: 'Use as Input',
    },
    selector: {
      chooseEffect: 'Choose an Effect',
      hasPrevious: 'Your previous result is loaded. Select a new transformation to apply.',
      initial: "Select a creative transformation below. You'll be asked to upload your image on the next step.",
    },
    placeholder: {
      customPrompt: "e.g., 'make the sky a vibrant sunset' or 'add a small red boat on the water'",
    },
    empty: {
      hint: 'Your generated image will appear here.',
    },
    error: {
      title: 'An Error Occurred',
    },
    errors: {
      uploadAndSelect: 'Please upload an image and select an effect first.',
      enterPrompt: 'Please enter a prompt describing the change you want to see.',
      unknown: 'An unknown error occurred.',
      useAsInputFailed: 'Could not use the generated image as a new input.',
    },
    upload: {
      clickToUpload: 'Click to upload',
      orDragAndDrop: 'or drag and drop',
      removeImage: 'Remove image',
    },
    mask: {
      helper: 'Draw on the image to create a mask for localized edits.',
      brushSize: 'Brush Size',
      undo: 'Undo',
      clearMask: 'Clear Mask',
    },
    view: {
      result: 'Result',
      sideBySide: 'Side-by-side',
      slider: 'Slider',
    },
    loading: {
      title: 'Generating your masterpiece...',
      subtitle: 'This can sometimes take a moment.',
    },
    preview: {
      closeAria: 'Close preview',
      alt: 'Generated result preview',
    },
    modal: {
      downloadImage: 'Download Image',
    },
  },
};

function getNested(resource: Record<string, TranslationLeaf>, path: string): string | undefined {
  const parts = path.split('.');
  let current: any = resource;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, TranslationLeaf>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(.*?)\}/g, (_, key) => String(params[key.trim()] ?? ''));
}

interface I18nContextValue {
  lang: SupportedLanguage;
  setLang: (next: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCAL_STORAGE_KEY = 'app.lang';

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLang?: SupportedLanguage }> = ({ children, initialLang }) => {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem(LOCAL_STORAGE_KEY) as SupportedLanguage | null) : null;
    return saved ?? initialLang ?? 'zh';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: SupportedLanguage) => {
    setLangState(next);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const value = getNested(RESOURCES[lang], key) ?? getNested(RESOURCES.en, key) ?? key;
    return interpolate(value, params);
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}



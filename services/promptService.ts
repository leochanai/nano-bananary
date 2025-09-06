import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupportedLanguage } from '../i18n';
import type { TransformationCategory } from '../types';

export interface PromptEntry {
  key: string;
  en_name: string;
  zh_name: string;
  en_prompt: string;
  zh_prompt: string;
  icon?: string;
  type?: TransformationCategory;
}

type PromptMap = Record<string, Omit<PromptEntry, 'key'>>;

// 全局事件名：用于在不同 hook 实例之间同步 prompts 更改
const PROMPTS_CHANGED_EVENT = 'promptsChanged';

function dispatchPromptsChanged() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(PROMPTS_CHANGED_EVENT));
    } catch {}
  }
}

async function getJson<T = any>(url: string): Promise<T> {
  // 加上时间戳避免缓存，并显式禁用缓存
  const antiCacheUrl = url + (url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
  const res = await fetch(antiCacheUrl, { headers: { 'Accept': 'application/json' }, cache: 'no-store' as RequestCache });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return await res.json();
}

async function postJson<T = any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return await res.json();
}

async function deleteJson<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
  return await res.json();
}

export async function loadDefaultPromptMap(): Promise<PromptMap> {
  return await getJson<PromptMap>('/api/prompts/default');
}

export async function loadCustomPromptMap(): Promise<PromptMap> {
  return await getJson<PromptMap>('/api/prompts/custom');
}

export async function upsertCustomPrompt(params: { key?: string; name: string; prompt: string; icon?: string; type?: TransformationCategory }): Promise<{ key: string }> {
  const body = {
    key: params.key,
    en_name: params.name,
    zh_name: params.name,
    en_prompt: params.prompt,
    zh_prompt: params.prompt,
    icon: params.icon,
    type: params.type,
  } as const;
  const resp = await postJson<{ ok: boolean; key: string }>('/api/prompts/custom', body);
  if (!resp.ok) throw new Error('Failed to upsert custom prompt');
  return { key: resp.key };
}

export async function deleteCustomPrompt(key: string): Promise<void> {
  const resp = await deleteJson<{ ok: boolean }>(`/api/prompts/custom/${encodeURIComponent(key)}`);
  if (!resp.ok) throw new Error('Failed to delete custom prompt');
}

export async function clearAllCustomPrompts(): Promise<void> {
  const resp = await deleteJson<{ ok: boolean }>(`/api/prompts/custom`);
  if (!resp.ok) throw new Error('Failed to clear custom prompts');
}

export interface MergedPromptItem {
  key: string;
  title: string;
  prompt: string;
  icon?: string;
  type?: TransformationCategory;
  isBuiltin: boolean;
  isOverridden: boolean;
}

export function mergePromptMaps(defaultMap: PromptMap, customMap: PromptMap, lang: SupportedLanguage): MergedPromptItem[] {
  const items: MergedPromptItem[] = [];
  const allKeys = new Set<string>([...Object.keys(defaultMap), ...Object.keys(customMap)]);
  for (const key of allKeys) {
    const d = defaultMap[key];
    const c = customMap[key];
    const src = c || d;
    if (!src) continue;
    const title = (lang === 'zh' ? src.zh_name : src.en_name) || (src.en_name || src.zh_name) || key;
    let prompt = (lang === 'zh' ? src.zh_prompt : src.en_prompt) || (src.en_prompt || src.zh_prompt) || '';
    if (key === 'custom_prompt') {
      prompt = 'CUSTOM';
    }
    items.push({ key, title, prompt, icon: (c?.icon || d?.icon), type: (c?.type || d?.type), isBuiltin: !!d, isOverridden: !!(d && c) });
  }
  // 稳定排序：先 custom_prompt，再内置（字母序），最后纯自定义（字母序）
  items.sort((a, b) => {
    if (a.key === 'custom_prompt') return -1;
    if (b.key === 'custom_prompt') return 1;
    if (a.isBuiltin !== b.isBuiltin) return a.isBuiltin ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  return items;
}

export function usePromptEffects(lang: SupportedLanguage) {
  const [defaultMap, setDefaultMap] = useState<PromptMap>({});
  const [customMap, setCustomMap] = useState<PromptMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, c] = await Promise.all([loadDefaultPromptMap(), loadCustomPromptMap()]);
      setDefaultMap(d || {});
      setCustomMap(c || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // 监听来自其他组件/窗口的 prompts 变更事件，以及开发环境的 HMR 自定义事件
  useEffect(() => {
    const onChanged = () => { reload(); };
    if (typeof window !== 'undefined') {
      window.addEventListener(PROMPTS_CHANGED_EVENT, onChanged as EventListener);
    }
    // Vite 开发环境下通过自定义 HMR 事件触发
    try {
      const meta: any = (import.meta as any);
      if (meta && meta.hot && typeof meta.hot.on === 'function') {
        meta.hot.on('prompts-changed', onChanged);
      }
    } catch {}
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PROMPTS_CHANGED_EVENT, onChanged as EventListener);
      }
      try {
        const meta: any = (import.meta as any);
        if (meta && meta.hot && typeof meta.hot.off === 'function') {
          meta.hot.off('prompts-changed', onChanged);
        }
      } catch {}
    };
  }, [reload]);

  const merged = useMemo(() => mergePromptMaps(defaultMap, customMap, lang), [defaultMap, customMap, lang]);

  const create = useCallback(async (name: string, prompt: string, icon?: string, type?: TransformationCategory) => {
    const resp = await upsertCustomPrompt({ name, prompt, icon, type });
    await reload();
    dispatchPromptsChanged();
    return resp.key;
  }, [reload]);

  const update = useCallback(async (key: string, name: string, prompt: string, icon?: string, type?: TransformationCategory) => {
    await upsertCustomPrompt({ key, name, prompt, icon, type });
    await reload();
    dispatchPromptsChanged();
  }, [reload]);

  const remove = useCallback(async (key: string) => {
    await deleteCustomPrompt(key);
    await reload();
    dispatchPromptsChanged();
  }, [reload]);

  const clearAll = useCallback(async () => {
    await clearAllCustomPrompts();
    await reload();
    dispatchPromptsChanged();
  }, [reload]);

  return { loading, error, merged, defaultMap, customMap, reload, create, update, remove, clearAll };
}



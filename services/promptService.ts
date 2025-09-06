import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupportedLanguage } from '../i18n';

export interface PromptEntry {
  key: string;
  en_name: string;
  zh_name: string;
  en_prompt: string;
  zh_prompt: string;
}

type PromptMap = Record<string, Omit<PromptEntry, 'key'>>;

async function getJson<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
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

export async function upsertCustomPrompt(params: { key?: string; name: string; prompt: string }): Promise<{ key: string }> {
  const body = {
    key: params.key,
    en_name: params.name,
    zh_name: params.name,
    en_prompt: params.prompt,
    zh_prompt: params.prompt,
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
    items.push({ key, title, prompt, isBuiltin: !!d, isOverridden: !!(d && c) });
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

  const merged = useMemo(() => mergePromptMaps(defaultMap, customMap, lang), [defaultMap, customMap, lang]);

  const create = useCallback(async (name: string, prompt: string) => {
    const resp = await upsertCustomPrompt({ name, prompt });
    await reload();
    return resp.key;
  }, [reload]);

  const update = useCallback(async (key: string, name: string, prompt: string) => {
    await upsertCustomPrompt({ key, name, prompt });
    await reload();
  }, [reload]);

  const remove = useCallback(async (key: string) => {
    await deleteCustomPrompt(key);
    await reload();
  }, [reload]);

  const clearAll = useCallback(async () => {
    await clearAllCustomPrompts();
    await reload();
  }, [reload]);

  return { loading, error, merged, defaultMap, customMap, reload, create, update, remove, clearAll };
}



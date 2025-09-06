import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TransformationCategory } from '../types';

export interface UserEffect {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  category: TransformationCategory;
}

const LS_KEY = 'app.userEffects.v1';
const CUSTOM_EVENT = 'userEffectsChanged';

function safeParse(json: string | null): UserEffect[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.filter((e) => e && typeof e === 'object');
    }
  } catch {}
  return [];
}

export function loadEffects(): UserEffect[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
    return safeParse(raw);
  } catch {
    return [];
  }
}

function persist(effects: UserEffect[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(effects));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CUSTOM_EVENT));
    }
  } catch {}
}

function generateId(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return 'ef_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

export function createEffect(input: Omit<UserEffect, 'id'>): UserEffect {
  const next: UserEffect = { id: generateId(), ...input };
  const list = loadEffects();
  list.push(next);
  persist(list);
  return next;
}

export function updateEffect(id: string, patch: Partial<Omit<UserEffect, 'id'>>): UserEffect | null {
  const list = loadEffects();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch } as UserEffect;
  list[idx] = updated;
  persist(list);
  return updated;
}

export function deleteEffect(id: string): boolean {
  const list = loadEffects();
  const next = list.filter((e) => e.id !== id);
  const changed = next.length !== list.length;
  if (changed) persist(next);
  return changed;
}

export function replaceEffects(effects: UserEffect[]) {
  persist(effects);
}

export function useUserEffects() {
  const [effects, setEffects] = useState<UserEffect[]>(() => loadEffects());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== LS_KEY) return;
      setEffects(loadEffects());
    };
    const onCustom = () => setEffects(loadEffects());
    window.addEventListener('storage', onStorage);
    window.addEventListener(CUSTOM_EVENT, onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CUSTOM_EVENT, onCustom as EventListener);
    };
  }, []);

  const create = useCallback((input: Omit<UserEffect, 'id'>) => {
    const created = createEffect(input);
    setEffects((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<UserEffect, 'id'>>) => {
    const updated = updateEffect(id, patch);
    if (updated) setEffects((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const remove = useCallback((id: string) => {
    const ok = deleteEffect(id);
    if (ok) setEffects((prev) => prev.filter((e) => e.id !== id));
    return ok;
  }, []);

  const clearAll = useCallback(() => {
    replaceEffects([]);
    setEffects([]);
  }, []);

  return useMemo(() => ({ effects, create, update, remove, clearAll }), [effects, create, update, remove, clearAll]);
}



import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TransformationCategory } from '../types';

// 仅存储到本地，供 EffectManager 与 useTransformations 共享
const DISABLED_LS_KEY = 'app.disabledBuiltinKeys.v1';
const OVERRIDES_LS_KEY = 'app.builtinOverrides.v1';
const CUSTOM_EVENT = 'builtinEffectsChanged';

export interface BuiltinOverride {
  title?: string;
  prompt?: string;
  icon?: string;
  category?: TransformationCategory;
}

type OverridesMap = Record<string, BuiltinOverride>;

function safeParseArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function safeParseObject(json: string | null): OverridesMap {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadDisabled(): string[] {
  try {
    return typeof window !== 'undefined' ? safeParseArray(localStorage.getItem(DISABLED_LS_KEY)) : [];
  } catch {
    return [];
  }
}

function loadOverrides(): OverridesMap {
  try {
    return typeof window !== 'undefined' ? safeParseObject(localStorage.getItem(OVERRIDES_LS_KEY)) : {};
  } catch {
    return {};
  }
}

function persistDisabled(keys: string[]) {
  try {
    localStorage.setItem(DISABLED_LS_KEY, JSON.stringify(keys));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CUSTOM_EVENT));
  } catch {}
}

function persistOverrides(map: OverridesMap) {
  try {
    localStorage.setItem(OVERRIDES_LS_KEY, JSON.stringify(map));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CUSTOM_EVENT));
  } catch {}
}

export function useBuiltinEffects() {
  const [disabledKeys, setDisabledKeys] = useState<string[]>(() => loadDisabled());
  const [overrides, setOverrides] = useState<OverridesMap>(() => loadOverrides());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || (e.key !== DISABLED_LS_KEY && e.key !== OVERRIDES_LS_KEY)) return;
      setDisabledKeys(loadDisabled());
      setOverrides(loadOverrides());
    };
    const onCustom = () => {
      setDisabledKeys(loadDisabled());
      setOverrides(loadOverrides());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(CUSTOM_EVENT, onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CUSTOM_EVENT, onCustom as EventListener);
    };
  }, []);

  const disable = useCallback((key: string) => {
    setDisabledKeys((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      persistDisabled(next);
      return next;
    });
  }, []);

  const enable = useCallback((key: string) => {
    setDisabledKeys((prev) => {
      const next = prev.filter((k) => k !== key);
      persistDisabled(next);
      return next;
    });
  }, []);

  const setOverride = useCallback((key: string, patch: BuiltinOverride) => {
    setOverrides((prev) => {
      const next = { ...prev, [key]: { ...(prev[key] || {}), ...patch } };
      persistOverrides(next);
      return next;
    });
  }, []);

  const removeOverride = useCallback((key: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      persistOverrides(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    persistDisabled([]);
    persistOverrides({});
    setDisabledKeys([]);
    setOverrides({});
  }, []);

  return useMemo(
    () => ({ disabledKeys, overrides, disable, enable, setOverride, removeOverride, clearAll }),
    [disabledKeys, overrides, disable, enable, setOverride, removeOverride, clearAll]
  );
}



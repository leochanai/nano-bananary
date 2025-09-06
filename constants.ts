import type { Transformation } from './types';
import { useI18n } from './i18n';
import { usePromptEffects } from './services/promptService';
import { useBuiltinEffects } from './services/builtinStore';

export function useTransformations(): Transformation[] {
  const { lang } = useI18n();
  const { merged } = usePromptEffects(lang);
  const { disabledKeys } = useBuiltinEffects();

  // 将 JSON 合并后的项映射为 Transformation。无 icon 与 category 时使用默认。
  return merged
    .filter((item) => !(item.isBuiltin && disabledKeys.includes(item.key)))
    .map((item) => ({
      title: item.title,
      prompt: item.prompt,
      icon: item.icon || (item.key === 'custom_prompt' ? 'edit' : 'auto_awesome'),
      category: item.type || (item.key === 'custom_prompt' ? 'custom' : undefined),
    }));
}

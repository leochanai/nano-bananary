
import React from 'react';
import { useI18n } from '../i18n';
import type { Transformation } from '../types';

interface TransformationSelectorProps {
  transformations: Transformation[];
  onSelect: (transformation: Transformation) => void;
  hasPreviousResult: boolean;
}

const TransformationSelector: React.FC<TransformationSelectorProps> = ({ transformations, onSelect, hasPreviousResult }) => {
  const { t } = useI18n();
  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-4 text-orange-500">{t('selector.chooseEffect')}</h2>
      <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        {hasPreviousResult 
          ? t('selector.hasPrevious')
          : t('selector.initial')
        }
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {transformations.map((trans, index) => (
          <button
            key={index}
            onClick={() => onSelect(trans)}
            className="group flex flex-col items-center justify-center text-center p-4 aspect-square bg-white dark:bg-gray-950 rounded-xl border border-black/10 dark:border-white/10 hover:border-orange-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black focus:ring-orange-500"
          >
            <span className="text-4xl mb-2 transition-transform duration-200 group-hover:scale-110 material-symbols-outlined">{trans.icon}</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-200">{trans.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransformationSelector;

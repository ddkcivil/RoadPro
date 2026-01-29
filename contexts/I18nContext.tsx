import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getTranslation, getCurrentLanguage, setCurrentLanguage } from '../utils/formatting/i18nUtils';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return getCurrentLanguage();
  });

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    return getTranslation(key, language, params);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
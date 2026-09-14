import { create } from 'zustand';
import { dictionaries, type Language } from '../locales';

interface LanguageState {
  language: Language;
  hasChosenLanguage: boolean;
  isGatewayOpen: boolean;
  setLanguage: (lang: Language) => void;
  openGateway: () => void;
  closeGateway: () => void;
  t: (keyPath: string, fallbackOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY_LANG = 'jemluiqa_lang';
const STORAGE_KEY_CHOSEN = 'jemluiqa_has_chosen_lang';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'id';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    if (saved === 'en' || saved === 'id') return saved;
  } catch (e) {
    // ignore
  }
  return 'id';
}

function getInitialHasChosen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_KEY_CHOSEN) === 'true';
  } catch (e) {
    return true;
  }
}

export const useLanguageStore = create<LanguageState>((set, get) => {
  const initialLang = getInitialLanguage();
  const initialChosen = getInitialHasChosen();

  return {
    language: initialLang,
    hasChosenLanguage: initialChosen,
    isGatewayOpen: !initialChosen,

    setLanguage: (lang: Language) => {
      try {
        localStorage.setItem(STORAGE_KEY_LANG, lang);
        localStorage.setItem(STORAGE_KEY_CHOSEN, 'true');
      } catch (e) {
        // ignore
      }
      set({
        language: lang,
        hasChosenLanguage: true,
        isGatewayOpen: false,
      });
    },

    openGateway: () => set({ isGatewayOpen: true }),
    closeGateway: () => {
      try {
        localStorage.setItem(STORAGE_KEY_CHOSEN, 'true');
      } catch (e) {
        // ignore
      }
      set({ isGatewayOpen: false, hasChosenLanguage: true });
    },

    t: (keyPath: string, fallbackOrParams?: string | Record<string, string | number>, paramsObj?: Record<string, string | number>) => {
      const { language } = get();
      const dict = dictionaries[language] || dictionaries.id;

      let fallback: string | undefined;
      let params: Record<string, string | number> | undefined;

      if (typeof fallbackOrParams === 'string') {
        fallback = fallbackOrParams;
        params = paramsObj;
      } else if (typeof fallbackOrParams === 'object') {
        params = fallbackOrParams;
      }

      // Resolve dot notation path e.g. "catalog.showing_results"
      const keys = keyPath.split('.');
      let current: any = dict;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      // If not found in current language, try 'id' dictionary
      if (typeof current !== 'string' && language !== 'id') {
        let fallbackDict: any = dictionaries.id;
        for (const k of keys) {
          if (fallbackDict && typeof fallbackDict === 'object' && k in fallbackDict) {
            fallbackDict = fallbackDict[k];
          } else {
            fallbackDict = undefined;
            break;
          }
        }
        if (typeof fallbackDict === 'string') {
          current = fallbackDict;
        }
      }

      let result = typeof current === 'string' ? current : (fallback || keyPath);

      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, val]) => {
          result = (result as string).replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }

      return result;
    },
  };
});

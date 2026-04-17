import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("app_locale");
    if (stored && (stored === "fr" || stored === "en" || stored === "ar")) return stored;
    return "fr";
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("app_locale", l);
  };

  // RTL support
  useEffect(() => {
    const html = document.documentElement;
    if (locale === "ar") {
      html.setAttribute("dir", "rtl");
      html.setAttribute("lang", "ar");
    } else {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", locale);
    }
  }, [locale]);

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations.fr[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

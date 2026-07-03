"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const LANG_STORAGE_KEY = "invoice_lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      setLangState(stored);
    }
  }, []);

  const setLang = (newLang) => {
    const nextLang = newLang === "ar" ? "ar" : "en";
    setLangState(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
  };

  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRtl, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

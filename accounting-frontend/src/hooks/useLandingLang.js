"use client";

import { useEffect, useState } from "react";
import { t as translate } from "@/locales/landing";

const STORAGE_KEY = "invoice_lang";

export default function useLandingLang() {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ar" || stored === "en") {
        setLangState(stored);
        // Sync document element attributes
        document.documentElement.lang = stored;
        document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
        return;
      }

      const pageLang = document.documentElement.lang;
      if (pageLang === "ar") {
        setLangState("ar");
        document.documentElement.dir = "rtl";
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const setLang = (nextLang) => {
    const normalized = nextLang === "ar" ? "ar" : "en";
    localStorage.setItem(STORAGE_KEY, normalized);
    setLangState(normalized);
    
    // Update document attributes dynamically
    document.documentElement.lang = normalized;
    document.documentElement.dir = normalized === "ar" ? "rtl" : "ltr";
  };

  return {
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    isRtl: lang === "ar",
    setLang,
    toggleLang: () => setLang(lang === "ar" ? "en" : "ar"),
    t: (key) => translate(key, lang),
  };
}

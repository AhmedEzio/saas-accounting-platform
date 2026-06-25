"use client";

import { useEffect, useState } from "react";
import { t as translate } from "@/locales/invoices";

const STORAGE_KEY = "invoice_lang";

export default function useLang() {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      setLangState(stored);
      return;
    }

    const pageLang = document.documentElement.lang;
    if (pageLang === "ar") setLangState("ar");
  }, []);

  const setLang = (nextLang) => {
    const normalized = nextLang === "ar" ? "ar" : "en";
    localStorage.setItem(STORAGE_KEY, normalized);
    setLangState(normalized);
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

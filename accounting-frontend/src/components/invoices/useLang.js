"use client";

import { useLanguage } from "@/context/LanguageContext";
import { t as translate } from "@/locales/invoices";

export default function useLang() {
  const { lang, setLang, isRtl, dir } = useLanguage();

  return {
    lang,
    dir,
    isRtl,
    setLang,
    toggleLang: () => setLang(lang === "ar" ? "en" : "ar"),
    t: (key) => translate(key, lang),
  };
}

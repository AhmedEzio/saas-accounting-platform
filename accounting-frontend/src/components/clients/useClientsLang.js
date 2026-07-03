"use client";

import { useCallback } from "react";
import { t as translate } from "@/locales/clients";
import { useLanguage } from "@/context/LanguageContext";

export default function useClientsLang() {
  const { lang, setLang, isRtl, dir } = useLanguage();
  const t = useCallback((key) => translate(key, lang), [lang]);

  return {
    lang,
    setLang,
    dir,
    isRtl,
    t,
  };
}

"use client";

import { useCallback } from "react";
import { t as translate } from "@/locales/overview";
import { useLanguage } from "@/context/LanguageContext";

export default function useOverviewLang() {
  const { lang, setLang, isRtl, dir } = useLanguage();
  const t = useCallback((key) => translate(key, lang), [lang]);

  return {
    lang,
    dir,
    isRtl,
    t,
    setLang,
  };
}

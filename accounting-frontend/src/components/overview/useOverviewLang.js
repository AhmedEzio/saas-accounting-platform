"use client";

import { useCallback } from "react";
import { t as translate } from "@/locales/overview";

export default function useOverviewLang(lang) {
  const normalized = lang === "ar" ? "ar" : "en";
  const t = useCallback((key) => translate(key, normalized), [normalized]);

  return {
    lang: normalized,
    dir: normalized === "ar" ? "rtl" : "ltr",
    isRtl: normalized === "ar",
    t,
  };
}

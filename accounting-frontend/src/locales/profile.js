export const translations = {
  "profile.updated": {
    en: "Profile updated successfully",
    ar: "تم تحديث الملف الشخصي بنجاح",
  },
  "profile.updateFailed": {
    en: "Failed to update profile",
    ar: "فشل تحديث الملف الشخصي",
  },
  "profile.nameRequired": {
    en: "Name is required",
    ar: "الاسم مطلوب",
  },
  "profile.invalidEmail": {
    en: "Invalid email address",
    ar: "البريد الإلكتروني غير صالح",
  },
  "profile.emailInUse": {
    en: "Email is already in use",
    ar: "البريد الإلكتروني مستخدم بالفعل",
  },
};

const backendMessageToKey = {
  "Profile updated successfully": "profile.updated",
  "Name is required": "profile.nameRequired",
  "Invalid email address": "profile.invalidEmail",
  "Email is already in use": "profile.emailInUse",
};

export function t(key, lang = "en") {
  const normalizedLang = lang === "ar" ? "ar" : "en";
  return translations[key]?.[normalizedLang] ?? translations[key]?.en ?? key;
}

export function resolveProfileErrorMessage(message, lang = "en") {
  const key = backendMessageToKey[message];
  if (key) return t(key, lang);
  return t("profile.updateFailed", lang);
}

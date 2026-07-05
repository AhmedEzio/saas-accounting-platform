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
  "profile.signOut": {
    en: "Sign Out",
    ar: "تسجيل الخروج",
  },
  "profile.role.admin": {
    en: "Admin",
    ar: "مسؤول النظام",
  },
  "profile.role.accountant": {
    en: "Accountant",
    ar: "محاسب",
  },
  "profile.memberSince": {
    en: "Member since",
    ar: "عضو منذ",
  },
  "profile.tab.info": {
    en: "Personal Info",
    ar: "المعلومات الشخصية",
  },
  "profile.tab.security": {
    en: "Security",
    ar: "الأمان",
  },
  "profile.info.title": {
    en: "Personal Information",
    ar: "المعلومات الشخصية",
  },
  "profile.info.fullName": {
    en: "Full Name",
    ar: "الاسم الكامل",
  },
  "profile.info.workEmail": {
    en: "Work Email",
    ar: "بريد العمل",
  },
  "profile.info.role": {
    en: "Role",
    ar: "الدور",
  },
  "profile.info.roleHint": {
    en: "Role can only be changed by an admin.",
    ar: "يمكن تغيير الدور بواسطة مسؤول النظام فقط.",
  },
  "profile.info.save": {
    en: "Save Changes",
    ar: "حفظ التغييرات",
  },
  "profile.security.title": {
    en: "Change Password",
    ar: "تغيير كلمة المرور",
  },
  "profile.security.subtitle": {
    en: "Your password must be at least 8 characters.",
    ar: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
  },
  "profile.security.current": {
    en: "Current Password",
    ar: "كلمة المرور الحالية",
  },
  "profile.security.currentPlaceholder": {
    en: "Enter current password",
    ar: "أدخل كلمة المرور الحالية",
  },
  "profile.security.new": {
    en: "New Password",
    ar: "كلمة المرور الجديدة",
  },
  "profile.security.newPlaceholder": {
    en: "Enter new password",
    ar: "أدخل كلمة المرور الجديدة",
  },
  "profile.security.confirm": {
    en: "Confirm New Password",
    ar: "تأكيد كلمة المرور الجديدة",
  },
  "profile.security.confirmPlaceholder": {
    en: "Repeat new password",
    ar: "أعد كتابة كلمة المرور الجديدة",
  },
  "profile.security.update": {
    en: "Update Password",
    ar: "تحديث كلمة المرور",
  },
  "profile.security.alert": {
    en: "Password change endpoint coming soon.",
    ar: "ميزة تغيير كلمة المرور ستتوفر قريباً.",
  },
  "profile.danger.title": {
    en: "Danger Zone",
    ar: "منطقة الخطر",
  },
  "profile.danger.subtitle": {
    en: "Once you sign out, you will need your credentials to access the platform again.",
    ar: "بمجرد تسجيل الخروج، ستحتاج إلى بيانات الاعتماد الخاصة بك للوصول إلى المنصة مرة أخرى.",
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

"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ar = {
  welcomeBack: "مرحباً بعودتك",
  signInSubtitle: "سجّل دخولك للوصول إلى منصتك المالية.",
  workEmail: "البريد الإلكتروني",
  emailPlaceholder: "name@company.com",
  password: "كلمة المرور",
  passwordPlaceholder: "••••••••",
  rememberMe: "تذكّرني",
  forgotPassword: "نسيت كلمة المرور؟",
  signIn: "تسجيل الدخول",
  orContinueWith: "أو تابع بـ",
  noAccount: "ليس لديك حساب؟",
  requestAccess: "طلب الوصول",
  privacyPolicy: "سياسة الخصوصية",
  termsOfService: "شروط الخدمة",
  createAccount: "إنشاء حساب",
  registerSubtitle: "ابدأ إدارة ذكاءك المالي الآن.",
  fullName: "الاسم الكامل",
  namePlaceholder: "محمد أحمد",
  minChars: "8 أحرف على الأقل",
  confirmPassword: "تأكيد كلمة المرور",
  repeatPassword: "أعد كتابة كلمة المرور",
  strength: "القوة",
  weak: "ضعيفة",
  fair: "مقبولة",
  good: "جيدة",
  strong: "قوية",
  alreadyAccount: "لديك حساب بالفعل؟",
  personalInfo: "المعلومات الشخصية",
  security: "الأمان",
  role: "الدور الوظيفي",
  roleNote: "لا يمكن تغيير الدور إلا من قِبل المسؤول.",
  saveChanges: "حفظ التغييرات",
  memberSince: "عضو منذ",
  signOut: "تسجيل الخروج",
  changePassword: "تغيير كلمة المرور",
  passwordNote: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
  currentPassword: "كلمة المرور الحالية",
  currentPlaceholder: "أدخل كلمة المرور الحالية",
  newPassword: "كلمة المرور الجديدة",
  newPlaceholder: "أدخل كلمة المرور الجديدة",
  confirmNew: "تأكيد كلمة المرور الجديدة",
  repeatNew: "أعد كلمة المرور الجديدة",
  updatePassword: "تحديث كلمة المرور",
  dangerZone: "منطقة الخطر",
  dangerNote: "بعد تسجيل الخروج ستحتاج إلى بياناتك للدخول مرة أخرى.",
  admin: "مسؤول",
  accountant: "محاسب",
  fillAll: "يرجى ملء جميع الحقول.",
  invalidLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  registerFailed: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
  minPassword: "كلمة المرور يجب أن تكون 8 أحرف على الأقل.",
  passwordMatch: "كلمتا المرور غير متطابقتين.",
  nameEmailRequired: "الاسم والبريد الإلكتروني مطلوبان.",
  updateFailed: "فشل التحديث. حاول مرة أخرى.",
  profileUpdated: "تم تحديث الملف الشخصي بنجاح.",
  resetPassword: "إعادة تعيين كلمة المرور",
  resetSubtitle: "أدخلي كلمة المرور الجديدة للوصول إلى حسابك مرة أخرى.",
  show: "إظهار",
  hide: "إخفاء",
  resetting: "جارٍ إعادة التعيين...",
  backToLogin: "العودة إلى تسجيل الدخول",
  passwordResetSuccess:
    "تمت إعادة تعيين كلمة المرور بنجاح. جارٍ التحويل إلى الملف الشخصي...",
  invalidResetLink:
    "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
  forgotPasswordSubtitle:
    "أدخلي بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.",
  sendResetLink: "إرسال رابط إعادة التعيين",
  sending: "جارٍ الإرسال...",
  enterEmail: "يرجى إدخال البريد الإلكتروني",
  email: "البريد الإلكتروني",
  resetLinkSent:
    "إذا كان البريد الإلكتروني موجودًا، فسيتم إرسال رابط إعادة تعيين كلمة المرور.",
  resetLinkCreated: "تم إنشاء رابط إعادة التعيين.",
  somethingWentWrong: "حدث خطأ ما. حاول مرة أخرى.",
};

const en = {
  welcomeBack: "Welcome Back",
  signInSubtitle: "Sign in to access your financial intelligence.",
  workEmail: "Work Email",
  emailPlaceholder: "name@company.com",
  password: "Password",
  passwordPlaceholder: "••••••••",
  rememberMe: "Remember me",
  forgotPassword: "Forgot Password?",
  signIn: "Sign In",
  orContinueWith: "OR CONTINUE WITH",
  noAccount: "Don't have an account?",
  requestAccess: "Request Access",
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  createAccount: "Create Account",
  registerSubtitle: "Start managing your financial intelligence.",
  fullName: "Full Name",
  namePlaceholder: "John Smith",
  minChars: "Min. 8 characters",
  confirmPassword: "Confirm Password",
  repeatPassword: "Repeat your password",
  strength: "Strength",
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
  alreadyAccount: "Already have an account?",
  personalInfo: "Personal Information",
  security: "Security",
  role: "Role",
  roleNote: "Role can only be changed by an admin.",
  saveChanges: "Save Changes",
  memberSince: "Member since",
  signOut: "Sign Out",
  changePassword: "Change Password",
  passwordNote: "Your password must be at least 8 characters.",
  currentPassword: "Current Password",
  currentPlaceholder: "Enter current password",
  newPassword: "New Password",
  newPlaceholder: "Enter new password",
  confirmNew: "Confirm New Password",
  repeatNew: "Repeat new password",
  updatePassword: "Update Password",
  dangerZone: "Danger Zone",
  dangerNote:
    "Once you sign out, you will need your credentials to access the platform again.",
  admin: "Admin",
  accountant: "Accountant",
  fillAll: "Please fill in all fields.",
  invalidLogin: "Invalid email or password.",
  registerFailed: "Registration failed. Please try again.",
  minPassword: "Password must be at least 8 characters.",
  passwordMatch: "Passwords do not match.",
  nameEmailRequired: "Name and email are required.",
  updateFailed: "Update failed. Try again.",
  profileUpdated: "Profile updated successfully.",
  resetPassword: "Reset Password",
  resetSubtitle: "Enter your new password to access your account again.",
  show: "Show",
  hide: "Hide",
  resetting: "Resetting...",
  backToLogin: "Back to Login",
  passwordResetSuccess:
    "Password reset successfully. Redirecting to profile...",
  invalidResetLink:
    "Reset link is invalid or expired. Please request a new link.",

  forgotPasswordSubtitle: "Enter your email and we will send you a reset link.",
  sendResetLink: "Send Reset Link",
  sending: "Sending...",
  enterEmail: "Please enter your email",
  email: "Email",
  resetLinkSent: "If this email exists, a reset password link has been sent.",
  resetLinkCreated: "Reset link created.",
  somethingWentWrong: "Something went wrong. Please try again.",
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // initialize from localStorage to avoid setting state inside an effect
  const [lang, setLang] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang");

    if (saved === "ar" || saved === "en") {
      setLang(saved);
    }

    setMounted(true);
  }, []);
  // synchronize DOM and localStorage whenever lang changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (key) => (lang === "ar" ? ar[key] : en[key]) || key;
  if (!mounted) {
    return null;
  }
  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

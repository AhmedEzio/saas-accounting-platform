/**
 * Bilingual translation dictionary for Auth module (Login & Register).
 * English (LTR) and Arabic (RTL).
 */

export const translations = {
  // Page Titles & Subtitles
  'login.title': { en: 'Welcome Back', ar: 'مرحباً بعودتك' },
  'login.subtitle': { en: 'Sign in to access your financial intelligence.', ar: 'سجل الدخول للوصول إلى ذكائك المالي.' },
  'register.title': { en: 'Create Account', ar: 'إنشاء حساب' },
  'register.subtitle': { en: 'Start managing your financial intelligence.', ar: 'ابدأ في إدارة ذكائك المالي.' },

  // Fields & Placeholders
  'field.fullName': { en: 'Full Name', ar: 'الاسم الكامل' },
  'field.namePlaceholder': { en: 'John Smith', ar: 'أحمد محمد' },
  'field.workEmail': { en: 'Work Email', ar: 'البريد الإلكتروني للعمل' },
  'field.emailPlaceholder': { en: 'name@company.com', ar: 'name@company.com' },
  'field.password': { en: 'Password', ar: 'كلمة المرور' },
  'field.passwordPlaceholder': { en: '••••••••', ar: '••••••••' },
  'field.passwordMin': { en: 'Min. 8 characters', ar: '٨ أحرف كحد أدنى' },
  'field.confirmPassword': { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  'field.confirmPlaceholder': { en: 'Repeat your password', ar: 'أعد إدخال كلمة المرور' },

  // Actions & Links
  'action.signIn': { en: 'Sign In', ar: 'تسجيل الدخول' },
  'action.createAccount': { en: 'Create Account', ar: 'إنشاء حساب' },
  'action.rememberMe': { en: 'Remember me', ar: 'تذكرني' },
  'action.forgotPassword': { en: 'Forgot Password?', ar: 'هل نسيت كلمة المرور؟' },
  'action.requestAccess': { en: 'Request Access', ar: 'طلب انضمام' },
  'action.google': { en: 'Google', ar: 'جوجل' },

  // Sections & Text
  'text.orContinueWith': { en: 'OR CONTINUE WITH', ar: 'أو المتابعة باستخدام' },
  'text.noAccount': { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  'text.hasAccount': { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' },
  'text.privacyPolicy': { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
  'text.termsOfService': { en: 'Terms of Service', ar: 'شروط الخدمة' },
  'text.strength': { en: 'Strength:', ar: 'قوة كلمة المرور:' },

  // Password Strengths
  'strength.weak': { en: 'Weak', ar: 'ضعيفة' },
  'strength.fair': { en: 'Fair', ar: 'مقبولة' },
  'strength.good': { en: 'Good', ar: 'جيدة' },
  'strength.strong': { en: 'Strong', ar: 'قوية' },

  // Errors & Validations
  'error.fillFields': { en: 'Please fill in all fields.', ar: 'يرجى ملء جميع الحقول.' },
  'error.invalidCredentials': { en: 'Invalid email or password.', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
  'error.googleFailed': { en: 'Google authentication failed. Please try again.', ar: 'فشلت مصادقة جوجل. يرجى المحاولة مرة أخرى.' },
  'error.passwordLength': { en: 'Password must be at least 8 characters.', ar: 'يجب أن تتكون كلمة المرور من ٨ أحرف على الأقل.' },
  'error.passwordMatch': { en: 'Passwords do not match.', ar: 'كلمات المرور غير متطابقة.' },
  'error.registerFailed': { en: 'Registration failed. Please try again.', ar: 'فشل التسجيل. يرجى المحاولة مرة أخرى.' },
};

export const t = (key, lang = 'en') =>
  translations[key]?.[lang] ?? translations[key]?.['en'] ?? key;

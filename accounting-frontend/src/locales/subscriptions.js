/**
 * Bilingual translation dictionary for the accountant Subscription page.
 * Mirrors the invoice module's simple manual localization pattern.
 */

export const translations = {
  "page.title": { en: "Subscriptions", ar: "الاشتراكات" },
  "page.subtitle": {
    en: "Manage your AI plan, token usage, and billing status.",
    ar: "إدارة خطة الذكاء الاصطناعي واستخدام الرموز وحالة الفوترة.",
  },
  "section.current": { en: "Current Subscription", ar: "الاشتراك الحالي" },
  "section.usage": { en: "AI Token Usage", ar: "استخدام رموز الذكاء الاصطناعي" },
  "section.plans": { en: "Available Plans", ar: "الخطط المتاحة" },

  "label.currentPlan": { en: "Current Plan", ar: "الخطة الحالية" },
  "label.status": { en: "Status", ar: "الحالة" },
  "label.used": { en: "Used", ar: "المستخدم" },
  "label.remaining": { en: "Remaining", ar: "المتبقي" },
  "label.monthlyLimit": { en: "Monthly Limit", ar: "الحد الشهري" },
  "label.renewalDate": { en: "Renewal Date", ar: "تاريخ التجديد" },
  "label.cancellationDate": { en: "Cancellation Date", ar: "تاريخ الإلغاء" },
  "label.monthlyTokenLimit": { en: "Monthly AI Token Limit", ar: "حد رموز الذكاء الاصطناعي الشهري" },
  "label.aiTokens": { en: "AI Tokens", ar: "رموز الذكاء الاصطناعي" },
  "label.features": { en: "Features", ar: "المزايا" },

  "status.active": { en: "Active", ar: "نشط" },
  "status.trialing": { en: "Trialing", ar: "تجريبي" },
  "status.past_due": { en: "Past Due", ar: "متأخر الدفع" },
  "status.cancelled": { en: "Cancelled", ar: "ملغى" },
  "status.incomplete": { en: "Incomplete", ar: "غير مكتمل" },
  "status.unknown": { en: "Unknown", ar: "غير معروف" },

  "state.noActive": { en: "No Active Subscription", ar: "لا يوجد اشتراك نشط" },
  "state.noActiveHint": {
    en: "Choose a plan below to unlock AI chat, read-only insights, and automation tools.",
    ar: "اختر خطة من الأسفل لتفعيل المحادثة الذكية والرؤى المقروءة وأدوات الأتمتة.",
  },
  "state.loading": { en: "Loading subscription data", ar: "جارٍ تحميل بيانات الاشتراك" },
  "state.error": { en: "Could not load subscription data", ar: "تعذر تحميل بيانات الاشتراك" },
  "state.errorHint": {
    en: "Check your connection and try again.",
    ar: "تحقق من الاتصال ثم حاول مرة أخرى.",
  },
  "state.cancellationScheduled": {
    en: "Cancellation Scheduled",
    ar: "تمت جدولة الإلغاء",
  },
  "state.cancellationMessage": {
    en: "Your plan remains active until the end date below.",
    ar: "ستظل خطتك نشطة حتى تاريخ الانتهاء الموضح أدناه.",
  },

  "action.subscribe": { en: "Subscribe", ar: "اشترك" },
  "action.upgrade": { en: "Upgrade Plan", ar: "ترقية الخطة" },
  "action.current": { en: "Current Plan", ar: "الخطة الحالية" },
  "action.cancel": { en: "Cancel Subscription", ar: "إلغاء الاشتراك" },
  "action.cancelling": { en: "Cancelling...", ar: "جارٍ الإلغاء..." },
  "action.redirecting": { en: "Redirecting...", ar: "جارٍ التحويل..." },
  "action.retry": { en: "Retry", ar: "إعادة المحاولة" },
  "action.scheduled": { en: "Cancellation Scheduled", ar: "الإلغاء مجدول" },

  "plan.priceSuffix": { en: "/ month", ar: "/ شهر" },
  "plan.tokensIncluded": { en: "AI Tokens included monthly", ar: "رموز ذكاء اصطناعي شهرياً" },
  "plan.currentBadge": { en: "Current Plan", ar: "الخطة الحالية" },

  "feature.aiChat": { en: "AI Chat", ar: "المحادثة الذكية" },
  "feature.readOnlyTools": { en: "Read-only AI tools", ar: "أدوات ذكاء اصطناعي للقراءة فقط" },
  "feature.clientTools": { en: "Create clients and vendors", ar: "إنشاء العملاء والموردين" },
  "feature.invoiceTools": { en: "Create invoices", ar: "إنشاء الفواتير" },
  "feature.paymentTools": { en: "Record payments", ar: "تسجيل المدفوعات" },
  "feature.technicalSupport": { en: "Technical support", ar: "دعم فني" },
  "feature.noWriteTools": { en: "No create or edit tools", ar: "لا توجد أدوات إنشاء أو تعديل" },
};

export const t = (key, lang = "en") =>
  translations[key]?.[lang] ?? translations[key]?.en ?? key;

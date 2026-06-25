"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

const content = {
  en: {
    title: "Terms of Service",
    updated: "Last Updated: June 2026",
    back: "Back to Login",
    sections: [
      { heading: "1. Acceptance of Terms", body: "By accessing or using our Accounting Platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the platform." },
      { heading: "2. User Accounts", body: "Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their accounts." },
      { heading: "3. Permitted Use", body: "The platform is intended for managing accounting operations, financial records, and AI-assisted financial analysis. Users agree not to misuse the service or attempt unauthorized access to any part of the system." },
      { heading: "4. AI-Generated Content", body: "The platform may provide recommendations, insights, and reports generated using artificial intelligence. These outputs are provided for informational purposes only and should not be considered legal, tax, or professional financial advice." },
      { heading: "5. Data Ownership", body: "Users retain ownership of the data they upload to the platform. However, users grant the platform permission to process and analyze data solely for providing requested services and platform functionality." },
      { heading: "6. Service Availability", body: "We strive to maintain continuous access to the platform but do not guarantee uninterrupted service. Maintenance, updates, or technical issues may temporarily affect availability." },
      { heading: "7. Limitation of Liability", body: "The platform and its operators shall not be liable for any indirect, incidental, or consequential damages arising from the use of the service or reliance on AI-generated recommendations." },
      { heading: "8. Account Termination", body: "We reserve the right to suspend or terminate accounts that violate these terms, compromise system security, or engage in unauthorized activities." },
      { heading: "9. Contact Information", body: "For questions regarding these Terms of Service, please contact the platform administrators or support team." },
    ],
  },
  ar: {
    title: "شروط الخدمة",
    updated: "آخر تحديث: يونيو 2026",
    back: "العودة إلى تسجيل الدخول",
    sections: [
      { heading: "١. قبول الشروط", body: "بالوصول إلى منصة المحاسبة أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا لم توافق على أي جزء من هذه الشروط، فلا يحق لك استخدام المنصة." },
      { heading: "٢. حسابات المستخدمين", body: "يتحمل المستخدمون مسؤولية الحفاظ على سرية بيانات اعتماد حساباتهم وجميع الأنشطة التي تحدث تحت حساباتهم." },
      { heading: "٣. الاستخدام المسموح به", body: "المنصة مخصصة لإدارة العمليات المحاسبية والسجلات المالية والتحليل المالي بمساعدة الذكاء الاصطناعي. يوافق المستخدمون على عدم إساءة استخدام الخدمة أو محاولة الوصول غير المصرح به لأي جزء من النظام." },
      { heading: "٤. المحتوى الناتج عن الذكاء الاصطناعي", body: "قد تقدم المنصة توصيات ورؤى وتقارير مولّدة باستخدام الذكاء الاصطناعي. تُقدَّم هذه المخرجات لأغراض إعلامية فحسب ولا ينبغي اعتبارها مشورة قانونية أو ضريبية أو مالية متخصصة." },
      { heading: "٥. ملكية البيانات", body: "يحتفظ المستخدمون بملكية البيانات التي يرفعونها إلى المنصة. غير أن المستخدمين يمنحون المنصة إذناً بمعالجة البيانات وتحليلها فقط لتقديم الخدمات المطلوبة ووظائف المنصة." },
      { heading: "٦. توافر الخدمة", body: "نسعى جاهدين للحفاظ على الوصول المستمر إلى المنصة، لكننا لا نضمن خدمة بلا انقطاع. قد تؤثر أعمال الصيانة أو التحديثات أو المشكلات التقنية مؤقتاً على التوافر." },
      { heading: "٧. تحديد المسؤولية", body: "لن تكون المنصة ومشغلوها مسؤولين عن أي أضرار غير مباشرة أو عرضية أو تبعية ناجمة عن استخدام الخدمة أو الاعتماد على توصيات الذكاء الاصطناعي." },
      { heading: "٨. إنهاء الحساب", body: "نحتفظ بالحق في تعليق الحسابات أو إنهائها التي تنتهك هذه الشروط أو تُعرّض أمان النظام للخطر أو تنخرط في أنشطة غير مصرح بها." },
      { heading: "٩. معلومات التواصل", body: "للاستفسار عن شروط الخدمة هذه، يرجى التواصل مع مسؤولي المنصة أو فريق الدعم." },
    ],
  },
};

export default function TermsPage() {
  const { lang, toggleLang } = useLang();
  const isRtl = lang === "ar";
  const c = content[lang];

  return (
    <div
      className="min-h-screen bg-[#f0f2f8] py-12 px-6"
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      {/* lang switch */}
      <div className={`max-w-4xl mx-auto flex ${isRtl ? "justify-start" : "justify-end"} mb-4`}>
        <button onClick={toggleLang}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          {isRtl ? "EN" : "AR"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl overflow-hidden">
        {/* top bar */}
        <div className="h-3 bg-linear-to-r from-[#1b2b6b] to-[#2d3ebd]" />

        <div className="px-10 py-10">
          {/* header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1b2b6b] flex flex-col items-center justify-center gap-0.5 shrink-0">
              <span className="text-white text-lg font-extrabold leading-none">F</span>
              <div className="w-4 h-0.5 rounded-full bg-[#1fc99e]"/>
            </div>
            <h1 className="text-3xl font-extrabold text-[#111827]">{c.title}</h1>
          </div>
          <p className="text-sm text-gray-400 mb-8">{c.updated}</p>

          {/* sections */}
          <div className="space-y-8">
            {c.sections.map((sec, i) => (
              <section key={i} className={`pb-8 ${i < c.sections.length - 1 ? "border-b border-gray-100" : ""}`}>
                <h2 className="text-lg font-bold text-[#1b2b6b] mb-3">{sec.heading}</h2>
                <p className="text-gray-600 leading-relaxed text-[15px]">{sec.body}</p>
              </section>
            ))}
          </div>

          {/* footer */}
          <div className={`mt-10 pt-6 border-t border-gray-100 flex items-center ${isRtl ? "flex-row-reverse justify-between" : "justify-between"}`}>
            <Link href="/login"
              className="flex items-center gap-2 text-sm font-semibold text-[#2d3ebd] hover:underline">
              <svg className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {c.back}
            </Link>
            <span className="text-xs text-gray-400">© 2026 FinanceApp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
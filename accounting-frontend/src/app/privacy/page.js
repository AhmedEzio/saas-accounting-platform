"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

const content = {
  en: {
    title: "Privacy Policy",
    updated: "Last Updated: June 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect information that you provide when creating an account, including your name, email address, and account credentials. Additional financial or accounting data may be uploaded or generated through the platform.",
      },
      {
        heading: "2. How We Use Your Information",
        body: "We use your information to provide accounting services, improve user experience, maintain platform security, and deliver AI-powered financial insights and reports.",
      },
      {
        heading: "3. Data Protection",
        body: "We implement appropriate technical and organizational measures to protect your information against unauthorized access, disclosure, alteration, or destruction.",
      },
      {
        heading: "4. Sharing Information",
        body: "We do not sell your personal information. Data may only be shared with trusted service providers necessary for operating the platform or when required by law.",
      },
      {
        heading: "5. AI Services",
        body: "Our platform may use artificial intelligence technologies to analyze financial records and provide recommendations. AI-generated outputs are intended to assist users and should not replace professional financial advice.",
      },
      {
        heading: "6. Your Rights",
        body: "You may request access to, correction of, or deletion of your personal information, subject to applicable legal requirements.",
      },
      {
        heading: "7. Contact Us",
        body: "If you have any questions regarding this Privacy Policy, please contact our support team.",
      },
    ],
    back: "Back to Login",
  },
  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: يونيو 2026",
    sections: [
      {
        heading: "١. المعلومات التي نجمعها",
        body: "نجمع المعلومات التي تقدمها عند إنشاء حساب، بما في ذلك اسمك وعنوان بريدك الإلكتروني وبيانات اعتماد حسابك. قد يتم أيضاً رفع أو توليد بيانات مالية أو محاسبية إضافية من خلال المنصة.",
      },
      {
        heading: "٢. كيفية استخدام معلوماتك",
        body: "نستخدم معلوماتك لتقديم خدمات المحاسبة، وتحسين تجربة المستخدم، والحفاظ على أمان المنصة، وتقديم رؤى وتقارير مالية مدعومة بالذكاء الاصطناعي.",
      },
      {
        heading: "٣. حماية البيانات",
        body: "نطبق تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو الإفصاح أو التعديل أو الإتلاف.",
      },
      {
        heading: "٤. مشاركة المعلومات",
        body: "لا نبيع معلوماتك الشخصية. لا تُشارك البيانات إلا مع مزودي الخدمات الموثوق بهم اللازمين لتشغيل المنصة أو عند الاقتضاء القانوني.",
      },
      {
        heading: "٥. خدمات الذكاء الاصطناعي",
        body: "قد تستخدم منصتنا تقنيات الذكاء الاصطناعي لتحليل السجلات المالية وتقديم التوصيات. المخرجات الناتجة عن الذكاء الاصطناعي مخصصة لمساعدة المستخدمين ولا ينبغي أن تحل محل المشورة المالية المتخصصة.",
      },
      {
        heading: "٦. حقوقك",
        body: "يمكنك طلب الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها، وفقاً للمتطلبات القانونية المعمول بها.",
      },
      {
        heading: "٧. تواصل معنا",
        body: "إذا كان لديك أي استفسار بشأن سياسة الخصوصية هذه، يرجى التواصل مع فريق الدعم لدينا.",
      },
    ],
    back: "العودة إلى تسجيل الدخول",
  },
};

export default function PrivacyPolicyPage() {
  const { lang, toggleLang } = useLang();
  const isRtl = lang === "ar";
  const c = content[lang];

  return (
    <div
      className={`min-h-screen bg-[#f0f2f8] py-12 px-6 ${isRtl ? "font-[system-ui]" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      {/* lang switch */}
      <div
        className={`max-w-4xl mx-auto flex ${isRtl ? "justify-start" : "justify-end"} mb-4`}
      >
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
          {isRtl ? "EN" : "AR"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl overflow-hidden">
        {/* hero banner */}
        <div
          className={`h-3 bg-linear-to-r from-[#1b2b6b] to-[#2d3ebd]${isRtl ? "flex-row-reverse" : ""}`}
        />

        <div className="px-10 py-10">
          {/* header */}
          <div className={`flex items-start justify-between mb-8 `}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#1b2b6b] flex flex-col items-center justify-center gap-0.5 shrink-0">
                  <span className="text-white text-lg font-extrabold leading-none">
                    F
                  </span>
                  <div className="w-4 h-0.5 rounded-full bg-[#1fc99e]" />
                </div>
                <h1 className="text-3xl font-extrabold text-[#111827]">
                  {c.title}
                </h1>
              </div>
              <p className="text-sm text-gray-400">{c.updated}</p>
            </div>
          </div>

          {/* sections */}
          <div className="space-y-8">
            {c.sections.map((sec, i) => (
              <section
                key={i}
                className={`pb-8 ${i < c.sections.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <h2 className="text-lg font-bold text-[#1b2b6b] mb-3">
                  {sec.heading}
                </h2>
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  {sec.body}
                </p>
              </section>
            ))}
          </div>

          {/* footer */}
          <div
            className={`mt-10 pt-6 border-t border-gray-100 flex items-center ${isRtl ? "flex-row-reverse justify-between" : "justify-between"}`}
          >
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-semibold text-[#2d3ebd] hover:underline"
            >
              <svg
                className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
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

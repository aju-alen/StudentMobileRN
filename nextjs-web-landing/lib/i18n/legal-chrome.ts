import type { Locale } from "./locale";
import { withLocale } from "./locale";
import {
  childSafeguardingPolicyMeta,
  childSafeguardingPolicyToc,
} from "@/lib/legal/child-safeguarding-policy-content";
import {
  privacyPolicyMeta,
  privacyPolicyToc,
} from "@/lib/legal/privacy-policy-content";
import {
  termsOfUseMeta,
  termsOfUseToc,
} from "@/lib/legal/terms-of-use-content";

export type LegalDocId = "privacy" | "terms" | "safeguarding";

type LegalMeta = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  intro: string;
  supplemental?: string;
};

type TocItem = { id: string; label: string };

export type LegalChrome = LegalMeta & {
  toc: TocItem[];
  seoTitle: string;
  seoDescription: string;
  path: string;
  primaryKeywords: string[];
};

const PRIVACY_AR: LegalChrome = {
  title: "سياسة الخصوصية",
  subtitle: "للأهالي والطلاب والمعلمين",
  effectiveDate: "21 يوليو 2026",
  intro:
    "كوتش أكاديم شركة تابعة لـ Right Intellectual Services Enterprise (RISE) Portal Ltd.، وهي شركة مؤسسة في مركز دبي المالي العالمي (DIFC) في دولة الإمارات العربية المتحدة.",
  toc: [
    { id: "introduction", label: "1. المقدمة والنطاق" },
    { id: "who-we-are", label: "2. من نحن وكيفية التواصل معنا" },
    { id: "governing-law", label: "3. القانون الحاكم والإطار التنظيمي" },
    { id: "information-we-collect", label: "4. المعلومات التي نجمعها" },
    {
      id: "how-we-use-information",
      label: "5. كيف ولماذا نستخدم المعلومات، والأساس القانوني",
    },
    {
      id: "childrens-privacy",
      label: "6. خصوصية الأطفال وموافقة ولي الأمر",
    },
    { id: "tutor-data", label: "7. بيانات المعلمين والتحقّق" },
    { id: "cookies", label: "8. ملفات تعريف الارتباط وتقنيات التتبّع" },
    { id: "how-we-share", label: "9. كيف نشارك المعلومات" },
    { id: "international-transfers", label: "10. نقل البيانات الدولي" },
    { id: "data-security", label: "11. أمن البيانات والإبلاغ عن الاختراق" },
    { id: "data-retention", label: "12. الاحتفاظ بالبيانات" },
    { id: "your-rights", label: "13. حقوقك" },
    { id: "complaints", label: "14. الشكاوى" },
    { id: "safeguarding-note", label: "15. ملاحظة حماية الأطفال" },
    { id: "changes", label: "16. التغييرات على هذه السياسة" },
    { id: "contact-us", label: "17. تواصل معنا" },
  ],
  seoTitle: "سياسة الخصوصية",
  seoDescription:
    "سياسة خصوصية كوتش أكاديم للأهالي والطلاب والمعلمين. تعرّف على كيفية جمع البيانات الشخصية واستخدامها وحمايتها على منصة الدروس الأونلاين.",
  path: "/privacy-policy",
  primaryKeywords: [
    "سياسة خصوصية كوتش أكاديم",
    "خصوصية الدروس الأونلاين الإمارات",
    "حماية بيانات الأطفال DIFC",
  ],
};

const TERMS_AR: LegalChrome = {
  title: "الشروط والأحكام",
  subtitle: "للأهالي والطلاب والمعلمين الذين يستخدمون منصة كوتش أكاديم",
  effectiveDate: "21 يوليو 2026",
  intro:
    "كوتش أكاديم شركة تابعة لـ Right Intellectual Services Enterprise (RISE) Portal Ltd.، وهي شركة مؤسسة في مركز دبي المالي العالمي (DIFC) في دولة الإمارات العربية المتحدة.",
  supplemental:
    "يُقرأ هذا المستند مع سياسة الخصوصية وسياسة حماية الطفل في كوتش أكاديم.",
  toc: [
    { id: "introduction", label: "1. المقدمة والقبول" },
    { id: "definitions", label: "2. التعريفات" },
    { id: "eligibility", label: "3. الأهلية وتسجيل الحساب" },
    { id: "services", label: "4. وصف الخدمات" },
    { id: "parent-obligations", label: "5. التزامات الأهالي والطلاب" },
    { id: "tutor-obligations", label: "6. التزامات المعلمين ووضعهم" },
    {
      id: "fees-payments",
      label: "7. الرسوم والمدفوعات والإلغاءات والاسترداد",
    },
    { id: "session-conduct", label: "8. سلوك الحصص والتسجيل" },
    { id: "user-content", label: "9. محتوى المستخدم والملكية الفكرية" },
    { id: "prohibited-conduct", label: "10. السلوك المحظور" },
    {
      id: "platform-availability",
      label: "11. توافر المنصة والتغييرات على الخدمات",
    },
    {
      id: "non-circumvention",
      label: "12. منع التحايل وقيود الإحالة",
    },
    { id: "disclaimers", label: "13. إخلاء المسؤولية وحدود المسؤولية" },
    { id: "suspension", label: "14. التعليق والإنهاء" },
    { id: "confidentiality", label: "15. السرية" },
    { id: "data-protection", label: "16. حماية البيانات" },
    {
      id: "dispute-resolution",
      label: "17. تسوية النزاعات والقانون الحاكم",
    },
    { id: "force-majeure", label: "18. القوة القاهرة" },
    { id: "changes", label: "19. التغييرات على هذه الشروط" },
    { id: "miscellaneous", label: "20. أحكام عامة" },
    { id: "contact-us", label: "21. تواصل معنا" },
  ],
  seoTitle: "شروط الاستخدام",
  seoDescription:
    "شروط وأحكام كوتش أكاديم للأهالي والطلاب والمعلمين. اقرأ الشروط المنظمة لاستخدام منصة الدروس الأونلاين.",
  path: "/terms-of-use",
  primaryKeywords: [
    "شروط استخدام كوتش أكاديم",
    "شروط الدروس الأونلاين الإمارات",
    "شروط وأحكام كوتش أكاديم",
  ],
};

const SAFEGUARDING_AR: LegalChrome = {
  title: "سياسة حماية الطفل",
  subtitle: "حماية كل طالب على منصة كوتش أكاديم",
  effectiveDate: "21 يوليو 2026",
  intro:
    "كوتش أكاديم شركة تابعة لـ Right Intellectual Services Enterprise (RISE) Portal Ltd.، وهي شركة مؤسسة في مركز دبي المالي العالمي (DIFC) في دولة الإمارات العربية المتحدة.",
  supplemental:
    "تعمل هذه السياسة إلى جانب سياسة الخصوصية في كوتش أكاديم، ويُفضّل قراءتهما معاً (انظر القسم 15 والقسم 6.6).",
  toc: [
    { id: "introduction", label: "1. المقدمة والغرض" },
    { id: "scope", label: "2. النطاق" },
    { id: "legal-framework", label: "3. الإطار القانوني والتنظيمي" },
    { id: "definitions", label: "4. التعريفات" },
    { id: "guiding-principles", label: "5. المبادئ التوجيهية" },
    { id: "roles-responsibilities", label: "6. الأدوار والمسؤوليات" },
    { id: "safer-recruitment", label: "7. التوظيف الآمن للمعلمين" },
    { id: "tutor-code-of-conduct", label: "8. مدونة سلوك المعلمين" },
    {
      id: "online-digital-safety",
      label: "9. السلامة عبر الإنترنت وفي الحصص الرقمية",
    },
    { id: "recognizing-signs", label: "10. التعرّف على علامات الإساءة أو الضرر" },
    { id: "reporting", label: "11. الإبلاغ عن مخاوف" },
    {
      id: "confidentiality",
      label: "12. السرية ومشاركة المعلومات",
    },
    {
      id: "responding-allegations",
      label: "13. التعامل مع الادعاءات ضد معلم أو موظف",
    },
    { id: "training", label: "14. التدريب والتوعية" },
    { id: "record-keeping", label: "15. حفظ السجلات" },
    {
      id: "monitoring-review",
      label: "16. مراقبة هذه السياسة ومراجعتها",
    },
    { id: "contact-us", label: "17. تواصل معنا" },
  ],
  seoTitle: "سياسة حماية الطفل",
  seoDescription:
    "سياسة حماية الطفل في كوتش أكاديم. تعرّف على كيف نحمي الطلاب ونتحقق من المعلمين ونتعامل مع مخاوف سلامة الطفل على المنصة.",
  path: "/child-safeguarding-policy",
  primaryKeywords: [
    "سياسة حماية الطفل كوتش أكاديم",
    "سلامة الطفل في الدروس الأونلاين الإمارات",
    "سياسة حماية الطلاب",
  ],
};

function fromEnglish(
  meta: LegalMeta,
  toc: TocItem[],
  seoTitle: string,
  seoDescription: string,
  path: string,
  primaryKeywords: string[]
): LegalChrome {
  return {
    ...meta,
    toc,
    seoTitle,
    seoDescription,
    path,
    primaryKeywords,
  };
}

const ENGLISH: Record<LegalDocId, LegalChrome> = {
  privacy: fromEnglish(
    privacyPolicyMeta,
    privacyPolicyToc,
    "Privacy Policy",
    "CoachAcadem Privacy Policy for parents, students, and tutors. Learn how we collect, use, and protect personal data on our online tutoring platform.",
    "/privacy-policy",
    [
      "CoachAcadem privacy policy",
      "online tutoring privacy UAE",
      "children data protection DIFC",
    ]
  ),
  terms: fromEnglish(
    termsOfUseMeta,
    termsOfUseToc,
    "Terms of Use",
    "CoachAcadem Terms and Conditions for parents, students, and tutors. Read the terms governing use of our online tutoring platform.",
    "/terms-of-use",
    [
      "CoachAcadem terms of use",
      "online tutoring terms UAE",
      "CoachAcadem terms and conditions",
    ]
  ),
  safeguarding: fromEnglish(
    childSafeguardingPolicyMeta,
    childSafeguardingPolicyToc,
    "Child Safeguarding Policy",
    "CoachAcadem Child Safeguarding Policy. Learn how we protect students, vet tutors, and respond to child-safety concerns on our platform.",
    "/child-safeguarding-policy",
    [
      "CoachAcadem child safeguarding policy",
      "online tutoring child safety UAE",
      "student protection policy",
    ]
  ),
};

const ARABIC: Record<LegalDocId, LegalChrome> = {
  privacy: PRIVACY_AR,
  terms: TERMS_AR,
  safeguarding: SAFEGUARDING_AR,
};

export function getLegalChrome(doc: LegalDocId, locale: Locale): LegalChrome {
  const chrome = locale === "ar" ? ARABIC[doc] : ENGLISH[doc];
  return {
    ...chrome,
    path: withLocale(chrome.path, locale),
  };
}

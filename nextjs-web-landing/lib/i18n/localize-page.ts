import type { CurriculumPageData } from "@/lib/curricula/types";
import type { SubjectPageData } from "@/lib/subjects/types";
import type { CityPageData } from "@/lib/locations/types";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/locale";
import {
  CURRICULUM_NAME_AR,
  EMIRATE_NAME_AR,
  curriculumNameAr,
  fill,
  subjectNameAr,
} from "@/lib/i18n/names";
import { t } from "@/lib/i18n/messages";

function L(href: string, locale: Locale) {
  if (href.startsWith("#") || href.startsWith("http")) return href;
  return withLocale(href, locale);
}

function curriculumKeyFromHref(href: string): string {
  const path = href.replace(/^\//, "").replace(/-tutors$/, "");
  const known = [
    "american-curriculum",
    "a-level",
    "computer-science",
    "business-studies",
  ];
  for (const key of known) {
    if (path === key || path.startsWith(`${key}-`)) return key;
  }
  return path.split("-")[0] ?? path;
}

export function localizeCityPage(
  page: CityPageData,
  locale: Locale
): CityPageData {
  if (locale === "en") return page;
  const copy = t("ar");
  const name = EMIRATE_NAME_AR[page.slug] ?? page.cityName;
  const h1 = `معلمون أونلاين في ${name}`;

  return {
    ...page,
    cityName: name,
    seo: {
      ...page.seo,
      title: `${h1} | كوتش أكاديم`,
      description: `ابحث عن معلمين أونلاين لعائلات ${name}. قارن الملفات لمناهج IGCSE والبكالوريا الدولية وA-Level والمنهج الأمريكي وCBSE واحجز الحصص من تطبيق كوتش أكاديم.`,
    },
    hero: {
      ...page.hero,
      h1,
      supportingCopy: `كوتش أكاديم منصة دروس أونلاين لعائلات ${name} وجميع أنحاء الإمارات. قارن ملفات المعلمين حسب المادة والمنهج واحجز الحصص من التطبيق.`,
      primaryCta: "تصفّح المناهج",
      secondaryCta: copy.getTheApp,
    },
    understanding: {
      title: `دروس خصوصية لعائلات ${name}`,
      paragraphs: [
        `يمكن لعائلات ${name} البحث عن معلمين أونلاين لمناهج IGCSE والبكالوريا الدولية وA-Level والمنهج الأمريكي وCBSE.`,
        "الحصص أونلاين، ويمكنك مقارنة المعلمين والحجز من التطبيق دون التنقل إلى إمارة أخرى في كل حصة.",
        "ابحث حسب المادة والمنهج والمستوى الدراسي، ثم احجز وقتاً يناسب طفلك.",
      ],
    },
    curricula: {
      title: `المناهج المتوفرة لطلاب ${name}`,
      lead: "افتح صفحة المنهج لمقارنة المعلمين الذين يدرّسون ذلك البرنامج.",
      cards: page.curricula.cards.map((card) => {
        const arCard = copy.curricula.cards.find((item) => item.href === card.href);
        const curriculumName = curriculumNameAr(card.href.replace(/^\//, ""));
        return {
          ...card,
          name: arCard?.title ?? curriculumName,
          description: arCard?.description ?? card.description,
          cta: arCard?.cta ?? fill(copy.pageChrome.exploreCta, { name: curriculumName }),
          href: L(card.href, "ar"),
        };
      }),
    },
    subjects: {
      title: `مواد شائعة لعائلات ${name}`,
      lead: "تعرض صفحات المواد معلمين يمكن حجزهم عبر تطبيق كوتش أكاديم.",
      cards: page.subjects.cards.map((card) => {
        const subjectName = subjectNameAr(card.href.replace(/^\//, ""));
        return {
          ...card,
          name: subjectName,
          cta: `معلمو ${subjectName}`,
          href: L(card.href, "ar"),
        };
      }),
    },
    whyParentsChoose: {
      title: copy.whyParents.title,
      lead: `طريقة مباشرة لعائلات ${name} للعثور على معلمين مؤهلين ومقارنة الخيارات والحجز أونلاين.`,
      reasons: copy.whyParents.reasons,
    },
    faq: {
      title: copy.faqTitle,
      items: [
        {
          question: `هل يمكن للطلاب في ${name} استخدام كوتش أكاديم؟`,
          answer: `نعم. كوتش أكاديم متاح لعائلات ${name}. الحصص أونلاين، ويمكنك حجز معلم يدرّس منهج طفلك من أي مكان في الإمارات.`,
        },
        {
          question: "هل الحصص حضورية أم أونلاين؟",
          answer:
            "الحصص على كوتش أكاديم أونلاين. يتم البحث والمقارنة والحجز عبر التطبيق.",
        },
        {
          question: `ما المناهج المتوفرة لطلاب ${name}؟`,
          answer:
            "يمكنك البحث عن معلمي IGCSE والبكالوريا الدولية وA-Level والمنهج الأمريكي وCBSE، إضافة إلى مواد مثل الرياضيات واللغة الإنجليزية والعلوم.",
        },
        {
          question: "كيف أحجز معلماً؟",
          answer:
            "حمّل تطبيق كوتش أكاديم، ابحث حسب المادة أو المنهج، قارن الملفات، واحجز حصة في وقت يناسب طفلك.",
        },
      ],
    },
    downloadApp: {
      title: copy.download.title,
      supportingCopy: copy.download.supporting,
    },
    relatedCities: {
      title: "معلمون أونلاين في الإمارات الأخرى",
      lead: "كوتش أكاديم متاح للعائلات في جميع أنحاء الإمارات.",
      items: page.relatedCities.items.map((item) => {
        const slug = item.href.replace(/^\//, "");
        const cityName = EMIRATE_NAME_AR[slug] ?? item.name;
        return {
          ...item,
          name: cityName,
          description: `ابحث عن معلمين أونلاين لعائلات ${cityName}.`,
          cta: `معلمو ${cityName}`,
          href: L(item.href, "ar"),
        };
      }),
    },
  };
}

export function localizeCurriculum(
  curriculum: CurriculumPageData,
  locale: Locale
): CurriculumPageData {
  if (locale === "en") return curriculum;
  const copy = t("ar");
  const key = curriculum.slug.replace(/-tutors$/, "");
  const name = CURRICULUM_NAME_AR[key] ?? curriculum.curriculumName;
  const h1 = `معلمو ${name} في الإمارات`;

  return {
    ...curriculum,
    seo: {
      ...curriculum.seo,
      title: `${h1} | كوتش أكاديم`,
      description: `ابحث عن معلمي ${name} أونلاين في الإمارات. قارن الملفات واحجز الحصص عبر تطبيق كوتش أكاديم.`,
    },
    hero: {
      ...curriculum.hero,
      h1,
      supportingCopy: `ابحث عن معلمي ${name} عبر تطبيق كوتش أكاديم. قارن المؤهلات واحجز الحصص أونلاين.`,
      primaryCta: "ابحث عن معلمين",
      secondaryCta: copy.getTheApp,
    },
    featuredTutors: {
      ...curriculum.featuredTutors,
      title: fill(copy.pageChrome.featuredTutors, { name }),
      lead: copy.pageChrome.featuredTutorsLead,
    },
    understanding: {
      ...curriculum.understanding,
      title: fill(copy.pageChrome.understandingCurriculum, { name }),
    },
    faq: {
      title: copy.faqTitle,
      items: copy.homeFaqs,
    },
    downloadApp: {
      title: copy.download.title,
      supportingCopy: copy.download.supporting,
    },
    whyParentsChoose: {
      title: copy.whyParents.title,
      lead: copy.whyParents.lead,
      reasons: copy.whyParents.reasons,
    },
    reviews: {
      ...curriculum.reviews,
      title: copy.pageChrome.reviewsTitle,
      lead: copy.pageChrome.reviewsLead,
    },
    relatedCurricula: {
      title: copy.pageChrome.relatedCurricula,
      lead: curriculum.relatedCurricula.lead,
      items: curriculum.relatedCurricula.items.map((item) => {
        const curriculumName = curriculumNameAr(item.href.replace(/^\//, ""));
        return {
          ...item,
          name: curriculumName,
          cta: fill(copy.pageChrome.exploreCta, { name: curriculumName }),
          href: L(item.href, "ar"),
        };
      }),
    },
    subjects: {
      title: fill(copy.pageChrome.subjectsForCurriculum, { name }),
      lead: curriculum.subjects.lead,
      cards: curriculum.subjects.cards.map((card) => {
        const subjectName = subjectNameAr(card.href.replace(/^\//, ""));
        return {
          ...card,
          name: subjectName,
          cta: `معلمو ${subjectName}`,
          href: L(card.href, "ar"),
        };
      }),
    },
  };
}

export function localizeSubject(
  subject: SubjectPageData,
  locale: Locale
): SubjectPageData {
  if (locale === "en") return subject;
  const copy = t("ar");
  const name =
    subjectNameAr(subject.slug.replace(/-tutors$/, "")) || subject.subjectName;
  const h1 = `معلمو ${name} في الإمارات`;

  return {
    ...subject,
    seo: {
      ...subject.seo,
      title: `${h1} | كوتش أكاديم`,
      description: `ابحث عن معلمي ${name} أونلاين في الإمارات. قارن الملفات واحجز الحصص عبر تطبيق كوتش أكاديم.`,
    },
    hero: {
      ...subject.hero,
      h1,
      supportingCopy: `ابحث عن معلمي ${name} عبر التطبيق وقارن الملفات واحجز الحصص أونلاين.`,
      primaryCta: "ابحث عن معلمين",
      secondaryCta: copy.getTheApp,
    },
    featuredTutors: {
      ...subject.featuredTutors,
      title: fill(copy.pageChrome.featuredTutors, { name }),
      lead: copy.pageChrome.featuredTutorsLead,
    },
    howTutorsHelp: {
      ...subject.howTutorsHelp,
      title: fill(copy.pageChrome.howTutorsHelp, { name }),
    },
    faq: {
      title: copy.faqTitle,
      items: copy.homeFaqs,
    },
    downloadApp: {
      title: copy.download.title,
      supportingCopy: copy.download.supporting,
    },
    whyParentsChoose: {
      title: copy.whyParents.title,
      lead: copy.whyParents.lead,
      reasons: copy.whyParents.reasons,
    },
    reviews: {
      ...subject.reviews,
      title: copy.pageChrome.reviewsTitle,
      lead: copy.pageChrome.reviewsLead,
    },
    curriculum: {
      title: fill(copy.pageChrome.findByCurriculum, { name }),
      lead: copy.pageChrome.findByCurriculumLead,
      cards: subject.curriculum.cards.map((card) => {
        const curriculumName = curriculumNameAr(curriculumKeyFromHref(card.href));
        const label = `${curriculumName} · ${name}`;
        return {
          ...card,
          title: `معلمو ${label}`,
          cta: fill(copy.pageChrome.exploreCta, { name: label }),
          href: L(card.href, "ar"),
        };
      }),
    },
    relatedSubjects: subject.relatedSubjects
      ? {
          title: copy.pageChrome.relatedSubjects,
          subjects: subject.relatedSubjects.subjects.map((item) => {
            const subjectName = subjectNameAr(item.href.replace(/^\//, ""));
            return {
              ...item,
              name: subjectName,
              cta: `معلمو ${subjectName}`,
              href: L(item.href, "ar"),
            };
          }),
        }
      : undefined,
    exploreSubjects: subject.exploreSubjects
      ? {
          title: copy.pageChrome.exploreSubjects,
          lead: copy.pageChrome.exploreSubjectsLead,
          subjects: subject.exploreSubjects.subjects.map((item) => {
            const subjectName = subjectNameAr(item.href.replace(/^\//, ""));
            return {
              ...item,
              name: subjectName,
              cta: `معلمو ${subjectName}`,
              href: L(item.href, "ar"),
            };
          }),
        }
      : undefined,
  };
}

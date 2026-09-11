import type { Locale } from "./locale";
import { t } from "./messages";
import type { ResourceArticle } from "@/lib/resources/types";

const ARTICLE_AR: Record<
  string,
  { title: string; description: string }
> = {
  "igcse-a-level-ib-uae-comparison": {
    title: "IGCSE أم A-Level أم البكالوريا الدولية؟ دليل أهالي الإمارات لاختيار المسار",
    description:
      "مقارنة واضحة خاصة بالإمارات بين IGCSE وA-Level والبكالوريا الدولية: كيف يُبنى كل مسار، وأي متعلمين يناسب، وكيف يؤثر على خيارات الجامعة.",
  },
  "igcse-october-november-2026-retakes": {
    title:
      "إعادة امتحانات IGCSE في أكتوبر/نوفمبر 2026: دليل أهالي الإمارات للمرة الثانية",
    description:
      "ما يحتاج أهالي الإمارات معرفته عن سلسلة إعادة IGCSE في أكتوبر/نوفمبر 2026 — المواعيد، كيف تعمل الإعادة، وكيفية بناء خطة مراجعة مركّزة قبل النتائج في يناير.",
  },
  "complete-guide-finding-a-tutor-uae": {
    title: "الدليل الكامل للعثور على معلم في الإمارات",
    description:
      "كل ما يحتاج أهالي الإمارات معرفته لإيجاد المعلم المناسب — كيف يعمل السوق، ما الذي يجب التحقق منه قبل الحجز، إرشاد حسب المنهج، ودعم موسم الامتحانات.",
  },
};

export function localizeArticle(
  article: ResourceArticle,
  locale: Locale
): ResourceArticle {
  if (locale === "en") return article;

  const copy = t("ar");
  const overlay = ARTICLE_AR[article.slug];

  return {
    ...article,
    title: overlay?.title ?? article.title,
    description: overlay?.description ?? article.description,
    category:
      article.categoryPath === "/parent-guides"
        ? (copy.resources.parentGuidesCategory as ResourceArticle["category"])
        : article.categoryPath === "/blog"
          ? (copy.resources.blogCategory as ResourceArticle["category"])
          : (copy.resources.examCategory as ResourceArticle["category"]),
  };
}

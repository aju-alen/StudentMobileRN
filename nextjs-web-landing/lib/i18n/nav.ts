import { APP_STORE_URL } from "@/lib/constants";
import type { Locale } from "./locale";
import { withLocale } from "./locale";
import { t } from "./messages";
import { EMIRATE_NAME_AR, curriculumNameAr, subjectNameAr } from "./names";

export type NavDropdownItem = { label: string; href: string };

export type NavItem =
  | { label: string; type: "link"; href: string }
  | { label: string; type: "dropdown"; items: NavDropdownItem[] };

export type FooterColumn = {
  label: string;
  items: NavDropdownItem[];
};

const SUBJECT_ITEMS_EN: NavDropdownItem[] = [
  { label: "Math Tutors", href: "/mathematics-tutors" },
  { label: "Physics Tutors", href: "/physics-tutors" },
  { label: "Chemistry Tutors", href: "/chemistry-tutors" },
  { label: "Biology Tutors", href: "/biology-tutors" },
  { label: "English Tutors", href: "/english-tutors" },
  { label: "Arabic Tutors", href: "/arabic-tutors" },
  { label: "Economics Tutors", href: "/economics-tutors" },
  { label: "Accounting Tutors", href: "/accounting-tutors" },
  { label: "Computer Science Tutors", href: "/computer-science-tutors" },
];

const CURRICULUM_ITEMS_EN: NavDropdownItem[] = [
  { label: "IGCSE Tutors", href: "/igcse-tutors" },
  { label: "GCSE Tutors", href: "/gcse-tutors" },
  { label: "A-Level Tutors", href: "/a-level-tutors" },
  { label: "IB Tutors", href: "/ib-tutors" },
  { label: "American Curriculum Tutors", href: "/american-curriculum-tutors" },
  { label: "CBSE Tutors", href: "/cbse-tutors" },
];

const LOCATION_ITEMS_EN: NavDropdownItem[] = [
  { label: "Dubai Tutors", href: "/dubai" },
  { label: "Abu Dhabi Tutors", href: "/abu-dhabi" },
  { label: "Sharjah Tutors", href: "/sharjah" },
  { label: "Ajman Tutors", href: "/ajman" },
  { label: "Ras Al Khaimah Tutors", href: "/ras-al-khaimah" },
  { label: "Fujairah Tutors", href: "/fujairah" },
  { label: "Umm Al Quwain Tutors", href: "/umm-al-quwain" },
];

function localizeItems(
  items: NavDropdownItem[],
  locale: Locale,
  kind: "subject" | "curriculum" | "location"
): NavDropdownItem[] {
  return items.map((item) => {
    const href = withLocale(item.href, locale);
    if (locale === "en") return { ...item, href };

    if (kind === "location") {
      const slug = item.href.replace(/^\//, "");
      const name = EMIRATE_NAME_AR[slug] ?? item.label;
      return { label: `معلمو ${name}`, href };
    }

    if (kind === "curriculum") {
      const name = curriculumNameAr(item.href.replace(/^\//, ""));
      return { label: `معلمو ${name}`, href };
    }

    const name = subjectNameAr(item.href.replace(/^\//, ""));
    return { label: `معلمو ${name}`, href };
  });
}

export function getMainNav(locale: Locale): NavItem[] {
  const copy = t(locale);
  const L = (path: string) => withLocale(path, locale);

  return [
    {
      label: copy.nav.findTutors,
      type: "dropdown",
      items: localizeItems(SUBJECT_ITEMS_EN, locale, "subject"),
    },
    {
      label: copy.nav.curricula,
      type: "dropdown",
      items: localizeItems(CURRICULUM_ITEMS_EN, locale, "curriculum"),
    },
    {
      label: copy.nav.locations,
      type: "dropdown",
      items: localizeItems(LOCATION_ITEMS_EN, locale, "location"),
    },
    {
      label: copy.nav.howItWorks,
      type: "link",
      href: L("/#home"),
    },
    {
      label: copy.nav.resources,
      type: "dropdown",
      items: [
        { label: copy.nav.parentGuides, href: L("/parent-guides") },
        { label: copy.nav.studyTips, href: L("/study-tips") },
        { label: copy.nav.examPreparation, href: L("/exam-preparation") },
        { label: copy.nav.blog, href: L("/blog") },
      ],
    },
    {
      label: copy.nav.becomeATutor,
      type: "link",
      href: L("/become-a-tutor"),
    },
  ];
}

export function getFooterColumns(locale: Locale): {
  primary: FooterColumn[];
  secondary: FooterColumn[];
} {
  const copy = t(locale);
  const L = (path: string) => withLocale(path, locale);

  return {
    primary: [
      {
        label: copy.footer.subjects,
        items: localizeItems(SUBJECT_ITEMS_EN, locale, "subject"),
      },
      {
        label: copy.nav.curricula,
        items: localizeItems(CURRICULUM_ITEMS_EN, locale, "curriculum"),
      },
      {
        label: copy.nav.locations,
        items: localizeItems(LOCATION_ITEMS_EN, locale, "location"),
      },
      {
        label: copy.nav.resources,
        items: [
          { label: copy.nav.parentGuides, href: L("/parent-guides") },
          { label: copy.nav.studyTips, href: L("/study-tips") },
          { label: copy.nav.examPreparation, href: L("/exam-preparation") },
          { label: copy.nav.blog, href: L("/blog") },
          { label: copy.footer.faq, href: L("/#faq") },
        ],
      },
      {
        label: copy.footer.company,
        items: [
          { label: copy.footer.about, href: L("/about-coachacadem") },
          { label: copy.footer.contact, href: "mailto:support@coachacadem.ae" },
        ],
      },
    ],
    secondary: [
      {
        label: copy.nav.becomeATutor,
        items: [{ label: copy.nav.becomeATutor, href: APP_STORE_URL }],
      },
    ],
  };
}

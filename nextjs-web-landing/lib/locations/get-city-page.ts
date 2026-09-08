import type { CityPageData } from "./types";
import type { SubjectCard } from "@/lib/curricula/types";
import { EMIRATES, cityHubPath, type Emirate } from "./emirates";

const CURRICULUM_CARDS: SubjectCard[] = [
  {
    name: "IGCSE",
    description:
      "Support across mathematics, sciences, languages, humanities, and exam preparation.",
    href: "/igcse-tutors",
    cta: "Explore IGCSE Tutors",
  },
  {
    name: "IB",
    description:
      "Tutors familiar with the International Baccalaureate Diploma and Middle Years programmes.",
    href: "/ib-tutors",
    cta: "Explore IB Tutors",
  },
  {
    name: "A-Level",
    description:
      "Subject specialists for examination years and university preparation.",
    href: "/a-level-tutors",
    cta: "Explore A-Level Tutors",
  },
  {
    name: "American Curriculum",
    description:
      "Grade-level support aligned with American curriculum schools in the UAE.",
    href: "/american-curriculum-tutors",
    cta: "Explore American Curriculum Tutors",
  },
  {
    name: "CBSE",
    description:
      "Structured support across core CBSE subjects with a focus on school performance.",
    href: "/cbse-tutors",
    cta: "Explore CBSE Tutors",
  },
];

const SUBJECT_CARDS: SubjectCard[] = [
  {
    name: "Mathematics",
    description:
      "Compare verified Mathematics tutors and book lessons in the app.",
    href: "/mathematics-tutors",
    cta: "Mathematics Tutors",
  },
  {
    name: "English",
    description: "Reading, writing, and literature support for school and exams.",
    href: "/english-tutors",
    cta: "English Tutors",
  },
  {
    name: "Physics",
    description: "Help with theory, problem-solving, and exam technique.",
    href: "/physics-tutors",
    cta: "Physics Tutors",
  },
  {
    name: "Chemistry",
    description: "Support for reactions, equations, and school assessments.",
    href: "/chemistry-tutors",
    cta: "Chemistry Tutors",
  },
  {
    name: "Biology",
    description: "Build understanding of processes, detail, and exam answers.",
    href: "/biology-tutors",
    cta: "Biology Tutors",
  },
  {
    name: "Arabic",
    description: "Reading, writing, grammar, and school Arabic support.",
    href: "/arabic-tutors",
    cta: "Arabic Tutors",
  },
];

function buildCityPage(emirate: Emirate): CityPageData {
  const slug = emirate.slug;
  const h1 = `Online tutors in ${emirate.name}`;

  return {
    slug,
    cityName: emirate.name,
    seo: {
      title: `Online Tutors in ${emirate.name} | IGCSE, IB, A-Level & More | CoachAcadem`,
      description: `Find online tutors for families in ${emirate.name}. Compare verified profiles for IGCSE, IB, A-Level, American Curriculum, and CBSE, then book lessons in the CoachAcadem app.`,
      primaryKeywords: [`Online Tutors ${emirate.name}`],
      secondaryKeywords: [
        `${emirate.name} Tutors`,
        `IGCSE Tutors ${emirate.name}`,
        `IB Tutors ${emirate.name}`,
        `Private Tutors ${emirate.name}`,
      ],
    },
    hero: {
      h1,
      supportingCopy: `CoachAcadem is an online tutoring platform for families in ${emirate.name} and across the UAE. Compare tutor profiles by subject and curriculum, then book lessons in the app. Lessons take place online.`,
      primaryCta: "Browse curricula",
      primaryCtaHref: "#curricula",
      secondaryCta: "Get the App",
      secondaryCtaHref: "#download-app",
    },
    understanding: {
      title: `Tutoring for families in ${emirate.name}`,
      paragraphs: [
        emirate.schoolContext,
        emirate.whyOnline,
        emirate.parentFocus,
        `Schools in ${emirate.name} are overseen by ${emirate.regulator}. CoachAcadem lessons are online, so students can learn with a tutor who teaches their curriculum without travelling to another emirate for each session.`,
      ],
    },
    curricula: {
      title: `Curricula taught online for ${emirate.name} students`,
      lead: "Open a curriculum page to compare tutors who teach that programme.",
      cards: CURRICULUM_CARDS,
    },
    subjects: {
      title: `Popular subjects for ${emirate.name} families`,
      lead: "These subject pages list tutors available through the CoachAcadem app.",
      cards: SUBJECT_CARDS,
    },
    whyParentsChoose: {
      title: "Why parents use CoachAcadem",
      lead: `A straightforward way for ${emirate.name} families to find qualified tutors, compare options, and book online.`,
      reasons: [
        {
          title: "Verified tutor profiles",
          description:
            "Tutors are checked by our team before they appear on the platform.",
        },
        {
          title: "Curriculum match",
          description:
            "Search by IGCSE, IB, A-Level, American Curriculum, or CBSE.",
        },
        {
          title: "Online across the UAE",
          description: `Students in ${emirate.name} can book online lessons without a local commute.`,
        },
        {
          title: "Book in the app",
          description:
            "Compare profiles, choose a time, and continue in chat after the lesson.",
        },
      ],
    },
    faq: {
      title: `Questions from ${emirate.name} parents`,
      items: [
        {
          question: `Can students in ${emirate.name} use CoachAcadem?`,
          answer: `Yes. CoachAcadem is available to families in ${emirate.name}. Lessons are online, so you can book a tutor who teaches your child's curriculum from anywhere in the UAE.`,
        },
        {
          question: "Are lessons in person or online?",
          answer:
            "Lessons on CoachAcadem are online. You search, compare, and book through the app.",
        },
        {
          question: `Which curricula can ${emirate.name} students find tutors for?`,
          answer:
            "You can search for IGCSE, IB, A-Level, American Curriculum, and CBSE tutors, as well as individual subjects such as Mathematics, English, and the sciences.",
        },
        {
          question: "How do I book a tutor?",
          answer:
            "Download the CoachAcadem app, search by subject or curriculum, compare profiles, and book a lesson at a time that works for your child.",
        },
      ],
    },
    downloadApp: {
      title: "CoachAcadem in your pocket",
      supportingCopy:
        "Search tutors, manage bookings, communicate with tutors and continue learning from one platform.",
    },
    relatedCities: {
      title: "Online tutors in other emirates",
      lead: "CoachAcadem is available to families across the UAE.",
      items: EMIRATES.filter((item) => item.slug !== emirate.slug).map(
        (item) => ({
          name: item.name,
          description: `Find online tutors for families in ${item.name}.`,
          href: cityHubPath(item.slug),
          cta: `${item.name} tutors`,
        })
      ),
    },
  };
}

const CITY_PAGES: Record<string, CityPageData> = Object.fromEntries(
  EMIRATES.map((emirate) => {
    const page = buildCityPage(emirate);
    return [page.slug, page];
  })
);

export function getAllCityPageSlugs(): string[] {
  return Object.keys(CITY_PAGES);
}

export function getCityPageBySlug(slug: string): CityPageData | undefined {
  return CITY_PAGES[slug];
}

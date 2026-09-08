import type { Locale } from "./locale";
import type { FaqItem, Review, WhyParentsReason } from "@/lib/subjects/types";

export type UiMessages = {
  getTheApp: string;
  scanToDownload: string;
  faqTitle: string;
  hero: {
    h1: string;
    supporting: string;
  };
  howItWorks: {
    title: string;
    lead: string;
    steps: { step: string; items: string[] }[];
  };
  curricula: {
    title: string;
    lead: string;
    cards: {
      title: string;
      description: string;
      href: string;
      cta: string;
      badgeClass: string;
    }[];
  };
  download: {
    title: string;
    supporting: string;
  };
  search: {
    subject: string;
    curriculum: string;
    placeholderSubject: string;
    placeholderCurriculum: string;
    submit: string;
  };
  comingSoon: {
    kicker: string;
    body: string;
    home: string;
  };
  homeFaqs: FaqItem[];
  nav: {
    findTutors: string;
    curricula: string;
    locations: string;
    howItWorks: string;
    resources: string;
    becomeATutor: string;
    parentGuides: string;
    studyTips: string;
    examPreparation: string;
    blog: string;
  };
  footer: {
    tagline: string;
    subjects: string;
    company: string;
    about: string;
    contact: string;
    rights: string;
    terms: string;
    privacy: string;
    safeguarding: string;
    faq: string;
  };
  trust: {
    title: string;
  };
  whyParents: {
    title: string;
    lead: string;
    reasons: WhyParentsReason[];
  };
  testimonials: {
    title: string;
    verified: string;
    items: Review[];
  };
  topTutors: {
    title: string;
    subjects: string;
    curricula: string;
    reviews: string;
    years: string;
    viewProfile: string;
  };
  resources: {
    kicker: string;
    parentGuidesTitle: string;
    parentGuidesLead: string;
    examTitle: string;
    examLead: string;
    published: string;
    englishBodyNote: string;
    parentGuidesCategory: string;
    examCategory: string;
  };
  legal: {
    toc: string;
    effectiveDate: string;
    englishBodyNote: string;
  };
  pageChrome: {
    featuredTutors: string;
    featuredTutorsLead: string;
    howTutorsHelp: string;
    findByCurriculum: string;
    findByCurriculumLead: string;
    exploreCta: string;
    relatedSubjects: string;
    exploreSubjects: string;
    exploreSubjectsLead: string;
    reviewsTitle: string;
    reviewsLead: string;
    understandingCurriculum: string;
    subjectsForCurriculum: string;
    relatedCurricula: string;
  };
  qr: {
    getTheApp: string;
    close: string;
  };
  openMenu: string;
  closeMenu: string;
};

export const messages: Record<Locale, UiMessages> = {
  en: {
    getTheApp: "Get the App",
    scanToDownload: "Scan to download on iOS or Android",
    faqTitle: "Q&A for the curious",
    hero: {
      h1: "The UAE's app-first tutoring platform — KHDA-verified tutors for every curriculum.",
      supporting:
        "Compare tutor profiles, book in the app, and learn online — IGCSE, IB, A-Level, American, CBSE, and more.",
    },
    howItWorks: {
      title: "How CoachAcadem works",
      lead: "CoachAcadem helps students and parents discover, compare and book tutors through one platform.",
      steps: [
        { step: "Search", items: ["Browse tutors by subject and curriculum."] },
        {
          step: "Compare",
          items: [
            "Review qualifications, ratings, reviews, experience and curriculum expertise.",
          ],
        },
        {
          step: "Book",
          items: ["Choose instant booking or schedule a lesson."],
        },
        {
          step: "Learn",
          items: [
            "Attend lessons online and continue communication through built-in chat.",
          ],
        },
      ],
    },
    curricula: {
      title: "Find tutors by curriculum",
      lead: "Explore tutors who teach within the curriculum your child follows.",
      cards: [
        {
          title: "IGCSE",
          description:
            "Explore support across mathematics, sciences, languages, humanities and exam preparation.",
          href: "/igcse-tutors",
          cta: "Explore IGCSE Tutors",
          badgeClass: "bg-teal-200 text-teal-900",
        },
        {
          title: "IB",
          description:
            "Connect with tutors experienced in the demands of the International Baccalaureate programme.",
          href: "/ib-tutors",
          cta: "Explore IB Tutors",
          badgeClass: "bg-yellow-200 text-yellow-900",
        },
        {
          title: "A-Level",
          description:
            "Advanced academic support for examination success and university preparation.",
          href: "/a-level-tutors",
          cta: "Explore A-Level Tutors",
          badgeClass: "bg-blue-200 text-blue-900",
        },
        {
          title: "American Curriculum",
          description:
            "Curriculum-aligned tutoring designed around grade-level expectations.",
          href: "/american-curriculum-tutors",
          cta: "Explore American Curriculum Tutors",
          badgeClass: "bg-blue-200 text-blue-900",
        },
        {
          title: "CBSE",
          description:
            "Structured support across key subjects with a focus on academic performance.",
          href: "/cbse-tutors",
          cta: "Explore CBSE Tutors",
          badgeClass: "bg-blue-200 text-blue-900",
        },
      ],
    },
    download: {
      title: "CoachAcadem in your pocket",
      supporting:
        "Search tutors, manage bookings, communicate with tutors and continue learning from one platform.",
    },
    search: {
      subject: "Subject",
      curriculum: "Curriculum",
      placeholderSubject: "Select a subject",
      placeholderCurriculum: "Select a curriculum",
      submit: "Search",
    },
    comingSoon: {
      kicker: "Coming Soon",
      body: "We are preparing this page with verified tutor listings, curriculum details, and helpful resources. Check back soon or explore what is already available on CoachAcadem.",
      home: "Back to Home",
    },
    homeFaqs: [
      {
        question: "How do I find a tutor on CoachAcadem?",
        answer:
          "You can search for tutors by name, subject, curriculum, and academic level. You can also filter your search results by location, availability, and price.",
      },
      {
        question: "Are tutors verified?",
        answer:
          "Yes, all tutors are verified by our team and only those who are certified and verified by KHDA are allowed to teach on our platform. You do not have to worry.",
      },
      {
        question: "Can I read tutor reviews before booking?",
        answer:
          "Yes, you can read tutor reviews before booking. You can also read reviews from other parents who have booked the tutor.",
      },
      {
        question: "Do tutors support different curricula?",
        answer:
          "Yes, tutors support different curricula. You can search for tutors by curriculum and academic level.",
      },
      {
        question: "Can lessons be booked instantly?",
        answer:
          "Yes, lessons can be booked instantly. You can book a lesson by clicking the book button and selecting the date and time.",
      },
      {
        question: "How do I communicate with tutors?",
        answer:
          "You can communicate with tutors by clicking the chat button and sending a message. You can also call the tutor by clicking the call button and entering the phone number.",
      },
      {
        question:
          "Can students in Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah and Umm Al Quwain use CoachAcadem?",
        answer:
          "Yes, students in Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah and Umm Al Quwain can use CoachAcadem. We are currently available in the UAE and we are working to expand to other countries soon.",
      },
    ],
    nav: {
      findTutors: "Find Tutors",
      curricula: "Curricula",
      locations: "Locations",
      howItWorks: "How it works",
      resources: "Resources",
      becomeATutor: "Become a Tutor",
      parentGuides: "Parent Guides",
      studyTips: "Study Tips",
      examPreparation: "Exam Preparation",
      blog: "Blog",
    },
    footer: {
      tagline: "Learn and grow with CoachAcadem.",
      subjects: "Subjects",
      company: "Company",
      about: "About",
      contact: "Contact Us",
      rights: "All rights reserved.",
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      safeguarding: "Child Safeguarding Policy",
      faq: "FAQ",
    },
    trust: {
      title: "Find trusted tutors for your child's curriculum",
    },
    whyParents: {
      title: "Why parents choose CoachAcadem",
      lead: "A trusted way to find qualified tutors, compare options, and book with confidence.",
      reasons: [
        {
          title: "Verified Tutor Profiles",
          description: "Every tutor is verified before appearing on the platform.",
        },
        {
          title: "Curriculum Expertise",
          description: "Search by curriculum, subject and academic level.",
        },
        {
          title: "Ratings and Reviews",
          description: "Review feedback before booking.",
        },
        {
          title: "Instant and Scheduled Booking",
          description: "Book now or schedule later.",
        },
        {
          title: "Built-In Communication",
          description: "Communicate through the platform after booking.",
        },
        {
          title: "Access Across the UAE",
          description: "Online tutoring available throughout the Emirates.",
        },
      ],
    },
    testimonials: {
      title: "Experiences shared across the UAE",
      verified: "Verified reviews only.",
      items: [
        {
          content:
            "My daughter's IGCSE Chemistry grade went from a 6 to a 9 in one term. Her tutor explained every topic clearly and made revision feel manageable before exams.",
          author: "Sara Al Mansoori",
          role: "Parent in Dubai · IGCSE Chemistry",
        },
        {
          content:
            "We needed an IB Math tutor who understood the pressure of Predicted Grades. CoachAcadem matched us quickly, and my son finally feels confident going into assessments.",
          author: "James Whitfield",
          role: "Parent in Abu Dhabi · IB Mathematics",
        },
        {
          content:
            "Booking A-Level Physics support for my teenager took minutes. The tutor is verified, patient, and sends clear progress updates after every lesson.",
          author: "Fatima Rahman",
          role: "Parent in Sharjah · A-Level Physics",
        },
      ],
    },
    topTutors: {
      title: "Featured tutors",
      subjects: "Subjects",
      curricula: "Curricula",
      reviews: "{n} reviews",
      years: "{n} years teaching experience",
      viewProfile: "View Tutor Profile",
    },
    resources: {
      kicker: "Resources",
      parentGuidesTitle: "Parent Guides",
      parentGuidesLead:
        "Practical, UAE-focused guidance for parents choosing curricula, exam pathways, and next steps after IGCSE.",
      examTitle: "Exam Preparation",
      examLead:
        "Clear, parent-focused guides on exam timings, retakes, and revision strategy for students in the UAE.",
      published: "Published {date}",
      englishBodyNote: "The full article below is in English.",
      parentGuidesCategory: "Parent Guides",
      examCategory: "Exam Preparation",
    },
    legal: {
      toc: "Table of Contents",
      effectiveDate: "Effective Date",
      englishBodyNote:
        "The full legal text below is in English. That English text is the binding version.",
    },
    pageChrome: {
      featuredTutors: "Featured {name} Tutors",
      featuredTutorsLead:
        "Compare experienced tutors. Review qualifications, ratings, and teaching experience.",
      howTutorsHelp: "How {name} Tutors Can Help",
      findByCurriculum: "Find {name} Tutors by Curriculum",
      findByCurriculumLead:
        "Different curricula approach this subject with varying content depth, assessment methods, and learning objectives.",
      exploreCta: "Explore {name} Tutors",
      relatedSubjects: "Related Subjects",
      exploreSubjects: "Explore other subjects",
      exploreSubjectsLead: "Browse related subjects available on CoachAcadem.",
      reviewsTitle: "Student and Parent Reviews",
      reviewsLead:
        "Feedback from students and parents on teaching approach, communication, and academic support.",
      understandingCurriculum: "Understanding {name}",
      subjectsForCurriculum: "{name} subjects",
      relatedCurricula: "Other curricula",
    },
    qr: {
      getTheApp: "Get the app",
      close: "Close QR floater",
    },
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  ar: {
    getTheApp: "حمّل التطبيق",
    scanToDownload: "امسح الرمز للتحميل على iOS أو Android",
    faqTitle: "أسئلة شائعة",
    hero: {
      h1: "منصة الإمارات للدروس عبر التطبيق — معلمون موثّقون من KHDA لكل منهج.",
      supporting:
        "قارن ملفات المعلمين واحجز من التطبيق وتعلّم أونلاين — IGCSE والبكالوريا الدولية وA-Level والمنهج الأمريكي وCBSE وغيرها.",
    },
    howItWorks: {
      title: "كيف يعمل كوتش أكاديم",
      lead: "يساعد كوتش أكاديم الأهالي والطلاب على اكتشاف المعلمين ومقارنتهم وحجز الحصص من منصة واحدة.",
      steps: [
        { step: "ابحث", items: ["تصفّح المعلمين حسب المادة والمنهج."] },
        {
          step: "قارن",
          items: ["راجع المؤهلات والتقييمات والخبرة والمنهج."],
        },
        { step: "احجز", items: ["احجز فوراً أو حدّد موعداً لاحقاً."] },
        {
          step: "تعلّم",
          items: ["احضر الحصص أونلاين وتواصل عبر الدردشة داخل التطبيق."],
        },
      ],
    },
    curricula: {
      title: "ابحث عن معلمين حسب المنهج",
      lead: "استكشف معلمين يدرّسون وفق المنهج الذي يتبعه طفلك.",
      cards: [
        {
          title: "IGCSE",
          description:
            "دعم في الرياضيات والعلوم واللغات والإنسانيات والتحضير للامتحانات.",
          href: "/igcse-tutors",
          cta: "استكشف معلمي IGCSE",
          badgeClass: "bg-teal-200 text-teal-900",
        },
        {
          title: "IB",
          description:
            "تواصل مع معلمين لديهم خبرة في متطلبات برنامج البكالوريا الدولية.",
          href: "/ib-tutors",
          cta: "استكشف معلمي البكالوريا الدولية",
          badgeClass: "bg-yellow-200 text-yellow-900",
        },
        {
          title: "A-Level",
          description: "دعم أكاديمي متقدم للنجاح في الامتحانات والتحضير للجامعة.",
          href: "/a-level-tutors",
          cta: "استكشف معلمي A-Level",
          badgeClass: "bg-blue-200 text-blue-900",
        },
        {
          title: "المنهج الأمريكي",
          description: "دروس متوافقة مع المنهج وفق توقعات كل صف دراسي.",
          href: "/american-curriculum-tutors",
          cta: "استكشف معلمي المنهج الأمريكي",
          badgeClass: "bg-blue-200 text-blue-900",
        },
        {
          title: "CBSE",
          description: "دعم منظّم في المواد الأساسية مع التركيز على الأداء الأكاديمي.",
          href: "/cbse-tutors",
          cta: "استكشف معلمي CBSE",
          badgeClass: "bg-blue-200 text-blue-900",
        },
      ],
    },
    download: {
      title: "كوتش أكاديم في جيبك",
      supporting:
        "ابحث عن معلمين، أدِر الحجوزات، تواصل مع المعلمين، وتابع التعلّم من منصة واحدة.",
    },
    search: {
      subject: "المادة",
      curriculum: "المنهج",
      placeholderSubject: "اختر مادة",
      placeholderCurriculum: "اختر منهجاً",
      submit: "بحث",
    },
    comingSoon: {
      kicker: "قريباً",
      body: "نجهّز هذه الصفحة بقوائم المعلمين وتفاصيل المناهج والموارد المفيدة. يمكنك العودة لاحقاً أو تصفّح ما هو متوفر الآن على كوتش أكاديم.",
      home: "العودة للرئيسية",
    },
    homeFaqs: [
      {
        question: "كيف أجد معلماً على كوتش أكاديم؟",
        answer:
          "يمكنك البحث عن المعلمين حسب الاسم والمادة والمنهج والمستوى الدراسي. ويمكنك أيضاً تصفية النتائج حسب الموقع والتوفر والسعر.",
      },
      {
        question: "هل المعلمون موثّقون؟",
        answer:
          "نعم، يتم التحقق من جميع المعلمين من قبل فريقنا، ويُسمح بالتدريس على المنصة فقط لمن هم معتمدون وموثّقون من هيئة المعرفة والتنمية البشرية (KHDA).",
      },
      {
        question: "هل يمكنني قراءة تقييمات المعلمين قبل الحجز؟",
        answer:
          "نعم، يمكنك قراءة تقييمات المعلمين قبل الحجز، بما في ذلك تقييمات أهالي حجزوا مع المعلم سابقاً.",
      },
      {
        question: "هل يدعم المعلمون مناهج مختلفة؟",
        answer:
          "نعم، يدعم المعلمون مناهج مختلفة. يمكنك البحث حسب المنهج والمستوى الدراسي.",
      },
      {
        question: "هل يمكن حجز الحصص فوراً؟",
        answer:
          "نعم، يمكن حجز الحصص فوراً عبر زر الحجز واختيار التاريخ والوقت.",
      },
      {
        question: "كيف أتواصل مع المعلمين؟",
        answer:
          "يمكنك التواصل عبر زر الدردشة وإرسال رسالة، أو الاتصال بالمعلم عبر زر الاتصال.",
      },
      {
        question:
          "هل يمكن للطلاب في دبي وأبوظبي والشارقة وعجمان والفجيرة ورأس الخيمة وأم القيوين استخدام كوتش أكاديم؟",
        answer:
          "نعم، يمكن للطلاب في دبي وأبوظبي والشارقة وعجمان والفجيرة ورأس الخيمة وأم القيوين استخدام كوتش أكاديم. نحن متاحون حالياً في الإمارات ونعمل على التوسع إلى دول أخرى قريباً.",
      },
    ],
    nav: {
      findTutors: "ابحث عن معلمين",
      curricula: "المناهج",
      locations: "المواقع",
      howItWorks: "كيف يعمل",
      resources: "الموارد",
      becomeATutor: "كن معلماً",
      parentGuides: "أدلة الأهالي",
      studyTips: "نصائح دراسية",
      examPreparation: "التحضير للامتحانات",
      blog: "المدونة",
    },
    footer: {
      tagline: "تعلّم وتقدّم مع كوتش أكاديم.",
      subjects: "المواد",
      company: "الشركة",
      about: "عنّا",
      contact: "تواصل معنا",
      rights: "جميع الحقوق محفوظة.",
      terms: "شروط الاستخدام",
      privacy: "سياسة الخصوصية",
      safeguarding: "سياسة حماية الطفل",
      faq: "الأسئلة الشائعة",
    },
    trust: {
      title: "اعثر على معلمين موثوقين لمنهج طفلك",
    },
    whyParents: {
      title: "لماذا يختار الأهالي كوتش أكاديم",
      lead: "طريقة موثوقة للعثور على معلمين مؤهلين ومقارنة الخيارات والحجز بثقة.",
      reasons: [
        {
          title: "ملفات معلمين موثّقة",
          description: "يتم التحقق من كل معلم قبل ظهوره على المنصة.",
        },
        {
          title: "خبرة في المناهج",
          description: "ابحث حسب المنهج والمادة والمستوى الدراسي.",
        },
        {
          title: "التقييمات والمراجعات",
          description: "اقرأ التقييمات قبل الحجز.",
        },
        {
          title: "حجز فوري أو مجدول",
          description: "احجز الآن أو حدّد موعداً لاحقاً.",
        },
        {
          title: "تواصل داخل المنصة",
          description: "تواصل عبر المنصة بعد الحجز.",
        },
        {
          title: "متاح في أنحاء الإمارات",
          description: "دروس أونلاين متاحة في جميع الإمارات.",
        },
      ],
    },
    testimonials: {
      title: "تجارب من أنحاء الإمارات",
      verified: "تقييمات موثّقة فقط.",
      items: [
        {
          content:
            "ارتفعت درجة ابنتي في كيمياء IGCSE من 6 إلى 9 خلال فصل واحد. شرح معلّمها كل موضوع بوضوح وجعل المراجعة قبل الامتحانات قابلة للإدارة.",
          author: "سارة المنصوري",
          role: "ولية أمر في دبي · كيمياء IGCSE",
        },
        {
          content:
            "كنا نحتاج معلم رياضيات للبكالوريا الدولية يفهم ضغط الدرجات المتوقعة. وجدنا المطابقة بسرعة، وأصبح ابني أكثر ثقة قبل التقييمات.",
          author: "جيمس ويتفيلد",
          role: "ولي أمر في أبوظبي · رياضيات البكالوريا الدولية",
        },
        {
          content:
            "حجز دعم فيزياء A-Level لابنتي المراهقة استغرق دقائق. المعلم موثّق وصبور ويرسل تحديثات واضحة بعد كل حصة.",
          author: "فاطمة رحمن",
          role: "ولية أمر في الشارقة · فيزياء A-Level",
        },
      ],
    },
    topTutors: {
      title: "معلمون مميزون",
      subjects: "المواد",
      curricula: "المناهج",
      reviews: "{n} تقييمات",
      years: "{n} سنوات خبرة في التدريس",
      viewProfile: "عرض ملف المعلم",
    },
    resources: {
      kicker: "الموارد",
      parentGuidesTitle: "أدلة الأهالي",
      parentGuidesLead:
        "إرشاد عملي لأهالي الإمارات حول اختيار المناهج ومسارات الامتحانات والخطوات بعد IGCSE.",
      examTitle: "التحضير للامتحانات",
      examLead:
        "أدلة واضحة للأهالي حول مواعيد الامتحانات والإعادة وخطة المراجعة لطلاب الإمارات.",
      published: "نُشر في {date}",
      englishBodyNote: "نص المقال الكامل أدناه بالإنجليزية.",
      parentGuidesCategory: "أدلة الأهالي",
      examCategory: "التحضير للامتحانات",
    },
    legal: {
      toc: "جدول المحتويات",
      effectiveDate: "تاريخ السريان",
      englishBodyNote:
        "النص القانوني الكامل أدناه بالإنجليزية، وهو النص المعتمد.",
    },
    pageChrome: {
      featuredTutors: "معلمو {name} المميزون",
      featuredTutorsLead:
        "قارن معلمين ذوي خبرة. راجع المؤهلات والتقييمات وسنوات التدريس.",
      howTutorsHelp: "كيف يساعد معلمو {name}",
      findByCurriculum: "ابحث عن معلمي {name} حسب المنهج",
      findByCurriculumLead:
        "تختلف المناهج في عمق المحتوى وطريقة التقييم وأهداف التعلّم.",
      exploreCta: "استكشف معلمي {name}",
      relatedSubjects: "مواد ذات صلة",
      exploreSubjects: "استكشف مواد أخرى",
      exploreSubjectsLead: "تصفّح مواد ذات صلة متوفرة على كوتش أكاديم.",
      reviewsTitle: "تجارب الطلاب والأهالي",
      reviewsLead:
        "ملاحظات من الطلاب والأهالي حول أسلوب التدريس والتواصل والدعم الأكاديمي.",
      understandingCurriculum: "تعرّف على منهج {name}",
      subjectsForCurriculum: "مواد {name}",
      relatedCurricula: "مناهج أخرى",
    },
    qr: {
      getTheApp: "حمّل التطبيق",
      close: "إغلاق رمز التحميل",
    },
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },
};

export function t(locale: Locale): UiMessages {
  return messages[locale];
}

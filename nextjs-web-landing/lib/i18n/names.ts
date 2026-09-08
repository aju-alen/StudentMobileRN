export const EMIRATE_NAME_AR: Record<string, string> = {
  dubai: "دبي",
  "abu-dhabi": "أبوظبي",
  sharjah: "الشارقة",
  ajman: "عجمان",
  "ras-al-khaimah": "رأس الخيمة",
  fujairah: "الفجيرة",
  "umm-al-quwain": "أم القيوين",
};

export const CURRICULUM_NAME_AR: Record<string, string> = {
  igcse: "IGCSE",
  gcse: "GCSE",
  ib: "البكالوريا الدولية",
  "a-level": "A-Level",
  "american-curriculum": "المنهج الأمريكي",
  cbse: "CBSE",
};

export const SUBJECT_NAME_AR: Record<string, string> = {
  mathematics: "الرياضيات",
  math: "الرياضيات",
  english: "اللغة الإنجليزية",
  physics: "الفيزياء",
  chemistry: "الكيمياء",
  biology: "الأحياء",
  arabic: "اللغة العربية",
  economics: "الاقتصاد",
  accounting: "المحاسبة",
  "computer-science": "علوم الحاسوب",
  "business-studies": "دراسات الأعمال",
  history: "التاريخ",
  geography: "الجغرافيا",
  french: "الفرنسية",
  spanish: "الإسبانية",
  science: "العلوم",
  statistics: "الإحصاء",
  psychology: "علم النفس",
  "creative-writing": "الكتابة الإبداعية",
  languages: "اللغات",
};

export const SUBJECT_BLURB_AR: Record<string, { name: string; description: string }> = {
  English: {
    name: "اللغة الإنجليزية",
    description:
      "مهارات الإنجليزية القوية تساعد طفلك في كل المواد. إذا أصبح فهم القراءة أو كتابة المقالات أو تحليل الأدب تحدياً، يمكن لمعلم اللغة الإنجليزية تقديم التوجيه والتدريب اللازم لبناء الثقة.",
  },
  Math: {
    name: "الرياضيات",
    description:
      "قد تصبح الرياضيات محبطة عندما تظهر فجوات في الفهم. يساعد معلم الرياضيات طفلك على تثبيت المفاهيم الأساسية وحل المسائل بثقة والاستعداد أفضل للاختبارات والامتحانات.",
  },
  Physics: {
    name: "الفيزياء",
    description:
      "تطلب الفيزياء من الطلاب تفسير العالم من خلال القوى والحركة والطاقة والكهرباء والمادة. عندما تنفصل القوانين عن النظرية، يساعد معلم الفيزياء على ربطها معاً.",
  },
  Chemistry: {
    name: "الكيمياء",
    description:
      "يستمتع كثير من الطلاب بالكيمياء حتى تتشابك الموضوعات. يساعد معلم الكيمياء على فهم التفاعلات والروابط والمعادلات والمفاهيم العملية.",
  },
  Biology: {
    name: "الأحياء",
    description:
      "الأحياء مليء بأفكار شيقة لكنه يتطلب تذكّر تفاصيل كثيرة. يساعد معلم الأحياء طفلك على فهم العمليات المعقدة وربط الموضوعات والاستعداد للامتحانات بثقة أكبر.",
  },
  Arabic: {
    name: "اللغة العربية",
    description:
      "قد تكون العربية صعبة عندما تتطور القراءة والكتابة والقواعد والمفردات بسرعات مختلفة. يساعد معلم العربية طفلك على تقوية المهارات واستخدام اللغة بثقة في المدرسة.",
  },
  Economics: {
    name: "الاقتصاد",
    description:
      "الاقتصاد يشرح قرارات الأفراد والشركات والحكومات. إذا بدت النظريات والرسوم البيانية وأسئلة التقييم صعبة، يساعد معلم الاقتصاد على توضيحها وتطبيقها.",
  },
  "Business Studies": {
    name: "دراسات الأعمال",
    description:
      "دراسات الأعمال تتجاوز حفظ النظرية. يُتوقع من الطلاب تحليل المواقف والتفكير النقدي وتبرير قراراتهم. يساعد المعلم على تطوير هذه المهارات وتحسين الأداء.",
  },
  "Computer Science": {
    name: "علوم الحاسوب",
    description:
      "غالباً ما يتحدى علوم الحاسوب طريقة تفكير الطلاب. من البرمجة والخوارزميات إلى التفكير الحاسوبي، يساعد المعلم على تقسيم الموضوعات المعقدة وبناء الثقة.",
  },
  Statistics: {
    name: "الإحصاء",
    description:
      "الإحصاء يعني فهم المعلومات لا التعامل مع الأرقام فقط. إذا بدا تفسير البيانات أو الاحتمالات أو الأساليب الإحصائية مربكاً، يساعد معلم الإحصاء على بناء مهارات تحليل أقوى.",
  },
  Science: {
    name: "العلوم",
    description:
      "العلوم يشجّع الفضول والاستقصاء وحل المشكلات. عندما تتسارع الموضوعات أو يصعب ربط المفاهيم، يساعد معلم العلوم طفلك على الفهم والبقاء منخرطاً.",
  },
  Psychology: {
    name: "علم النفس",
    description:
      "علم النفس يستكشف لماذا يفكر الناس ويتصرفون ويستجيبون كما يفعلون. يساعد المعلم طفلك على فهم النظريات وتقييم الأدلة وتقديم إجابات أقوى في التقييمات.",
  },
  French: {
    name: "الفرنسية",
    description:
      "تعلّم الفرنسية يحتاج وقتاً وممارسة وثقة في استخدام اللغة. يساعد معلم الفرنسية طفلك على تحسين التحدث والاستماع والقراءة والكتابة.",
  },
  "Creative Writing Tutors": {
    name: "الكتابة الإبداعية",
    description:
      "طوّر السرد والشعر ومهارات الكتابة مع معلمين يساعدونك على إيجاد صوتك وتقوية كتابتك لأي مشروع.",
  },
  "Language Tutors": {
    name: "اللغات",
    description:
      "حسّن التحدث والاستماع والقراءة والكتابة في اللغة التي تختارها مع معلمين يدعمون تقدّمك في كل مستوى.",
  },
};

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\s+tutors$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function subjectNameAr(nameOrSlug: string): string {
  const slug = slugifyName(nameOrSlug.replace(/-tutors$/, ""));
  return SUBJECT_NAME_AR[slug] ?? nameOrSlug;
}

export function curriculumNameAr(nameOrSlug: string): string {
  const slug = slugifyName(nameOrSlug.replace(/-tutors$/, ""));
  return CURRICULUM_NAME_AR[slug] ?? nameOrSlug;
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

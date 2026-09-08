export type Emirate = {
  slug: string;
  name: string;
  regulator: string;
  schoolContext: string;
  whyOnline: string;
  parentFocus: string;
};

export const EMIRATES: Emirate[] = [
  {
    slug: "dubai",
    name: "Dubai",
    regulator: "KHDA",
    schoolContext:
      "Dubai has one of the largest private-school communities in the UAE. Families typically follow British, IB, American, or CBSE pathways in KHDA-regulated schools.",
    whyOnline:
      "Online lessons make it easier to keep a consistent tutor when families move between communities, travel, or need a subject specialist who is not based nearby.",
    parentFocus:
      "Parents in Dubai often look for tutors who already teach the same exam board and year group their child follows at school.",
  },
  {
    slug: "abu-dhabi",
    name: "Abu Dhabi",
    regulator: "ADEK",
    schoolContext:
      "Abu Dhabi families choose from a wide range of ADEK-regulated private schools, including British, IB, American, and other international curricula.",
    whyOnline:
      "Online tutoring helps students in Abu Dhabi and on the islands keep regular lesson times without adding another commute to an already full school week.",
    parentFocus:
      "Parents often want tutors who understand ADEK school expectations and the curriculum their child is examined in.",
  },
  {
    slug: "sharjah",
    name: "Sharjah",
    regulator: "SPEA",
    schoolContext:
      "Sharjah has a large school community under SPEA, with many families following British, IB, American, or CBSE programmes.",
    whyOnline:
      "Online lessons give Sharjah families access to tutors across the UAE without depending on traffic between home, school, and another neighbourhood.",
    parentFocus:
      "Parents in Sharjah typically want tutors who can support homework, exam technique, and the specific curriculum used at school.",
  },
  {
    slug: "ajman",
    name: "Ajman",
    regulator: "the UAE Ministry of Education",
    schoolContext:
      "Ajman families use a mix of local and international schools. Many students follow the same IGCSE, IB, American, or CBSE pathways as neighbouring emirates.",
    whyOnline:
      "Because Ajman is close to Sharjah and Dubai, families often want the same specialist tutors without travelling for every lesson. Online sessions make that practical.",
    parentFocus:
      "Parents in Ajman look for verified tutors who can match the curriculum and year group their child is studying.",
  },
  {
    slug: "ras-al-khaimah",
    name: "Ras Al Khaimah",
    regulator: "the UAE Ministry of Education",
    schoolContext:
      "Ras Al Khaimah students attend a mix of public and private schools, including international curricula used across the UAE.",
    whyOnline:
      "Online tutoring reduces travel time across the emirate and gives families access to subject specialists who may not be based in Ras Al Khaimah.",
    parentFocus:
      "Parents often want a regular online slot that fits school hours and a tutor who already teaches their child's curriculum.",
  },
  {
    slug: "fujairah",
    name: "Fujairah",
    regulator: "the UAE Ministry of Education",
    schoolContext:
      "Fujairah families on the east coast use local and international schools. Students often need the same IGCSE, IB, American, or CBSE support as elsewhere in the UAE.",
    whyOnline:
      "Online lessons connect Fujairah students with tutors across the country without a long drive for each session.",
    parentFocus:
      "Parents in Fujairah typically want reliable online booking and tutors who teach the curriculum used at their child's school.",
  },
  {
    slug: "umm-al-quwain",
    name: "Umm Al Quwain",
    regulator: "the UAE Ministry of Education",
    schoolContext:
      "Umm Al Quwain has a smaller school community. Many families still follow the same international and national curricula used across the UAE.",
    whyOnline:
      "Online tutoring gives Umm Al Quwain students access to a wider pool of subject specialists than they may find locally.",
    parentFocus:
      "Parents often want a simple way to compare tutors and book online lessons that fit around school.",
  },
];

export function cityHubPath(emirateSlug: string): string {
  return `/${emirateSlug}`;
}

export function getEmirateBySlug(slug: string): Emirate | undefined {
  const hub = slug.endsWith("-tutors") ? slug.slice(0, -"-tutors".length) : slug;
  return EMIRATES.find((emirate) => emirate.slug === hub);
}

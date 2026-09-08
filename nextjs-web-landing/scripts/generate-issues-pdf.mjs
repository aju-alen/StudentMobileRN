import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  "..",
  "CoachAcadem_Technical_and_Content_Issues.pdf"
);

const NAVY = "#205072";
const TEAL = "#24bcc7";
const INK = "#1f2937";
const MUTED = "#4b5563";
const RULE = "#d1d5db";
const PILL_TECH = "#0f766e";
const PILL_CONTENT = "#9a3412";
const PILL_BOTH = "#1d4ed8";

const techIssues = [
  {
    id: "T01",
    title: "Android / Play Store path is incomplete",
    files:
      "lib/constants.ts · components/Header.tsx · components/ComingSoon.tsx · components/QRCodeFloater.tsx · components/Hero.tsx · data/curricula/*.json · data/subjects/*.json (secondaryCtaHref)",
    problem:
      "Footer and the download banner already use PLAY_STORE_URL. Header Get the App, Coming Soon Get the App, curriculum/subject hero Get the App, and both QR codes still open apps.apple.com/us/. The old #download-play-store dead anchor is gone, but Android users on the primary CTAs still land on iOS.",
    steps: [
      "Keep APP_STORE_URL and PLAY_STORE_URL in lib/constants.ts as the only store URLs. Change the Apple URL country from /us/ to /ae/ if that is the intended storefront.",
      "In Header.tsx replace the button + window.open(APP_STORE_URL) with two links (App Store and Google Play) or one link that picks PLAY_STORE_URL on Android user agents and APP_STORE_URL otherwise. Use a real <a href>, not window.open.",
      "In ComingSoon.tsx import PLAY_STORE_URL / APP_STORE_URL instead of a hardcoded Apple URL. Same dual-link or UA pattern.",
      "In Hero.tsx and QRCodeFloater.tsx stop encoding only APP_STORE_URL in APP_DOWNLOAD_QR. Either encode a landing URL that offers both stores (e.g. /#download-app) or show two QR codes. The floater tap target already switches by UA; the visible QR must match.",
      "In every curriculum and subject JSON, stop using the Apple URL as secondaryCtaHref. Point Get the App at #download-app (the DownloadApp section already has both store buttons) or duplicate the dual-store control in CurriculumHero / SubjectHero.",
    ],
  },
  {
    id: "T02",
    title: "Homepage search does not navigate",
    files: "components/SearchSubjectCirricula.tsx",
    problem:
      "Submit sets window.location.hash to values such as mathematics-igcse-tutors. No element has that id, so the form does nothing.",
    steps: [
      "Map each subject option to an existing slug (English → /english-tutors, Math → /mathematics-tutors). Map each curriculum to /igcse-tutors, /ib-tutors, /a-level-tutors, /american-curriculum-tutors, /cbse-tutors.",
      "If both subject and curriculum are selected, navigate to the subject page that exists today (e.g. /mathematics-tutors). Do not invent /igcse-mathematics-tutors until that page is a real route.",
      "Remove Statistics, Psychology, Creative Writing, and Languages from the dropdown until those pages exist.",
      "Use window.location.assign(path) or next/navigation router.push. Delete the hash logic.",
    ],
  },
  {
    id: "T03",
    title: "Catch-all Coming Soon pages are indexable 200s",
    files: "app/[slug]/page.tsx",
    problem:
      "Any unknown one-segment URL renders Coming Soon. Only study-tips and blog are noindex. /about-coachacadem, /become-a-tutor, /gcse-tutors, /igcse-mathematics-tutors, /statistics-tutors, /dubai, and /ar return 200 and can be indexed as empty pages.",
    steps: [
      "In generateMetadata, set noIndex: true for every slug that is not a real subject (when getSubjectBySlug returns undefined).",
      "Prefer notFound() instead of Coming Soon for slugs that are not in an allowlist of intentional placeholders (blog, study-tips).",
      "Set dynamicParams to false so only generateStaticParams slugs exist, or keep Coming Soon but noindex all of them.",
      "Until city/Arabic/GCSE pages exist, do not link them from Header or Footer.",
    ],
  },
  {
    id: "T04",
    title: "Tutor profile URLs 404 or are dead hashes",
    files:
      "components/TopTutorCards.tsx · data/curricula/*.json · data/subjects/*.json · CurriculumJsonLd.tsx · SubjectJsonLd.tsx",
    problem:
      "Homepage buttons use #tutor-sini and #tutor-fatima-al-zaabi (Bonny). Inner pages use /tutors/sarah-hassan. That route does not exist (real 404). JSON-LD publishes those 404 URLs to Google.",
    steps: [
      "Until tutor profile pages exist, change View Tutor Profile to Get the App using APP_STORE_URL / PLAY_STORE_URL, or remove the button.",
      "If you keep a button, href must be a real URL. Do not use hashes that have no matching id.",
      "In CurriculumJsonLd and SubjectJsonLd, omit Person.url or set it to the current page URL (canonicalUrl(`/${slug}`)), never /tutors/{id} until that route exists.",
      "Fix the Bonny / #tutor-fatima-al-zaabi mismatch in defaultTutors.",
    ],
  },
  {
    id: "T05",
    title: "How it works nav jumps to the hero",
    files: "components/Header.tsx · components/HowCoachacademWorks.tsx",
    problem: "Nav href is /#home. The how-it-works section has no id.",
    steps: [
      "Add id=\"how-it-works\" to the <section> in HowCoachacademWorks.tsx.",
      "Change the Header item from /#home to /#how-it-works.",
    ],
  },
  {
    id: "T06",
    title: "JSON-LD is present but inaccurate",
    files:
      "app/layout.tsx · components/curriculum/CurriculumJsonLd.tsx · components/subject/SubjectJsonLd.tsx · lib/seo/create-metadata.ts",
    problem:
      "Organization + FAQPage exist. Person.url 404s. ItemList is emitted twice (nested in CollectionPage and as a sibling). No LocalBusiness / EducationalOrganization / Course / Review. hreflang advertises en-AE on English-only pages. Organization.sameAs is the site itself.",
    steps: [
      "In CurriculumJsonLd / SubjectJsonLd, output CollectionPage once with mainEntity ItemList. Delete the second standalone ItemList <script>.",
      "Do not output Person.url unless the profile page returns 200. Do not output Review or rating schema unless ratings are real.",
      "In layout.tsx Organization schema: add a telephone or email on contactPoint; set availableLanguage correctly; point sameAs at real social profiles or omit it; stop saying students of all ages if the product is school-age tutoring.",
      "In create-metadata.ts, remove the en-AE alternate (or keep a single x-default) until an Arabic locale exists. Set siteConfig.locale to en_AE.",
    ],
  },
  {
    id: "T07",
    title: "PWA manifest is placeholder data and /manifest.json 500’d",
    files: "public/manifest.json · app/layout.tsx",
    problem:
      "Manifest uses fake Apple id 1234567890, wrong Play package com.coachacadem.app (real id is com.rise.coachacadem), and routes that do not exist (/tutors, /courses, /dashboard, /upload, /share). Live fetch of /manifest.json returned HTTP 500. layout.tsx does not declare a manifest.",
    steps: [
      "Rewrite public/manifest.json: name, icons, start_url, theme_color only. related_applications must use com.rise.coachacadem and Apple id 6745173635.",
      "Delete shortcuts, file_handlers, share_target, protocol_handlers, and permissions that the marketing site does not implement.",
      "Add icons: { apple: … } is already there; also set metadata.manifest = '/manifest.json' in layout.tsx.",
      "After deploy, confirm https://www.coachacadem.ae/manifest.json returns 200.",
    ],
  },
  {
    id: "T08",
    title: "Nav/footer/search advertise URLs that are not pages",
    files:
      "components/Header.tsx · components/Footer.tsx · components/TutorLanguages.tsx · components/SearchSubjectCirricula.tsx · data/curricula/*.json · data/subjects/*.json",
    problem:
      "GCSE, About, Blog, Study Tips, Become a Tutor (header) are Coming Soon. Footer Become a Tutor opens the student App Store. Show more is href=#. Curriculum JSON links to /igcse-mathematics-tutors (Coming Soon) and shows invented counts such as 48 tutors. Arabic JSON links to /islamic-studies-tutors and /ministry-curriculum-arabic-tutors.",
    steps: [
      "Remove or hide nav/footer items whose routes are Coming Soon, or keep them only after those pages ship.",
      "Point Footer Become a Tutor at the same destination as Header once a real tutor-signup URL exists. Do not send tutor applicants to the student App Store listing unless that is the intended flow.",
      "In TutorLanguages.tsx delete the Show more href=# control, or make it expand the in-page list.",
      "In all curriculum/subject JSON, change combined hrefs (e.g. /igcse-mathematics-tutors) to the live subject page (/mathematics-tutors) until combo pages exist. Remove tutorCount or replace with a real number from the app.",
      "Add French, Spanish, History, Geography, Science to the header Find Tutors list if those pages should be discoverable (they are already in the sitemap).",
    ],
  },
  {
    id: "T09",
    title: "Tutors and testimonials are duplicated in the HTML",
    files: "components/TopTutorCards.tsx · components/Testimonials.tsx",
    problem:
      "A md:grid block and a md:hidden carousel both render the same cards. Crawlers and assistive tech see every tutor and review twice.",
    steps: [
      "Keep a single list of cards in the DOM.",
      "Use CSS for the mobile carousel (flex overflow-x on the same grid children, or a media-query display change). Do not mount two copies.",
      "If two layouts are required, aria-hidden=\"true\" the decorative copy and hide it from crawlers with CSS that still must not duplicate indexable text — single DOM is the correct fix.",
    ],
  },
  {
    id: "T10",
    title: "Images, third-party QR, and font payload",
    files:
      "app/layout.tsx · next.config.ts · lib/constants.ts · all <img> tags",
    problem:
      "next/image is unused. Production assets sit under S3 dummy-image. QR is generated by api.qrserver.com. next.config still allowlists randomuser.me and images.pexels.com. Three Google fonts load, Figtree with six weights.",
    steps: [
      "Replace <img> with next/image for local and allowed remote hosts. Keep remotePatterns only for hosts you still use.",
      "Remove randomuser.me and images.pexels.com from next.config.ts once those URLs are gone from JSON.",
      "Generate the QR at build time (SVG or PNG in /public) from APP_STORE_URL / the dual-store landing URL so the page does not call api.qrserver.com.",
      "In layout.tsx load one font family (Figtree) and only the weights you use (e.g. 400, 600, 700). Drop Montserrat and Lora unless a specific heading still needs them.",
      "Move production images out of the S3 prefix dummy-image (ops/CDN rename).",
    ],
  },
  {
    id: "T11",
    title: "Hero floating icons run a no-op animation loop",
    files: "components/Hero.tsx",
    problem:
      "FloatingElement requestAnimationFrame updates a local position variable, then voids the DOM node. Icons never move; the callback still runs.",
    steps: [
      "Delete FloatingElement and its useEffect, or apply the position to elementRef.current.style.transform.",
      "If motion is not needed, render static icons or remove them.",
    ],
  },
  {
    id: "T12",
    title: "Sitemap lastmod and robots.txt",
    files: "app/sitemap.ts · app/robots.ts",
    problem:
      "Live sitemap.xml lists 28 URLs, every lastmod 2026-08-18T13:26:43.319Z. Local code uses new Date() which would stamp every URL as now on each generate. robots.txt disallows /admin/ and /api/ which are not this site’s routes. Some fetchers received HTTP 500 for sitemap.xml.",
    steps: [
      "Set lastModified per route from a real date (content file mtime or a publishedAt field), not new Date() on every request.",
      "Remove Disallow /admin/ and /api/ unless those paths exist, or keep them only as a harmless deny.",
      "After deploy, curl -I https://www.coachacadem.ae/sitemap.xml and confirm 200.",
    ],
  },
  {
    id: "T13",
    title: "WhatsApp enquiry path is missing",
    files: "components/Footer.tsx · components/Header.tsx · app/layout.tsx",
    problem:
      "Footer contact is mailto:support@coachacadem.ae only. No wa.me link or widget on any fetched page.",
    steps: [
      "Add a WhatsApp Business number constant in lib/constants.ts (https://wa.me/<digits>).",
      "Add a Footer (and optional sticky) <a href={WHATSAPP_URL}> with rel=\"noopener noreferrer\".",
      "Optional: add the same URL as a contactPoint in Organization JSON-LD.",
    ],
  },
  {
    id: "T14",
    title: "randomuser.me still loaded on inner pages (technical half of #03)",
    files: "data/curricula/*.json · data/subjects/*.json · next.config.ts",
    problem:
      "Homepage tutors use S3 photos. Live /igcse-tutors and /mathematics-tutors still request randomuser.me (36 hits per page). That is a third-party dependency, privacy leak, and trust defect.",
    steps: [
      "Replace every photo URL in curriculum and subject JSON with the same S3 user photo pattern used for Sini/Meeno/Bonny, or a local /public placeholder.",
      "Do not ship randomuser.me or pexels URLs in production JSON.",
      "Remove those hostnames from next.config.ts remotePatterns after the JSON is clean.",
    ],
  },
];

const contentIssues = [
  {
    id: "C01",
    title: "Generic hero headline",
    detail:
      "Live H1 is still “Find expert online tutors across the UAE.” No differentiated claim (KHDA, app-first, pricing, proof).",
  },
  {
    id: "C02",
    title: "No tutoring price anywhere",
    detail:
      "No starting AED rate on homepage, FAQs, or inner pages. Homepage FAQ still says parents can filter by price.",
  },
  {
    id: "C03",
    title: "Testimonials are static and labelled verified",
    detail:
      "Pexels is gone. Homepage uses Sara Al Maktoum, James Whitfield, Fatima Rahman with no photos, dates, or source, plus “Verified reviews only.” Inner-page reviews are also hardcoded JSON.",
  },
  {
    id: "C04",
    title: "Sara Al Maktoum attribution",
    detail:
      "Hardcoded in Testimonials.tsx. That surname is associated with Dubai’s ruling family. There is no review source on the page.",
  },
  {
    id: "C05",
    title: "FAQ describes product behaviour the website does not have",
    detail:
      "Filters by location, availability, and price; call the tutor by entering a phone number. None of that exists on the site.",
  },
  {
    id: "C06",
    title: "Empty or thin resource/company pages",
    detail:
      "/blog and /study-tips are Coming Soon (noindex). About, Become a Tutor, GCSE are Coming Soon and indexable. Parent Guides and Exam Preparation each have one article. PDF #08 asked for 4–6 pillar blog posts.",
  },
  {
    id: "C07",
    title: "No App Store rating, free lesson, WhatsApp copy, or referral offer",
    detail:
      "PDF #06, #07, #12, #14 (copy side). Primary CTA remains Get the App with no rating badge and no risk-reversal offer.",
  },
  {
    id: "C08",
    title: "English-only; hreflang claims UAE English",
    detail:
      "html lang=en. No Arabic pages. /ar is Coming Soon. PDF #18.",
  },
  {
    id: "C09",
    title: "No city or grade landing pages",
    detail:
      "FAQ names all seven emirates. Sitemap has no /dubai or Year 11 URLs. PDF #09 and #10.",
  },
  {
    id: "C10",
    title: "Brand and trust presentation",
    detail:
      "CoachAcadem vs Coach Academ. TrustScore is four curriculum logos (American Curriculum missing), not a KHDA/app-rating trust score. Curricula numbered 1–5 as if they were steps. Download banner: “Made in the UAE / For your child's convenience.”",
  },
  {
    id: "C11",
    title: "Leftover stock persona in History reviews",
    detail: "data/subjects/history.json review author David Chen.",
  },
  {
    id: "C12",
    title: "Invented tutor counts and recycled tutor personas",
    detail:
      "IGCSE subject cards claim 22–48 tutors. Featured tutors reuse the same names and ratings across curricula. Photos on inner pages are still randomuser portraits (see T14).",
  },
  {
    id: "C13",
    title: "No exam calendar, school partnership page, subscriptions, or community",
    detail:
      "PDF #16 (one retake article only), #17, #19, #20. Parent progress dashboard (#13) is an app product item, not website copy.",
  },
  {
    id: "C14",
    title: "Google App Campaigns",
    detail:
      "PDF #15. Ads-account work, not page copy. No obvious gtag/GTM on the homepage fetch.",
  },
];

function drawHeaderBar(doc) {
  doc.save();
  doc.rect(0, 0, doc.page.width, 8).fill(NAVY);
  doc.rect(0, 8, doc.page.width, 3).fill(TEAL);
  doc.restore();
}

function footer(doc) {
  const y = doc.page.height - 36;
  doc.save();
  doc.moveTo(48, y - 8).lineTo(doc.page.width - 48, y - 8).strokeColor(RULE).lineWidth(0.5).stroke();
  doc.fillColor(MUTED).font("Helvetica").fontSize(8);
  doc.text(
    "CoachAcadem UAE  ·  Technical & content issues  ·  Confidential",
    48,
    y,
    { width: 320 }
  );
  doc.text(String(doc.page.number), doc.page.width - 72, y, {
    width: 24,
    align: "right",
  });
  doc.restore();
}

function ensureSpace(doc, h) {
  if (doc.y + h > doc.page.height - 56) {
    doc.addPage();
  }
}

function h1(doc, text) {
  ensureSpace(doc, 36);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text(text, 48, doc.y, {
    width: doc.page.width - 96,
  });
  doc.moveDown(0.4);
  doc.moveTo(48, doc.y).lineTo(120, doc.y).strokeColor(TEAL).lineWidth(2).stroke();
  doc.moveDown(0.8);
}

function h2(doc, text) {
  ensureSpace(doc, 28);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12).text(text, 48, doc.y, {
    width: doc.page.width - 96,
  });
  doc.moveDown(0.5);
}

function body(doc, text) {
  doc.fillColor(INK).font("Helvetica").fontSize(9.5).text(text, 48, doc.y, {
    width: doc.page.width - 96,
    lineGap: 2.5,
    align: "left",
  });
  doc.moveDown(0.55);
}

function muted(doc, text) {
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.5).text(text, 48, doc.y, {
    width: doc.page.width - 96,
    lineGap: 2,
  });
  doc.moveDown(0.4);
}

function pill(doc, label, color) {
  const x = 48;
  const y = doc.y;
  doc.save();
  doc.roundedRect(x, y, 62, 12, 2).fill(color);
  doc.fillColor("white").font("Helvetica-Bold").fontSize(7).text(label, x, y + 3, {
    width: 62,
    align: "center",
  });
  doc.restore();
  doc.y = y;
}

function issueHeading(doc, id, title, kind) {
  ensureSpace(doc, 52);
  const color =
    kind === "Technical" ? PILL_TECH : kind === "Content" ? PILL_CONTENT : PILL_BOTH;
  pill(doc, kind.toUpperCase().slice(0, 10), color);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11);
  doc.text(`${id}  ${title}`, 118, doc.y, { width: doc.page.width - 166 });
  doc.moveDown(0.45);
}

const doc = new PDFDocument({
  size: "A4",
  margin: 48,
  bufferPages: true,
  info: {
    Title: "CoachAcadem website — technical vs content issues",
    Author: "CoachAcadem site audit",
    Subject: "Live site vs growth report, 27 August 2026",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

doc.on("pageAdded", () => {
  drawHeaderBar(doc);
  doc.y = 28;
});

drawHeaderBar(doc);
doc.y = 56;

doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(9).text("COACHACADEM UAE  ·  WEBSITE AUDIT");
doc.moveDown(0.6);
doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22).text("Technical vs content issues");
doc.moveDown(0.25);
doc.fillColor(NAVY).font("Helvetica").fontSize(14).text("and how to fix the technical issues");
doc.moveDown(0.8);
body(
  doc,
  "Live site https://www.coachacadem.ae/ checked on 27 August 2026 against CoachAcadem_Growth_Strategy_Report.pdf (24 August 2026) and the nextjs-web-landing source. This document splits every open item into Technical or Content. Fix steps are given only for technical items. Content items are listed so copy, proof, and information architecture are not mixed into engineering work."
);
muted(
  doc,
  "Scope: marketing website only. In-app parent dashboard, paid Google App Campaigns setup, and school-partnership BD are noted as content/product, not website engineering."
);

h1(doc, "1. How to read this document");
body(
  doc,
  "Technical means a route, link, schema, store URL, crawl rule, asset, or script is wrong even if the page loads. Content means the words, proof, or missing pages/offers. Some PDF items are both (city pages need URLs and copy); those are split: engineering in Section 3, remaining copy in Section 4."
);
body(
  doc,
  "PDF score on 24 Aug: 2 done, 1 partial, 17 not started. Live on 27 Aug: 0 of the 20 fully closed, 6 partial (#01 Play Store, #02 reviews, #03 tutor photos, #08 resources, #11 schema, #16 retake article), 14 not started. Section 3 also includes defects the PDF 20 did not list."
);

h1(doc, "2. Inventory");
h2(doc, "Technical (fix in code)");
body(
  doc,
  "T01 Play Store / QR / header still Apple-first  ·  T02 Search is a dead hash  ·  T03 Catch-all Coming Soon indexed  ·  T04 Tutor profiles 404 / dead hashes  ·  T05 How it works → #home  ·  T06 JSON-LD inaccurate  ·  T07 Manifest placeholder + 500  ·  T08 Nav and JSON link empty URLs  ·  T09 Duplicate tutor/review DOM  ·  T10 Images, QR host, fonts  ·  T11 Hero rAF no-op  ·  T12 Sitemap lastmod / robots  ·  T13 No WhatsApp link  ·  T14 randomuser.me on inner pages"
);
h2(doc, "Content (copy, proof, IA — no engineering recipe here)");
body(
  doc,
  "C01 Generic hero  ·  C02 No pricing  ·  C03 Unverified testimonials  ·  C04 Al Maktoum attribution  ·  C05 FAQ vs product  ·  C06 Empty blog/about/GCSE  ·  C07 No rating badge / free lesson / referral  ·  C08 English-only  ·  C09 No city or grade pages  ·  C10 Brand + trust presentation  ·  C11 David Chen leftover  ·  C12 Fake tutor counts  ·  C13 Calendar / schools / subscriptions / community  ·  C14 Paid app campaigns"
);

h1(doc, "3. Technical issues — how to fix");

for (const item of techIssues) {
  issueHeading(doc, item.id, item.title, "Technical");
  muted(doc, `Files: ${item.files}`);
  doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(9).text("What is wrong", 48, doc.y, {
    width: doc.page.width - 96,
  });
  doc.moveDown(0.2);
  body(doc, item.problem);
  doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(9).text("How to fix", 48, doc.y, {
    width: doc.page.width - 96,
  });
  doc.moveDown(0.25);
  for (let i = 0; i < item.steps.length; i++) {
    ensureSpace(doc, 36);
    doc.fillColor(INK).font("Helvetica").fontSize(9.5).text(`${i + 1}.  ${item.steps[i]}`, 48, doc.y, {
      width: doc.page.width - 96,
      lineGap: 2,
    });
    doc.moveDown(0.35);
  }
  doc.moveDown(0.35);
  doc.moveTo(48, doc.y).lineTo(doc.page.width - 48, doc.y).strokeColor(RULE).lineWidth(0.4).stroke();
  doc.moveDown(0.7);
}

h1(doc, "4. Content issues — what they are");
body(
  doc,
  "These need copy, real reviews, real prices, or new published pages. They are not solved by the technical patches in Section 3 alone. T14 (photos) and T08 (stop linking empty URLs) only remove the engineering lie; someone still has to supply real tutor photos, prices, and articles."
);

for (const item of contentIssues) {
  issueHeading(doc, item.id, item.title, "Content");
  body(doc, item.detail);
  doc.moveDown(0.15);
}

h1(doc, "5. Suggested engineering order");
body(
  doc,
  "Do not treat this as a product roadmap. It is dependency order for the technical list so later content work is not built on broken links."
);
body(
  doc,
  "1) T03 noindex or 404 the catch-all, then T08 stop linking empty URLs. 2) T01 + T13 + T05 store links, WhatsApp, how-it-works id. 3) T02 search navigation. 4) T04 + T06 + T14 tutor hrefs, schema, randomuser removal. 5) T07 manifest. 6) T09 duplicate DOM. 7) T10 images/fonts, T11 hero loop, T12 sitemap."
);
muted(
  doc,
  "Sources: live HTML of /, /igcse-tutors, /mathematics-tutors, /blog, /parent-guides, /exam-preparation, /study-tips, /about-coachacadem, /gcse-tutors, /become-a-tutor, /igcse-mathematics-tutors, /tutors/sarah-hassan, sitemap.xml, robots.txt · 27 August 2026. Growth Strategy Report 24 August 2026. nextjs-web-landing source."
);

const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  footer(doc);
}

doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log("Wrote", outPath);

const footerLinks = {
  subjects: [
    { label: 'Mathematics Tutors', href: '/mathematics-tutors' },
    { label: 'Physics Tutors', href: '/physics-tutors' },
    { label: 'Chemistry Tutors', href: '/chemistry-tutors' },
    { label: 'Biology Tutors', href: '/biology-tutors' },
    { label: 'English Tutors', href: '/english-tutors' },
  ],
  curricula: [
    { label: 'IGCSE Tutors', href: '/igcse-tutors' },
    { label: 'IB Tutors', href: '/ib-tutors' },
    { label: 'A-Level Tutors', href: '/a-level-tutors' },
    { label: 'American Curriculum Tutors', href: '/american-curriculum-tutors' },
    { label: 'CBSE Tutors', href: '/cbse-tutors' },
  ],
  resources: [
    { label: 'Parent Guides', href: '/resources/parent-guides' },
    { label: 'Study Tips', href: '/resources/study-tips' },
    { label: 'Exam Preparation', href: '/resources/exam-preparation' },
    { label: 'Blog', href: '/blog' },
  ],
  company: [
    { label: 'Become a Tutor', href: '/become-a-tutor' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  ],
};

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
      {title}
    </h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="text-sm sm:text-base text-white hover:text-white/80 transition-colors"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="home-section home-section-spacing bg-gray-900 text-white">
      <div className="home-section-inner">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          <FooterColumn title="Subjects" links={footerLinks.subjects} />
          <FooterColumn title="Curricula" links={footerLinks.curricula} />
          <FooterColumn title="Resources" links={footerLinks.resources} />
          <FooterColumn title="Company" links={footerLinks.company} />
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-sm text-white">
          &copy; {new Date().getFullYear()} CoachAcadem. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

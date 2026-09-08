import type { Locale } from '@/lib/i18n/locale';
import { withLocale } from '@/lib/i18n/locale';
import Hero from '@/components/Hero';
import TrustScore from '@/components/TrustScore';
import SearchSubjectCirricula from '@/components/SearchSubjectCirricula';
import CirriculamCards from '@/components/HowItWorks';
import SubjectCards from '@/components/TutorLanguages';
import HowCoachacademWorks from '@/components/HowCoachacademWorks';
import TopTutorCards from '@/components/TopTutorCards';
import WhyParentsChooseCA from '@/components/WhyParentsChooseCA';
import Testimonials from '@/components/Testimonials';
import DownloadApp from '@/components/DownloadApp';
import FAQ from '@/components/FAQ';
import FaqJsonLd from '@/components/FaqJsonLd';
import QRCodeFloater from '@/components/QRCodeFloater';
import { t } from '@/lib/i18n/messages';

export default function HomeView({ locale }: { locale: Locale }) {
  const copy = t(locale);

  return (
    <>
      <FaqJsonLd faqs={copy.homeFaqs} />
      <Hero
        h1={copy.hero.h1}
        supporting={copy.hero.supporting}
        getTheApp={copy.getTheApp}
        scanToDownload={copy.scanToDownload}
      />
      <TrustScore title={copy.trust.title} />
      <SearchSubjectCirricula locale={locale} />
      <CirriculamCards
        title={copy.curricula.title}
        lead={copy.curricula.lead}
        cards={copy.curricula.cards.map((card, index) => ({
          ...card,
          step: index + 1,
          href: withLocale(card.href, locale),
        }))}
      />
      <SubjectCards locale={locale} />
      <HowCoachacademWorks
        title={copy.howItWorks.title}
        lead={copy.howItWorks.lead}
        steps={copy.howItWorks.steps}
      />
      <TopTutorCards locale={locale} />
      <WhyParentsChooseCA
        title={copy.whyParents.title}
        lead={copy.whyParents.lead}
        reasons={copy.whyParents.reasons}
      />
      <Testimonials
        title={copy.testimonials.title}
        testimonials={copy.testimonials.items}
        verifiedNote={copy.testimonials.verified}
      />
      <DownloadApp
        id="download-app"
        title={copy.download.title}
        supportingCopy={copy.download.supporting}
      />
      <FAQ title={copy.faqTitle} faqs={copy.homeFaqs} />
      <QRCodeFloater />
    </>
  );
}

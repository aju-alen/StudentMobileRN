import type { Metadata } from 'next';
import HomeView from '@/components/HomeView';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { t } from '@/lib/i18n/messages';

const copy = t('ar');

export const metadata: Metadata = definePageSeo({
  title: 'معلمون أونلاين في الإمارات | IGCSE والبكالوريا الدولية وA-Level | كوتش أكاديم',
  description: copy.hero.supporting,
  primaryKeywords: ['معلمون أونلاين الإمارات'],
  secondaryKeywords: [
    'دروس خصوصية الإمارات',
    'معلمو IGCSE دبي',
    'معلمو البكالوريا الدولية أبوظبي',
  ],
  path: '/ar',
  locale: 'ar',
  titleAbsolute: true,
});

export default function ArabicHome() {
  return <HomeView locale="ar" />;
}

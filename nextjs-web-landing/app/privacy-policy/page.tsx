import type { Metadata } from 'next';
import LegalPageView from '@/components/legal/LegalPageView';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { getRequestLocale } from '@/lib/i18n/get-request-locale';
import { getLegalChrome } from '@/lib/i18n/legal-chrome';
import { privacyPolicySections } from '@/lib/legal/privacy-policy-content';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const chrome = getLegalChrome('privacy', locale);
  return definePageSeo({
    title: chrome.seoTitle,
    description: chrome.seoDescription,
    primaryKeywords: chrome.primaryKeywords,
    path: chrome.path,
    locale,
    titleAbsolute: true,
  });
}

export default async function PrivacyPolicyPage() {
  const locale = await getRequestLocale();
  return (
    <LegalPageView
      locale={locale}
      chrome={getLegalChrome('privacy', locale)}
      sections={privacyPolicySections}
    />
  );
}

import type { Metadata } from 'next';
import LegalPageView from '@/components/legal/LegalPageView';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { getRequestLocale } from '@/lib/i18n/get-request-locale';
import { getLegalChrome } from '@/lib/i18n/legal-chrome';
import { childSafeguardingPolicySections } from '@/lib/legal/child-safeguarding-policy-content';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const chrome = getLegalChrome('safeguarding', locale);
  return definePageSeo({
    title: chrome.seoTitle,
    description: chrome.seoDescription,
    primaryKeywords: chrome.primaryKeywords,
    path: chrome.path,
    locale,
    titleAbsolute: true,
  });
}

export default async function ChildSafeguardingPolicyPage() {
  const locale = await getRequestLocale();
  return (
    <LegalPageView
      locale={locale}
      chrome={getLegalChrome('safeguarding', locale)}
      sections={childSafeguardingPolicySections}
    />
  );
}

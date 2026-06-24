import type { SubjectPageData } from './types';
import mathematics from '@/data/subjects/mathematics.json';
import physics from '@/data/subjects/physics.json';
import chemistry from '@/data/subjects/chemistry.json';
import biology from '@/data/subjects/biology.json';
import english from '@/data/subjects/english.json';
import arabic from '@/data/subjects/arabic.json';
import computerScience from '@/data/subjects/computer-science.json';
import businessStudies from '@/data/subjects/business-studies.json';
import economics from '@/data/subjects/economics.json';
import history from '@/data/subjects/history.json';
import geography from '@/data/subjects/geography.json';
import accounting from '@/data/subjects/accounting.json';
import french from '@/data/subjects/french.json';
import spanish from '@/data/subjects/spanish.json';
import science from '@/data/subjects/science.json';

const subjects: Record<string, SubjectPageData> = {
  [mathematics.slug]: mathematics as SubjectPageData,
  [physics.slug]: physics as SubjectPageData,
  [chemistry.slug]: chemistry as SubjectPageData,
  [biology.slug]: biology as SubjectPageData,
  [english.slug]: english as SubjectPageData,
  [arabic.slug]: arabic as SubjectPageData,
  [computerScience.slug]: computerScience as SubjectPageData,
  [businessStudies.slug]: businessStudies as SubjectPageData,
  [economics.slug]: economics as SubjectPageData,
  [history.slug]: history as SubjectPageData,
  [geography.slug]: geography as SubjectPageData,
  [accounting.slug]: accounting as SubjectPageData,
  [french.slug]: french as SubjectPageData,
  [spanish.slug]: spanish as SubjectPageData,
  [science.slug]: science as SubjectPageData,
};

export function getAllSubjectSlugs(): string[] {
  return Object.keys(subjects);
}

export function getSubjectBySlug(slug: string): SubjectPageData | undefined {
  return subjects[slug];
}

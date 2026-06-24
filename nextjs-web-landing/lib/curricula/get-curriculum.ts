import type { CurriculumPageData } from './types';
import igcse from '@/data/curricula/igcse.json';
import ib from '@/data/curricula/ib.json';
import aLevel from '@/data/curricula/a-level.json';
import americanCurriculum from '@/data/curricula/american-curriculum.json';
import cbse from '@/data/curricula/cbse.json';

const curricula: Record<string, CurriculumPageData> = {
  [igcse.slug]: igcse as CurriculumPageData,
  [ib.slug]: ib as CurriculumPageData,
  [aLevel.slug]: aLevel as CurriculumPageData,
  [americanCurriculum.slug]: americanCurriculum as CurriculumPageData,
  [cbse.slug]: cbse as CurriculumPageData,
};

export function getAllCurriculumSlugs(): string[] {
  return Object.keys(curricula);
}

export function getCurriculumBySlug(
  slug: string
): CurriculumPageData | undefined {
  return curricula[slug];
}

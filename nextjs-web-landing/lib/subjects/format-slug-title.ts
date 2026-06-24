const SPECIAL_WORDS: Record<string, string> = {
  igcse: 'IGCSE',
  ib: 'IB',
  cbse: 'CBSE',
  uae: 'UAE',
  esl: 'ESL',
};

export function formatSubjectSlugTitle(slug: string): string {
  const hasTutorsSuffix = slug.endsWith('-tutors');
  const base = hasTutorsSuffix ? slug.slice(0, -'-tutors'.length) : slug;

  const words = base
    .split('-')
    .flatMap((word, index, parts) => {
      if (word === 'a' && parts[index + 1] === 'level') {
        return ['A-Level'];
      }
      if (word === 'level' && parts[index - 1] === 'a') {
        return [];
      }

      const special = SPECIAL_WORDS[word.toLowerCase()];
      if (special) {
        return [special];
      }

      return [word.charAt(0).toUpperCase() + word.slice(1)];
    })
    .filter(Boolean);

  const title = words.join(' ');
  return hasTutorsSuffix ? `${title} Tutors` : title;
}

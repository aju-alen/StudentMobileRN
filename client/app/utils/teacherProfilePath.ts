export const TEACHER_PROFILE_WEB_ORIGIN = 'https://www.coachacadem.ae';

const TEACHER_PATH_RE = /(?:^|\/)teacher\/([^/?#]+)/;

export function getTeacherProfileShareUrl(userId: string) {
  return `${TEACHER_PROFILE_WEB_ORIGIN}/teacher/${userId}`;
}

export function getTeacherProfileAppPath(userId: string) {
  return `/(tabs)/home/singleProfile/${userId}`;
}

export function parseTeacherIdFromUrl(input?: string | null): string | null {
  if (!input) return null;

  try {
    if (input.includes('://')) {
      const url = new URL(input);
      if (url.hostname === 'teacher') {
        const id = url.pathname.replace(/^\//, '').split('/')[0];
        return id || null;
      }
      const fromPath = url.pathname.match(TEACHER_PATH_RE);
      if (fromPath?.[1]) return fromPath[1];
    }
  } catch {
    // Fall through to regex on the raw string.
  }

  const match = input.match(TEACHER_PATH_RE);
  return match?.[1] ?? null;
}

import { parseTeacherIdFromUrl } from './utils/teacherProfilePath';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  const teacherId = parseTeacherIdFromUrl(path);
  if (teacherId) {
    return `/teacher/${teacherId}`;
  }
  return path;
}

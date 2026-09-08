import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTeacherProfileAppPath } from './teacherProfilePath';

export {
  TEACHER_PROFILE_WEB_ORIGIN,
  getTeacherProfileShareUrl,
  getTeacherProfileAppPath,
  parseTeacherIdFromUrl,
} from './teacherProfilePath';

export const PENDING_TEACHER_PROFILE_KEY = 'pendingTeacherProfileId';

export async function setPendingTeacherProfileId(teacherId: string) {
  await AsyncStorage.setItem(PENDING_TEACHER_PROFILE_KEY, teacherId);
}

export async function consumePendingTeacherProfileId(): Promise<string | null> {
  const teacherId = await AsyncStorage.getItem(PENDING_TEACHER_PROFILE_KEY);
  if (!teacherId) return null;
  await AsyncStorage.removeItem(PENDING_TEACHER_PROFILE_KEY);
  return teacherId;
}

export async function getPostAuthHref(): Promise<string> {
  const teacherId = await consumePendingTeacherProfileId();
  if (teacherId) return getTeacherProfileAppPath(teacherId);
  return '/(tabs)/home';
}

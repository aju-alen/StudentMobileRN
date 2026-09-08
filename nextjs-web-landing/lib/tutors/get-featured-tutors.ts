import { API_BASE_URL, FEATURED_TEACHER_USER_IDS } from '@/lib/constants';
import type { FeaturedTutor } from '@/lib/subjects/types';

type TeacherSubject = {
  subjectName: string;
  subjectBoard: string;
  subjectVerification?: boolean;
};

type TeacherApiResponse = {
  id: string;
  name: string;
  profileImage: string | null;
  userDescription: string;
  userType: string;
  subjects: TeacherSubject[];
};

const BOARD_LABELS: Record<string, string> = {
  AP: 'American Curriculum',
  IGCSE: 'IGCSE',
  GCSE: 'GCSE',
  IB: 'IB',
  CBSE: 'CBSE',
  'A-LEVEL': 'A-Level',
  'A LEVEL': 'A-Level',
  AMERICAN: 'American Curriculum',
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function mapBoard(board: string) {
  const key = board.trim().toUpperCase();
  return BOARD_LABELS[key] ?? board.trim();
}

function mapTeacherToFeatured(teacher: TeacherApiResponse): FeaturedTutor {
  const paragraphs = teacher.userDescription
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const qualification = paragraphs[0] || teacher.name;
  const yearsMatch = teacher.userDescription.match(
    /(\d+)\s+years? of teaching/i
  );

  const subjects = unique(
    teacher.subjects.map((subject) =>
      /math/i.test(subject.subjectName)
        ? 'Mathematics'
        : subject.subjectName.split(' - ')[0].trim()
    )
  );
  const curricula = unique(
    teacher.subjects.map((subject) => mapBoard(subject.subjectBoard))
  );

  if (/IGCSE/i.test(teacher.userDescription) && !curricula.includes('IGCSE')) {
    curricula.unshift('IGCSE');
  }
  if (
    /American Curriculum/i.test(teacher.userDescription) &&
    !curricula.includes('American Curriculum')
  ) {
    curricula.push('American Curriculum');
  }

  return {
    id: teacher.id,
    name: teacher.name,
    photo: teacher.profileImage || '',
    qualification,
    subjects: subjects.length ? subjects : ['Mathematics'],
    curricula,
    yearsExperience: yearsMatch ? Number(yearsMatch[1]) : undefined,
    profileHref: `/teacher/${teacher.id}`,
  };
}

async function fetchTeacherByUserId(
  userId: string
): Promise<FeaturedTutor | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/teacher/profile/${userId}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return null;
    }

    const teacher = (await response.json()) as TeacherApiResponse;
    if (teacher.userType !== 'TEACHER' || !teacher.name) {
      return null;
    }

    return mapTeacherToFeatured(teacher);
  } catch {
    return null;
  }
}

export async function getFeaturedTutors(): Promise<FeaturedTutor[]> {
  const tutors = await Promise.all(
    FEATURED_TEACHER_USER_IDS.map((userId) => fetchTeacherByUserId(userId))
  );

  return tutors.filter((tutor): tutor is FeaturedTutor => tutor !== null);
}

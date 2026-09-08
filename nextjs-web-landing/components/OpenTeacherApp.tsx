'use client';

import { useEffect } from 'react';

export default function OpenTeacherApp({ teacherId }: { teacherId: string }) {
  useEffect(() => {
    if (!teacherId) return;

    const appLink = `coachacadem://teacher/${encodeURIComponent(teacherId)}`;
    const timer = window.setTimeout(() => {
      window.location.href = appLink;
    }, 50);

    return () => window.clearTimeout(timer);
  }, [teacherId]);

  return null;
}

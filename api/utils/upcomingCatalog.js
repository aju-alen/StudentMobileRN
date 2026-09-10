/**
 * Prisma filter for catalog listings.
 * 1-on-1 / single-package courses have no fixed start and always appear.
 * Group class: hide after scheduledDateTime.
 * Group package: hide once any topic session has started (or none remain).
 */
export function upcomingCatalogFilter(now = new Date()) {
  return {
    OR: [
      { courseType: { in: ['SINGLE_STUDENT', 'SINGLE_PACKAGE'] } },
      {
        courseType: 'MULTI_STUDENT',
        scheduledDateTime: { gt: now },
      },
      {
        courseType: 'MULTI_PACKAGE',
        AND: [
          { subjectTopics: { none: { scheduledAt: { lte: now } } } },
          { subjectTopics: { some: { scheduledAt: { gt: now } } } },
        ],
      },
    ],
  };
}

export function withUpcomingCatalog(where = {}, now = new Date()) {
  return {
    AND: [where, upcomingCatalogFilter(now)],
  };
}

export function isFixedSchedulePast(subject, now = new Date()) {
  const t = now.getTime();
  if (subject?.courseType === 'MULTI_STUDENT') {
    if (!subject.scheduledDateTime) return false;
    return new Date(subject.scheduledDateTime).getTime() <= t;
  }
  if (subject?.courseType === 'MULTI_PACKAGE') {
    const times = (subject.subjectTopics || [])
      .map((topic) => topic.scheduledAt)
      .filter(Boolean)
      .map((value) => new Date(value).getTime());
    if (!times.length) return false;
    return times.some((ms) => ms <= t);
  }
  return false;
}

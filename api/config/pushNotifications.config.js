/**
 * Push notification configuration.
 * Add new notification types by adding entries to NOTIFICATION_TYPES.
 */
export const PUSH_CONFIG = {
  /** Platforms to send to. Set to ['ios'] for iOS-only. */
  platforms: ['ios'],

  /** Notification type definitions. Key = trigger identifier. */
  NOTIFICATION_TYPES: {
    NEW_COURSE: {
      title: 'New Course Created',
      bodyTemplate: (ctx) => `${ctx.subjectName} by ${ctx.teacherName || 'a teacher'} needs verification.`,
      dataKeys: ['subjectId', 'type'],
      recipientQuery: { userType: 'ADMIN', pushToken: { not: null } },
    },
    NEW_SIGNUP: {
      title: 'New account registered',
      bodyTemplate: (ctx) => `${ctx.userName || 'A user'} registered as ${ctx.userType || 'a new user'}.`,
      dataKeys: ['userType'],
      recipientQuery: { userType: 'ADMIN', pushToken: { not: null } },
    },
    COURSE_PURCHASE: {
      title: 'Course purchased',
      bodyTemplate: (ctx) => `${ctx.studentName || 'A student'} purchased ${ctx.subjectName || 'a course'}${ctx.amountAed ? ` (AED ${ctx.amountAed})` : ''}.`,
      dataKeys: ['subjectId'],
      recipientQuery: { userType: 'ADMIN', pushToken: { not: null } },
    },
    CLASS_REMINDER: {
      title: 'Class starting soon',
      bodyTemplate: (ctx) => `${ctx.subjectName || 'Your class'} starts in 5 minutes.`,
      dataKeys: ['subjectId', 'sourceType', 'sourceId'],
    },
  },
};

export const getNotificationConfig = (type) => PUSH_CONFIG.NOTIFICATION_TYPES[type];
export const getEnabledPlatforms = () => PUSH_CONFIG.platforms;

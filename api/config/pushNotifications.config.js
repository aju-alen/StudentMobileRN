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
  },
};

export const getNotificationConfig = (type) => PUSH_CONFIG.NOTIFICATION_TYPES[type];
export const getEnabledPlatforms = () => PUSH_CONFIG.platforms;

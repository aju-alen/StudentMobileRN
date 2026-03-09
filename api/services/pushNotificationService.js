import { getNotificationConfig, getEnabledPlatforms } from '../config/pushNotifications.config.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sendToExpo = async (token, { title, body, data }) => {
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: token, sound: 'default', title, body, data }),
    });
    const result = await res.json();
    if (result.data?.[0]?.status === 'error') {
      console.error('Expo push error:', result.data[0].message);
    }
  } catch (err) {
    console.error('Error sending push:', err);
  }
};

/**
 * Send notification by type. Context is passed to bodyTemplate.
 * @param {string} type - Key from pushNotifications.config.js NOTIFICATION_TYPES
 * @param {object} context - Data for bodyTemplate (e.g. { subjectName, teacherName, subjectId })
 */
export const sendNotificationByType = async (type, context = {}) => {
  const config = getNotificationConfig(type);
  if (!config) {
    console.warn(`Push config not found for type: ${type}`);
    return;
  }

  const platforms = getEnabledPlatforms();
  if (platforms.length === 0) return;

  const title = config.title;
  const body = typeof config.bodyTemplate === 'function'
    ? config.bodyTemplate(context)
    : config.bodyTemplate;
  const data = {};
  (config.dataKeys || []).forEach((k) => {
    if (context[k] != null) data[k] = String(context[k]);
  });
  data.type = type;

  const users = await prisma.user.findMany({
    where: config.recipientQuery,
    select: { pushToken: true },
  });

  for (const user of users) {
    if (user.pushToken) await sendToExpo(user.pushToken, { title, body, data });
  }
};

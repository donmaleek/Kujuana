import { logger } from '../../config/logger.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export const pushService = {
  async send(tokens: string[], title: string, body: string, data?: Record<string, unknown>) {
    const messages = tokens.map((to) => ({
      to,
      title,
      body,
      data,
      sound: 'default',
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, 'Push notification failed');
      return;
    }

    logger.info({ count: tokens.length, title }, 'Push notifications sent');
  },
};

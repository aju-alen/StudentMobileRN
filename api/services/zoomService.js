import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

let accessToken = null;

export const getZoomAccessToken = async () => {
  if (accessToken) return accessToken;

  const res = await axios.post('https://zoom.us/oauth/token', null, {
    params: {
      grant_type: 'account_credentials',
      account_id: process.env.ZOOM_ACCOUNT_ID,
    },
    auth: {
      username: process.env.ZOOM_CLIENT_ID,
      password: process.env.ZOOM_CLIENT_SECRET,
    },
  });

  accessToken = res.data.access_token;
  setTimeout(() => (accessToken = null), 3500 * 1000);

  return accessToken;
};

export const createZoomMeeting = async (hostEmail, topic, startTime) => {
    
  const token = await getZoomAccessToken();
console.log(token);

  const res = await axios.post(
    `https://api.zoom.us/v2/users/${hostEmail}/meetings`,
    {
      topic,
      type: 2,
      start_time: startTime,
      duration: 60,
      timezone: 'UTC',
      settings: {
        join_before_host: true,
      },
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  console.log(res.data);
  return res.data;
};

export const updateZoomMeeting = async (meetingId, updates) => {
  const token = await getZoomAccessToken();

  await axios.patch(
    `https://api.zoom.us/v2/meetings/${meetingId}`,
    updates,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return { success: true };
};

export const deleteZoomMeeting = async (meetingId) => {
  const token = await getZoomAccessToken();

  await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return { deleted: true };
};

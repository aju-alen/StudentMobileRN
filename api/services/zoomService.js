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

export const createZoomMeeting = async (hostEmail, topic, startTime, bookingTimeInMinutes) => {
  const token = await getZoomAccessToken();
  console.log(token);
  console.log(hostEmail, topic, startTime, bookingTimeInMinutes, 'hostEmail, topic, startTime, bookingTimeInMinutes');

  try {
    const res = await axios.post(
      `https://api.zoom.us/v2/users/${hostEmail}/meetings`,
      {
        topic: topic,
        type: 2,
        start_time: startTime,
        duration: bookingTimeInMinutes,
        timezone: 'Asia/Dubai',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          meeting_authentication: true
        }
      },
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error.response?.data || error.message);
  }
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

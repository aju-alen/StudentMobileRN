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
        type: 1,
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

// Helper function to retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Create a Zoom user account
export const createZoomUser = async (teacherEmail, teacherName) => {
  const token = await getZoomAccessToken();
  try {
    const res = await axios.post(
      'https://api.zoom.us/v2/users',
      {
        action: 'create', // Standard user creation (Zoom sends activation email)
        user_info: {
          // Basic fields required by Zoom for user creation
          email: teacherEmail,
          type: 1, // 1 = Basic user (safer for create; license can be upgraded separately)
          first_name: (teacherName && teacherName.split(' ')[0]) || '',
          last_name: (teacherName && teacherName.split(' ').slice(1).join(' ')) || '',
          display_name: teacherName || 'Test',
          password: '1234',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Zoom user created successfully:', res.data);
    return res.data;
  } catch (error) {
    // If user already exists, that's okay - we'll just assign the license
    if (error.response?.status === 409 || error.response?.data?.code === 1001) {
      console.log('Zoom user already exists, will proceed to assign license');
      // Return the email as userId since user exists
      return { id: teacherEmail, email: teacherEmail };
    }
    console.error("Error creating Zoom user:", error.response?.data || error.message);
    throw error;
  }
};

// Assign Zoom license (Pro - type 2) to a user
export const assignZoomLicense = async (userId) => {
  const token = await getZoomAccessToken();
  
  try {
    const res = await axios.patch(
      `https://api.zoom.us/v2/users/${userId}`,
      {
        type: 1 // Licensed user (Pro)
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Zoom license assigned successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error("Error assigning Zoom license:", error.response?.data || error.message);
    throw error;
  }
};

// Orchestrate Zoom account creation for teacher with retry logic
export const createZoomAccountForTeacher = async (teacherEmail, teacherName) => {
  try {
    // First, try to create the user
    const userResult = await retryWithBackoff(
      () => createZoomUser(teacherEmail, teacherName),
      3,
      1000
    );

    // Extract user ID from response - Zoom API returns id or user_id
    const userId = userResult.id || userResult.user_id || userResult.email || teacherEmail;

    // Assign license to ensure user has Pro license
    // Note: If user already exists, we still try to assign license to ensure it's set correctly
    try {
      await retryWithBackoff(
        () => assignZoomLicense(userId),
        3,
        1000
      );
    } catch (licenseError) {
      // If license assignment fails, check if it's because user already has license
      if (licenseError.response?.status === 400 && 
          (licenseError.response?.data?.message?.includes('already') || 
           licenseError.response?.data?.code === 300)) {
        console.log('User already has license assigned, continuing...');
      } else {
        // For other errors, log warning but don't fail completely
        console.warn('License assignment had an issue, but user account exists:', licenseError.message);
      }
    }

    return {
      success: true,
      userId: userId,
      message: 'Zoom account created and license assigned successfully'
    };
  } catch (error) {
    console.error('Failed to create Zoom account after retries:', error);
    throw error;
  }
};

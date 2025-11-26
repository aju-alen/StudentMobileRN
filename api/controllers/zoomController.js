import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import {
  createZoomMeeting,
  updateZoomMeeting,
  deleteZoomMeeting,
} from '../services/zoomService.js';
import { createZoomMeetingsForTeacherBookings } from '../services/bookingZoomService.js';

const prisma = new PrismaClient();

export const createMeeting = async (req, res) => {
  const { email, topic, startTime } = req.body;

  try {
    const meeting = await createZoomMeeting(email, topic, startTime);
    console.log(meeting);
    db[meeting.id] = meeting;
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMeeting = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    await updateZoomMeeting(id, updates);
    db[id] = { ...db[id], ...updates };
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMeeting = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the meeting in Zoom
    await deleteZoomMeeting(id);

    // Clear Zoom details from any related bookings (if present)
    await prisma.booking.updateMany({
      where: { bookingZoomId: Number(id) },
      data: {
        bookingZoomUrl: '',
        bookingZoomPassword: '',
        bookingZoomId: 0,
      },
    });

    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMeeting = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || !booking.bookingZoomUrl) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ join_url: booking.bookingZoomUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Zoom webhook handler for user activation events
export const zoomWebhook = async (req, res) => {
  try {
    const rawBody = req.body;

    // Verify Zoom webhook signature using x-zm-signature and x-zm-request-timestamp
    const zoomSignature = req.headers['x-zm-signature'];
    const zoomTimestamp = req.headers['x-zm-request-timestamp'];
    const secretToken = process.env.ZOOM_SECRET_TOKEN || '';

    if (!zoomSignature || !zoomTimestamp || !secretToken) {
      console.error('Missing Zoom signature, timestamp, or secret token');
      return res.status(400).json({ message: 'Invalid Zoom webhook headers' });
    }

    const bodyString = rawBody.toString();
    const message = `v0:${zoomTimestamp}:${bodyString}`;

    const hashForVerify = crypto
      .createHmac('sha256', secretToken)
      .update(message)
      .digest('hex');

    const expectedSignature = `v0=${hashForVerify}`;

    if (zoomSignature !== expectedSignature) {
      console.error('Invalid Zoom webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Zoom sends endpoint.url_validation when setting up / validating the webhook
    let event;
    try {
      event = JSON.parse(bodyString);
    } catch (parseErr) {
      console.error('Failed to parse Zoom webhook body as JSON', parseErr);
      return res.status(400).json({ message: 'Invalid JSON' });
    }

    if (event.event === 'endpoint.url_validation') {
      const plainToken = event.payload?.plainToken;
      const secretToken = process.env.ZOOM_SECRET_TOKEN || '';

      const hashForValidate = crypto
        .createHmac('sha256', secretToken)
        .update(plainToken)
        .digest('hex');

      return res.status(200).json({
        plainToken,
        encryptedToken: hashForValidate,
      });
    }

    // Basic logging of the received event
    console.log('Received Zoom webhook event:', event.event);

    // Handle user activation / updated event
    if (event.event && event.event.startsWith('user.')) {
      const userObject = event.payload?.object || {};
      const email = userObject.email || userObject.login || null;

      if (email) {
        console.log('Handling Zoom user event for email:', email);
        try {
          await createZoomMeetingsForTeacherBookings(email);
        } catch (handlerErr) {
          console.error('Error handling Zoom user activation for email:', email, handlerErr);
        }
      } else {
        console.log('Zoom user event received without email in payload');
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error in zoomWebhook handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

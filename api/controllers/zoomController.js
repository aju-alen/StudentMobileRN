import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import {
  createZoomMeeting,
  updateZoomMeeting,
  deleteZoomMeeting,
} from '../services/zoomService.js';
import { createZoomMeetingsForTeacherBookings } from '../services/bookingZoomService.js';

const prisma = new PrismaClient();
const resend = new Resend(process.env.COACH_ACADEM_RESEND_API_KEY);

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
    console.log('Zoom webhook invoked');
    const rawBody = req.body;

    // req.body must be raw (Buffer) for signature verification; if already parsed by another middleware, use it as object
    let bodyString;
    let event;
    if (Buffer.isBuffer(rawBody)) {
      bodyString = rawBody.toString('utf8');
      try {
        event = JSON.parse(bodyString);
      } catch (parseErr) {
        console.error('Failed to parse Zoom webhook body as JSON', parseErr);
        return res.status(400).json({ message: 'Invalid JSON' });
      }
    } else if (typeof rawBody === 'object' && rawBody !== null) {
      bodyString = JSON.stringify(rawBody);
      event = rawBody;
      console.warn('Zoom webhook: body was already parsed (not raw Buffer). Signature verification may fail.');
    } else {
      console.error('Zoom webhook: unexpected body type', typeof rawBody);
      return res.status(400).json({ message: 'Invalid request body' });
    }

    console.log('Zoom webhook event:', event.event);

    const secretToken = process.env.ZOOM_SECRET_TOKEN || '';

    // Handle endpoint.url_validation FIRST (before signature check) so Zoom can connect the webhook.
    // Zoom sends this when you add/save the webhook URL; it does not require signature verification.
    if (event.event === 'endpoint.url_validation') {
      const plainToken = event.payload?.plainToken;
      if (!plainToken) {
        console.error('Zoom url_validation missing plainToken');
        return res.status(400).json({ message: 'Missing plainToken' });
      }
      const hashForValidate = crypto
        .createHmac('sha256', secretToken)
        .update(plainToken)
        .digest('hex');
      console.log('Zoom webhook: responding to url_validation');
      return res.status(200).json({
        plainToken,
        encryptedToken: hashForValidate,
      });
    }

    // For all other events, verify Zoom webhook signature (skip if ZOOM_SKIP_VERIFY=true for local debugging)
    const zoomSignature = req.headers['x-zm-signature'];
    const zoomTimestamp = req.headers['x-zm-request-timestamp'];
    const skipVerify = process.env.ZOOM_SKIP_VERIFY === 'true';

    if (!skipVerify) {
      if (!zoomSignature || !zoomTimestamp || !secretToken) {
        console.error('Missing Zoom signature, timestamp, or secret token');
        return res.status(400).json({ message: 'Invalid Zoom webhook headers' });
      }

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
    } else {
      console.warn('Zoom webhook: signature verification skipped (ZOOM_SKIP_VERIFY=true)');
    }

    // Handle user activation / updated event (user.created, user.activated, etc.)
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
        console.log('Zoom user event received without email in payload. Payload object keys:', userObject ? Object.keys(userObject) : 'none');
      }
    }

    // Handle user invitation accepted or activated (send "Zoom account ready" email)
    const isInvitationAcceptedOrActivated =
      event.event === 'user.invitation_accepted' ||
      event.event === 'user.activated';
    if (isInvitationAcceptedOrActivated) {
      const payload = event.payload || {};
      const userObject = payload.object || payload || {};
      const zoomEmail = userObject.email || userObject.login || null;
      const zoomFirstName = userObject.first_name || userObject.firstName || '';
      const zoomLastName = userObject.last_name || userObject.lastName || '';
      console.log('Processing Zoom invitation/accepted or activated. event:', event.event, 'zoomEmail:', zoomEmail);

      if (zoomEmail) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: zoomEmail.toLowerCase() },
          });

          if (user) {
            const teacherProfile = await prisma.teacherProfile.findUnique({
              where: { userId: user.id },
            });

            if (teacherProfile) {
              await prisma.teacherProfile.update({
                where: { id: teacherProfile.id },
                data: { zoomUserAcceptedInvite: true },
              });
              console.log('Updated zoomUserAcceptedInvite for user:', user.id);

              await resend.emails.send({
                from: `Support <${process.env.COACH_ACADEM_RESEND_EMAIL}>`,
                to: user.email,
                subject: 'Your Zoom account is ready – start creating courses',
                html: `
                  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
                    <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
                      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                        <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                        <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
                      </div>
                      <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Zoom Account Ready</h1>
                    </div>
                    <div style="padding: 40px 20px; background-color: #ffffff;">
                      <p style="font-size: 20px; color: #1A2B4B; font-weight: 700;">Hello ${user.name},</p>
                      <p style="font-size: 16px; margin-top: 20px; color: #64748B;">Your Zoom account has been successfully created and linked to Coach Academ.</p>
                      <p style="font-size: 16px; margin-top: 20px; color: #64748B;"><strong>Account details:</strong></p>
                      <ul style="font-size: 16px; line-height: 1.6; color: #64748B;">
                        <li>Email: ${user.email}</li>
                        <li>Zoom account: ${zoomFirstName || zoomLastName ? [zoomFirstName, zoomLastName].filter(Boolean).join(' ') : user.name}</li>
                      </ul>
                      <p style="font-size: 16px; margin-top: 20px; color: #64748B;">You can now start creating courses and scheduling live sessions with your students. Your Zoom meetings will be created automatically when you add subjects and students book with you.</p>
                      <p style="font-size: 16px; margin-top: 20px; color: #64748B;">If you have any questions, contact us at <a href="mailto:support@coachacadem.ae" style="color: #1A2B4B; text-decoration: underline;">support@coachacadem.ae</a>.</p>
                      <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                        <p style="color: #64748B; font-size: 14px; margin: 0;">The Coach Academ Team</p>
                      </div>
                    </div>
                  </div>
                `,
              });
              console.log('Sent Zoom account ready email to:', user.email);
            }
          }
        } catch (err) {
          console.error('Error updating zoomUserAcceptedInvite for email:', zoomEmail, err);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error in zoomWebhook handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

import { Resend } from 'resend';

const resend = new Resend(process.env.COACH_ACADEM_RESEND_API_KEY);

export const OPS_NOTIFY_EMAILS = [
  'emachodi254@gmail.com',
  'michael.literati@gmail.com',
];

export const escHtml = (s) =>
  (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const sendOpsNotifyEmail = async ({ subject, title, rows = [], intro = '' }) => {
  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;color:#64748B;font-size:13px;border-bottom:1px solid #F1F5F9;">${escHtml(label)}</td><td style="padding:8px 12px;color:#1A2B4B;font-size:14px;border-bottom:1px solid #F1F5F9;">${escHtml(value)}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
      <div style="background-color: #1A2B4B; padding: 32px 20px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${escHtml(title)}</h1>
      </div>
      <div style="padding: 32px 20px;">
        ${intro ? `<p style="color:#64748B;font-size:16px;line-height:1.6;">${escHtml(intro)}</p>` : ''}
        <div style="background-color:#F8FAFC;padding:8px 0;border-left:4px solid #1A2B4B;">
          <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
        </div>
        <p style="color:#1A2B4B;font-size:16px;font-weight:700;margin:24px 0 0;">Coach Academ ops</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `Support <${process.env.COACH_ACADEM_RESEND_EMAIL}>`,
      to: OPS_NOTIFY_EMAILS,
      subject,
      html,
    });
  } catch (err) {
    console.error('Error sending ops notify email', err);
  }
};

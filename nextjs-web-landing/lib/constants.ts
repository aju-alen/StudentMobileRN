import { CANONICAL_SITE_ORIGIN } from "./seo/site";

export {
  CANONICAL_SITE_ORIGIN,
  CANONICAL_SITE_URL,
  canonicalUrl,
  siteConfig,
} from "./seo/site";

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/coach-academ/id6745173635";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.rise.coachacadem&hl=en";

/** Landing that shows both store buttons — used in QR codes so Android scanners are not sent to iOS. */
export const APP_DOWNLOAD_LANDING = `${CANONICAL_SITE_ORIGIN}/#download-app`;

export const APP_DOWNLOAD_QR = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(APP_DOWNLOAD_LANDING)}`;

export const S3_BASE =
  "https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image";

/**
 * WhatsApp Business number as international digits only.
 * Override with NEXT_PUBLIC_WHATSAPP_NUMBER if needed.
 */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567791074"
).replace(/\D/g, "");

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello CoachAcadem, I would like to enquire about a tutor for my child in the UAE.";

export const WHATSAPP_DEFAULT_MESSAGE_AR =
  "مرحباً كوتش أكاديم، أود الاستفسار عن معلم لابني/ابنتي في الإمارات.";

export function whatsappUrl(message = WHATSAPP_DEFAULT_MESSAGE): string {
  const text = encodeURIComponent(message);
  if (!WHATSAPP_NUMBER) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

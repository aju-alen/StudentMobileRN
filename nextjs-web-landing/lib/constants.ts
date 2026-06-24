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

export const APP_DOWNLOAD_QR = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(APP_STORE_URL)}`;

export const S3_BASE =
  "https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image";
